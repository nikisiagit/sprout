interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const ideaId = params.id as string;
    const body = await request.json() as any;
    const { text } = body;

    if (!text) return new Response("Missing text", { status: 400 });

    const public_id = crypto.randomUUID();
    const created_at = Date.now();

    await env.DB.prepare(
        'INSERT INTO comments (public_id, idea_id, text, created_at) VALUES (?, ?, ?, ?)'
    ).bind(public_id, ideaId, text, created_at).run();

    const newComment = {
        id: public_id,
        text,
        createdAt: new Date(created_at).toISOString()
    };

    return new Response(JSON.stringify(newComment), {
        headers: { 'Content-Type': 'application/json' }
    });
}
