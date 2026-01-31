interface Env {
    DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const ideaId = params.id as string;
    const body = await request.json() as any;
    const { status } = body;

    const validStatuses = ['new', 'in-progress', 'rejected', 'done'];

    if (!status || !validStatuses.includes(status)) {
        return new Response("Invalid status", { status: 400 });
    }

    // --- Auth Check ---
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
        return new Response("Unauthorized", { status: 401 });
    }
    const sessionId = cookie.split(';').find(c => c.trim().startsWith('sprout_session='))?.split('=')[1];
    if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const session = await env.DB.prepare(
        "SELECT s.*, u.public_id as user_public_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ?"
    ).bind(sessionId, Date.now()).first();

    if (!session) {
        return new Response("Session expired", { status: 401 });
    }

    // --- Ownership Check ---
    // 1. Get the idea to find the space
    // ideas table has space_slug. we need to join spaces to get owner_id.
    const ideaWithSpace = await env.DB.prepare(`
        SELECT i.id, s.owner_id 
        FROM ideas i 
        JOIN spaces s ON i.space_slug = s.slug 
        WHERE i.public_id = ?
    `).bind(ideaId).first();

    if (!ideaWithSpace) {
        return new Response("Idea not found", { status: 404 });
    }

    if (ideaWithSpace.owner_id !== session.user_public_id) {
        return new Response("Forbidden: Only the space owner can change status", { status: 403 });
    }

    // --- Update ---
    await env.DB.prepare(
        'UPDATE ideas SET status = ? WHERE public_id = ?'
    ).bind(status, ideaId).run();

    return new Response(JSON.stringify({ success: true, status }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
