interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const ideaId = params.id as string;

    // Minimal vote logic: just increment
    // In a real app we'd track user votes to prevent duplicates

    await env.DB.prepare(
        'UPDATE ideas SET vote_count = vote_count + 1 WHERE public_id = ?'
    ).bind(ideaId).run();

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
