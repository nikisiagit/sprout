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

    await env.DB.prepare(
        'UPDATE ideas SET status = ? WHERE public_id = ?'
    ).bind(status, ideaId).run();

    return new Response(JSON.stringify({ success: true, status }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
