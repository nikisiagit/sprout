
interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const slug = params.slug as string;

    if (!slug) {
        return new Response("Space slug required", { status: 400 });
    }

    // 1. Auth Check (Must be Owner)
    let isOwner = false;
    const cookie = request.headers.get('Cookie');
    if (cookie) {
        const sessionId = cookie.split(';').find(c => c.trim().startsWith('sprout_session='))?.split('=')[1];
        if (sessionId) {
            // Get space owner first
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
        return new Response("Unauthorized: Only owner can export data", { status: 401 });
    }

    // 2. Fetch Ideas
    const { results } = await env.DB.prepare(
        "SELECT public_id, title, description, status, vote_count, created_at FROM ideas WHERE space_slug = ? ORDER BY created_at DESC"
    ).bind(slug).all();

    // 3. Convert to CSV
    const csvRows = [
        ['ID', 'Title', 'Description', 'Status', 'Votes', 'Created At']
    ];

    const escapeCsv = (text: string) => {
        if (!text) return '';
        const escaped = text.replace(/"/g, '""'); // Escape double quotes
        return `"${escaped}"`; // Wrap in quotes
    };

    results.forEach((idea: any) => {
        csvRows.push([
            idea.public_id,
            escapeCsv(idea.title),
            escapeCsv(idea.description),
            idea.status,
            idea.vote_count.toString(),
            new Date(idea.created_at).toISOString()
        ]);
    });

    const csvString = csvRows.map(row => row.join(',')).join('\n');

    return new Response(csvString, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="ideas-${slug}.csv"`
        }
    });
}
