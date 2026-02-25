interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { email } = await request.json() as { email: string };

        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
        }

        // Add email to waitlist
        const createdAt = Date.now();

        await env.DB.prepare(
            "INSERT INTO waitlist (email, created_at) VALUES (?, ?)"
        ).bind(email, createdAt).run();

        return new Response(JSON.stringify({
            success: true
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error("Waitlist error:", err);
        // Handle unique constraint error if they try to sign up twice
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return new Response(JSON.stringify({ error: "Failed to join waitlist" }), { status: 500 });
    }
}
