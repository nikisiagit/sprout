export const onRequestPost: PagesFunction = async (context) => {
    const { request } = context;

    // Clear the session cookie
    const cookie = `sprout_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie
        }
    });
}
