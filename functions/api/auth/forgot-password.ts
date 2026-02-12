import { sendEmail } from '../../utils/email';

interface Env {
    DB: D1Database;
    RESEND_API_KEY: string;
    BASE_URL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { email } = await request.json() as { email: string };

        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
        }

        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first() as any;

        // Security best practice: don't reveal if user exists, but for a small app it might be okay.
        // We'll just return success either way.
        if (!user) {
            return new Response(JSON.stringify({ success: true, message: "If an account exists, a reset link has been sent." }));
        }

        const resetToken = crypto.randomUUID();
        const expires = Date.now() + (1 * 60 * 60 * 1000); // 1 hour

        await env.DB.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?")
            .bind(resetToken, expires, user.id)
            .run();

        const baseUrl = env.BASE_URL || new URL(request.url).origin;
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        try {
            await sendEmail(
                env.RESEND_API_KEY,
                email,
                "Reset your Sprout password",
                `<h1>Password Reset</h1><p>You requested a password reset. Click the link below to set a new password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link will expire in 1 hour.</p>`
            );
        } catch (emailErr) {
            console.error("Failed to send reset email:", emailErr);
            return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, message: "Reset link sent!" }));

    } catch (err) {
        console.error("Forgot Password Error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
