interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { email, password } = await request.json() as any;

        if (!email || !password) {
            return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400 });
        }

        // Find user
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
        }

        // Verify password
        const encoder = new TextEncoder();
        const data = encoder.encode(password + user.salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const passHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        if (passHash !== user.password_hash) {
            return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
        }

        // Create session
        const sessionId = crypto.randomUUID();
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        const createdAt = Date.now();

        await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
        ).bind(sessionId, user.id, expiresAt, createdAt).run();

        const cookie = `sprout_session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;

        // Get user's spaces
        const spaces = await env.DB.prepare("SELECT * FROM spaces WHERE owner_id = ?").bind(user.public_id).all();

        return new Response(JSON.stringify({
            success: true,
            user: { id: user.public_id, email: user.email },
            spaces: spaces.results
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookie
            }
        });
    } catch (err: any) {
        console.error("Login Error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
