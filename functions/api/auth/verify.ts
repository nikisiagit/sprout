interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return new Response(JSON.stringify({ error: "Missing verification token" }), { status: 400 });
    }

    try {
        const user = await env.DB.prepare("SELECT * FROM users WHERE verification_token = ?").bind(token).first() as any;

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 400 });
        }

        await env.DB.prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?").bind(user.id).run();

        // Redirect to a success page or just return JSON
        // For now, let's redirect to login with a success message
        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/login?verified=true'
            }
        });
    } catch (err) {
        console.error("Verification Error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
