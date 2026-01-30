interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const space = url.searchParams.get('space');

    if (!space) {
        return new Response(JSON.stringify({ error: 'Space slug is required' }), { status: 400 });
    }

    const { results } = await env.DB.prepare(
        `SELECT i.*, 
     (SELECT COUNT(*) FROM comments c WHERE c.idea_id = i.public_id) as comment_count 
     FROM ideas i 
     WHERE space_slug = ? 
     ORDER BY created_at DESC`
    )
        .bind(space)
        .all();

    // Fetch comments for these ideas to simple populate for now (or we could rely on separate fetch)
    // For simplicity matching current 'Idea' type which has 'comments' array
    // We'll do a second query to get all comments for these ideas

    const ideas = results.map(idea => ({
        id: idea.public_id,
        title: idea.title,
        description: idea.description,
        status: idea.status,
        voteCount: idea.vote_count,
        jiraIssueKey: idea.jira_issue_key,
        createdAt: new Date(idea.created_at).toISOString(),
        comments: [] // populated below or separately
    }));

    // Standardize: Let's fetch comments efficiently
    if (ideas.length > 0) {
        const placeholders = ideas.map(() => '?').join(',');
        const ids = ideas.map(i => i.id);
        const commentsResult = await env.DB.prepare(
            `SELECT * FROM comments WHERE idea_id IN (${placeholders}) ORDER BY created_at DESC`
        ).bind(...ids).all();

        const comments = commentsResult.results;

        ideas.forEach(idea => {
            idea.comments = comments
                .filter(c => c.idea_id === idea.id)
                .map(c => ({
                    id: c.public_id,
                    text: c.text,
                    createdAt: new Date(c.created_at).toISOString()
                }));
        });
    }

    return new Response(JSON.stringify(ideas), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const body = await request.json() as any;

    const { title, description, space_slug } = body;

    if (!title || !space_slug) {
        return new Response("Missing title or space", { status: 400 });
    }

    const public_id = crypto.randomUUID();
    const created_at = Date.now();

    await env.DB.prepare(
        'INSERT INTO ideas (public_id, title, description, status, vote_count, created_at, space_slug) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
        .bind(public_id, title, description || '', 'new', 1, created_at, space_slug) // Start with 1 vote (self)
        .run();

    const newIdea = {
        id: public_id,
        title,
        description: description || '',
        status: 'new',
        voteCount: 1,
        created_at: new Date(created_at).toISOString(),
        comments: []
    };

    return new Response(JSON.stringify(newIdea), {
        headers: { 'Content-Type': 'application/json' }
    });
}
