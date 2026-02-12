interface Env {
    DB: D1Database;
    GOOGLE_CLIENT_ID: string;
    RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { credential } = await request.json() as { credential: string };

        if (!credential) {
            return new Response(JSON.stringify({ error: "Missing Google ID token" }), { status: 400 });
        }

        // Verify the ID token (simplified for now - we should ideally verify it with Google's certs)
        // However, a quick way is to hit the tokeninfo endpoint
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!verifyRes.ok) {
            return new Response(JSON.stringify({ error: "Invalid Google ID token" }), { status: 401 });
        }

        const payload = await verifyRes.json() as any;
        const { sub, email, name, picture, email_verified } = payload;

        if (payload.aud !== env.GOOGLE_CLIENT_ID) {
            return new Response(JSON.stringify({ error: "Invalid audience" }), { status: 401 });
        }

        // 1. Check if user exists by google_id or email
        let user = await env.DB.prepare("SELECT * FROM users WHERE google_id = ? OR email = ?")
            .bind(sub, email)
            .first() as any;

        const createdAt = Date.now();
        let userPublicId: string;

        if (!user) {
            // Create user
            userPublicId = crypto.randomUUID();
            const userRes = await env.DB.prepare(
                "INSERT INTO users (public_id, email, google_id, is_verified, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id"
            ).bind(userPublicId, email, sub, 1, createdAt).first();

            if (!userRes) throw new Error("Failed to create user");
            user = { id: userRes.id, public_id: userPublicId, email };
        } else {
            userPublicId = user.public_id;
            // Update google_id if it was missing (e.g. user signed up with email first)
            if (!user.google_id) {
                await env.DB.prepare("UPDATE users SET google_id = ?, is_verified = 1 WHERE id = ?")
                    .bind(sub, user.id)
                    .run();
            }
        }

        // 2. Create Session
        const sessionId = crypto.randomUUID();
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

        await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
        ).bind(sessionId, user.id, expiresAt, createdAt).run();

        const cookie = `sprout_session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;

        // 3. Get user's spaces
        const spaces = await env.DB.prepare("SELECT * FROM spaces WHERE owner_id = ?").bind(userPublicId).all();

        return new Response(JSON.stringify({
            success: true,
            user: { id: userPublicId, email, name, picture },
            spaces: spaces.results
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookie
            }
        });

    } catch (err: any) {
        console.error("Google Auth Error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
