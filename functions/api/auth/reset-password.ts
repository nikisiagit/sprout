interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { token, password } = await request.json() as { token: string, password: string };

        if (!token || !password) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const user = await env.DB.prepare("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?")
            .bind(token, Date.now())
            .first() as any;

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid or expired reset token" }), { status: 400 });
        }

        // Hash new password
        const salt = crypto.randomUUID();
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const passHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        await env.DB.prepare("UPDATE users SET password_hash = ?, salt = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?")
            .bind(passHash, salt, user.id)
            .run();

        return new Response(JSON.stringify({ success: true, message: "Password updated successfully!" }));

    } catch (err) {
        console.error("Reset Password Error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
