export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const { name, message, turnstileToken } = await request.json();
        console.log('Received:', { name, message, turnstileToken: turnstileToken?.slice(0, 20) });

        if (!name || !message || !turnstileToken) {
          console.log('Missing fields');
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
        console.log('Turnstile verify result:', verifyData);

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
            from: 'Cozy Cafe Website <onboarding@resend.dev>',
            to: 'amit.k2012@me.com',
            subject: `New message from ${name}`,
            text: message,
          }),
        });

        console.log('Resend status:', emailRes.status);
        const emailResult = await emailRes.text();
        console.log('Resend response body:', emailResult);

        if (!emailRes.ok) {
          return new Response(JSON.stringify({ message: 'Failed to send.' }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: 'Message sent successfully!' }), { status: 200 });
      } catch (err) {
        console.log('Caught error:', err.message, err.stack);
        return new Response(JSON.stringify({ message: 'Server error.' }), { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  },
};