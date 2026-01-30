interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Check authentication
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    const sessionId = cookie.split(';').find(c => c.trim().startsWith('sprout_session='))?.split('=')[1];

    if (!sessionId) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    const session = await env.DB.prepare(
        "SELECT s.*, u.public_id as user_public_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ?"
    ).bind(sessionId, Date.now()).first();

    if (!session) {
        return new Response(JSON.stringify({ error: "Session expired" }), { status: 401 });
    }

    try {
        const { name, slug } = await request.json() as any;

        if (!name || !slug) {
            return new Response(JSON.stringify({ error: "Name and slug are required" }), { status: 400 });
        }

        // Check if slug exists
        const existingSpace = await env.DB.prepare("SELECT * FROM spaces WHERE slug = ?").bind(slug).first();
        if (existingSpace) {
            return new Response(JSON.stringify({ error: "This space URL is already taken" }), { status: 409 });
        }

        // Create space
        const spaceId = crypto.randomUUID();
        const createdAt = Date.now();

        await env.DB.prepare(
            "INSERT INTO spaces (public_id, slug, name, owner_id, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(spaceId, slug, name, session.user_public_id, createdAt).run();

        return new Response(JSON.stringify({
            success: true,
            space: { id: spaceId, slug, name }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error("Create space error:", err);
        return new Response(JSON.stringify({ error: "Failed to create space" }), { status: 500 });
    }
}
