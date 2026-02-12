import { sendEmail } from '../../utils/email';

interface Env {
    RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env } = context;

    try {
        await sendEmail(
            env.RESEND_API_KEY,
            'nikitavo@gmail.com',
            'Hello World',
            '<p>Congrats on sending your <strong>first email</strong>!</p>'
        );

        return new Response(JSON.stringify({ success: true, message: "Test email sent!" }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
