import { Resend } from 'resend';

export async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
    const resend = new Resend(apiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Sprout <onboarding@resend.dev>',
            to,
            subject,
            html
        });

        if (error) {
            console.error('Resend Error:', error);
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        console.error('Failed to send email:', err);
        throw err;
    }
}
