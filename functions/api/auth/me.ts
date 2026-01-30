interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const cookie = request.headers.get('Cookie');
    if (!cookie) {
        return new Response(JSON.stringify({ authenticated: false }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const sessionId = cookie.split(';').find(c => c.trim().startsWith('sprout_session='))?.split('=')[1];

    if (!sessionId) {
        return new Response(JSON.stringify({ authenticated: false }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const session = await env.DB.prepare(
        "SELECT s.*, u.email, u.public_id as user_public_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ?"
    ).bind(sessionId, Date.now()).first();

    if (!session) {
        return new Response(JSON.stringify({ authenticated: false }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
        authenticated: true,
        user: {
            id: session.user_public_id,
            email: session.email
        }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
