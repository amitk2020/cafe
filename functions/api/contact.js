export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { name, message, turnstileToken } = await request.json();

    if (!name || !message || !turnstileToken) {
      return new Response(JSON.stringify({ message: 'Missing fields.' }), { status: 400 });
    }

    // Verify Turnstile token
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

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Cozy Cafe Website <contact@yourdomain.com>',
        to: 'you@yourdomain.com',
        reply_to: undefined, // no email field in your form currently, see note below
        subject: `New message from ${name}`,
        text: message,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ message: 'Failed to send.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Message sent successfully!' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error.' }), { status: 500 });
  }
}