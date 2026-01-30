interface Env {
    DB: D1Database;
    JIRA_HOST: string;
    JIRA_EMAIL: string;
    JIRA_API_TOKEN: string;
    JIRA_PROJECT_KEY: string;
    JIRA_ISSUE_TYPE?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const ideaId = params.id as string;

    // 1. Fetch Idea from DB
    const idea = await env.DB.prepare('SELECT * FROM ideas WHERE public_id = ?').bind(ideaId).first();

    if (!idea) {
        return new Response("Idea not found", { status: 404 });
    }

    if (idea.jira_issue_key) {
        return new Response(JSON.stringify({ issueKey: idea.jira_issue_key, message: "Already synced" }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. Validate Env Vars
    if (!env.JIRA_HOST || !env.JIRA_EMAIL || !env.JIRA_API_TOKEN || !env.JIRA_PROJECT_KEY) {
        return new Response(JSON.stringify({ error: "Jira configuration missing on server" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 3. Create Issue in Jira
    const jiraPayload = {
        fields: {
            project: {
                key: env.JIRA_PROJECT_KEY
            },
            summary: idea.title,
            description: {
                type: "doc",
                version: 1,
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: idea.description || "No description provided."
                            }
                        ]
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: `\n\nOriginal Idea URL: ${new URL(request.url).origin}/space/${idea.space_slug}`
                            }
                        ]
                    }
                ]
            },
            issuetype: {
                name: env.JIRA_ISSUE_TYPE || "Task" // Use "Idea" for Jira Product Discovery
            }
        }
    };

    const auth = btoa(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`);

    try {
        const jiraResponse = await fetch(`https://${env.JIRA_HOST}/rest/api/3/issue`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jiraPayload)
        });

        if (!jiraResponse.ok) {
            const errorText = await jiraResponse.text();
            console.error("Jira API Error:", errorText);
            return new Response(JSON.stringify({ error: "Failed to create Jira issue", details: errorText }), { status: jiraResponse.status });
        }

        const jiraData = await jiraResponse.json() as any;
        const issueKey = jiraData.key;

        // 4. Update D1
        await env.DB.prepare('UPDATE ideas SET jira_issue_key = ? WHERE public_id = ?')
            .bind(issueKey, ideaId)
            .run();

        return new Response(JSON.stringify({ issueKey, success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Jira Sync Exception:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error during Jira Sync" }), { status: 500 });
    }
}
