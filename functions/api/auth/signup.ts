interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { email, password, spaceName, spaceSlug } = await request.json() as any;

        if (!email || !password || !spaceSlug || !spaceName) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 1. Check if user with email already exists
        const existingUser = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
        if (existingUser) {
            return new Response(JSON.stringify({ error: "User already exists with this email" }), { status: 409 });
        }

        // 2. Check if space slug exists
        const existingSpace = await env.DB.prepare("SELECT * FROM spaces WHERE slug = ?").bind(spaceSlug).first();
        if (existingSpace) {
            return new Response(JSON.stringify({ error: "Space URL is already taken. Please go back and choose another name." }), { status: 409 });
        }

        // 3. Hash Password
        const salt = crypto.randomUUID(); // Simple unique salt
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const passHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        const userPublicId = crypto.randomUUID();
        const createdAt = Date.now();

        // 4. Create User
        // Note: check D1 RETURNING support carefully, creating user first then fetching ID might be safer if RETURNING not fully reliable or typed.
        // D1 supports RETURNING.
        const userRes = await env.DB.prepare(
            "INSERT INTO users (public_id, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id"
        ).bind(userPublicId, email, passHash, salt, createdAt).first();

        if (!userRes || !userRes.id) {
            throw new Error("Failed to create user record");
        }

        const userId = userRes.id as number;

        // 5. Create Space
        await env.DB.prepare(
            "INSERT INTO spaces (public_id, slug, name, owner_id, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(crypto.randomUUID(), spaceSlug, spaceName, userPublicId, createdAt).run();

        // 6. Create Session
        const sessionId = crypto.randomUUID();
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

        await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
        ).bind(sessionId, userId, expiresAt, createdAt).run();

        // Secure Cookie
        const cookie = `sprout_session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;

        return new Response(JSON.stringify({ success: true, user: { id: userPublicId, email }, space: { slug: spaceSlug } }), {
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookie
            }
        });
    } catch (err: any) {
        console.error("Signup Error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), { status: 500 });
    }
}
