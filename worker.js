export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/contact' && request.method === 'POST') {
            try {
                const { name, message, turnstileToken } = await request.json();

                if (!name || !message || !turnstileToken) {
                    return new Response(JSON.stringify({ message: 'Missing fields.' }), { status: 400 });
                }

                const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        secret: env.TURNSTILE_SECRET_KEY,
                        response: turnstileToken,
                    }),
                });
                const verifyData = await verifyRes.json();

                if (!verifyData.success) {
                    return new Response(JSON.stringify({ message: 'Verification failed.' }), { status: 403 });
                }

                const emailRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'Cozy Cafe Website <amit.k2012@me.com>',
                        to: 'amit.k2012@me.com',
                        subject: `New message from ${name}`,
                        text: message,
                    }),
                });

                if (!emailRes.ok) {
                    return new Response(JSON.stringify({ message: 'Failed to send.' }), { status: 500 });
                }

                return new Response(JSON.stringify({ message: 'Message sent successfully!' }), { status: 200 });
            } catch (err) {
                return new Response(JSON.stringify({ message: 'Server error.' }), { status: 500 });
            }
        }

        // Not our API route — let the static asset handler take it
        return env.ASSETS.fetch(request);
    },
};