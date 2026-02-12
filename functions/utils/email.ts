export async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'Sprout <noreply@sprout.social>', // Replace with actual domain if available
            to,
            subject,
            html
        })
    });

    if (!res.ok) {
        const error = await res.json();
        console.error('Resend Error:', error);
        throw new Error('Failed to send email');
    }

    return res.json();
}
