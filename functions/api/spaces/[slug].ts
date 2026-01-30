interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const slug = params.slug as string;

    if (!slug) {
        return new Response(JSON.stringify({ error: "Space slug required" }), { status: 400 });
    }

    // Get space info
    const space = await env.DB.prepare(
        "SELECT * FROM spaces WHERE slug = ?"
    ).bind(slug).first();

    if (!space) {
        return new Response(JSON.stringify({ error: "Space not found" }), { status: 404 });
    }

    // Check if user is owner
    let isOwner = false;
    const cookie = request.headers.get('Cookie');

    if (cookie) {
        const sessionId = cookie.split(';').find(c => c.trim().startsWith('sprout_session='))?.split('=')[1];

        if (sessionId) {
            const session = await env.DB.prepare(
                "SELECT s.*, u.public_id as user_public_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ?"
            ).bind(sessionId, Date.now()).first();

            if (session && session.user_public_id === space.owner_id) {
                isOwner = true;
            }
        }
    }

    return new Response(JSON.stringify({
        space: {
            id: space.public_id,
            slug: space.slug,
            name: space.name,
            logoUrl: space.logo_url
        },
        isOwner
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
