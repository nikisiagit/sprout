interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const ideaId = params.id as string;

    // Check status
    const idea = await env.DB.prepare('SELECT status FROM ideas WHERE public_id = ?').bind(ideaId).first();

    if (!idea) {
        return new Response("Idea not found", { status: 404 });
    }

    if (idea.status !== 'new') {
        return new Response("Voting is closed for this idea", { status: 400 });
    }

    await env.DB.prepare(
        'UPDATE ideas SET vote_count = vote_count + 1 WHERE public_id = ?'
    ).bind(ideaId).run();

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
