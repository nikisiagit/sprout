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

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const slug = params.slug as string;

    if (!slug) {
        return new Response(JSON.stringify({ error: "Space slug required" }), { status: 400 });
    }

    // 1. Auth Check (Must be Owner)
    let isOwner = false;
    const cookie = request.headers.get('Cookie');
    if (cookie) {
        const sessionId = cookie.split(';').find(c => c.trim().startsWith('sprout_session='))?.split('=')[1];
        if (sessionId) {
            const space = await env.DB.prepare("SELECT owner_id FROM spaces WHERE slug = ?").bind(slug).first();
            if (!space) return new Response("Space not found", { status: 404 });

            const session = await env.DB.prepare(
                "SELECT u.public_id as user_public_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ?"
            ).bind(sessionId, Date.now()).first();

            if (session && session.user_public_id === space.owner_id) {
                isOwner = true;
            }
        }
    }

    if (!isOwner) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 2. Delete Logic (Cascade: Comments -> Ideas -> Space)
    try {
        // Get idea IDs to delete comments efficiently? 
        // Or just `DELETE FROM comments WHERE idea_id IN (SELECT public_id FROM ideas WHERE space_slug = ?)`
        // D1 supports subqueries in DELETE? 
        // If not, fetch IDs first.
        const ideas = await env.DB.prepare("SELECT public_id FROM ideas WHERE space_slug = ?").bind(slug).all();
        if (ideas.results.length > 0) {
            const placeholders = ideas.results.map(() => '?').join(',');
            const ideaIds = ideas.results.map(i => i.public_id);

            // Delete comments
            await env.DB.prepare(`DELETE FROM comments WHERE idea_id IN (${placeholders})`).bind(...ideaIds).run();
        }

        // Delete ideas
        await env.DB.prepare("DELETE FROM ideas WHERE space_slug = ?").bind(slug).run();

        // Delete space
        await env.DB.prepare("DELETE FROM spaces WHERE slug = ?").bind(slug).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error("Delete failed", e);
        return new Response(JSON.stringify({ error: "Delete failed" }), { status: 500 });
    }
}
