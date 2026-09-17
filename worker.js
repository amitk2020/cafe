const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return entities[character];
    });

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/contact' && request.method === 'POST') {
            try {
                const payload = await request.json();
                const name = payload.name?.trim();
                const email = payload.email?.trim();
                const phone = payload.phone?.trim();
                const guests = payload.guests?.toString().trim();
                const date = payload.date?.trim();
                const time = payload.time?.trim();
                const specialRequest = payload.specialRequest?.trim();
                const message = payload.message?.trim();
                const turnstileToken = payload.turnstileToken;

                const hasReservationDetails = Boolean(email || phone || guests || date || time || specialRequest);
                const hasLegacyMessage = Boolean(message);

                console.log('Received:', {
                    name,
                    email,
                    phone,
                    guests,
                    date,
                    time,
                    specialRequest,
                    message,
                    turnstileToken: turnstileToken?.slice(0, 20),
                });

                if (!name || (!hasReservationDetails && !hasLegacyMessage) || !turnstileToken) {
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

                const emailText = [
                    `Name: ${name}`,
                    email ? `Email: ${email}` : '',
                    phone ? `Phone: ${phone}` : '',
                    guests ? `Guests: ${guests}` : '',
                    date ? `Date: ${date}` : '',
                    time ? `Time: ${time}` : '',
                    specialRequest ? `Special request: ${specialRequest}` : '',
                    message ? `Message: ${message}` : '',
                ]
                    .filter(Boolean)
                    .join('\n');

                const emailHtml = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>New Table Request</title>
                    </head>
                    <body style="margin:0;padding:0;background:#f5f0e7;color:#2f241d;font-family:Arial,sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f0e7;padding:32px 16px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:600px;background:#fffdf9;">
                                        <tr>
                                            <td style="padding:32px 36px;background:#76503c;color:#fff7eb;">
                                                <div style="font:700 30px Georgia,serif;">cozy</div>
                                                <div style="margin-top:6px;color:#f4c866;font:600 10px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;">cafe</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:36px;">
                                                <p style="margin:0 0 8px;color:#d96e3c;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">New table request</p>
                                                <h1 style="margin:0 0 24px;font:600 32px Georgia,serif;">Someone's planning a good morning.</h1>
                                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #e6d8c4;">
                                                    <tr>
                                                        <td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;color:#806f64;font-size:12px;font-weight:bold;text-transform:uppercase;">Name</td>
                                                        <td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;font-size:15px;">${escapeHtml(name)}</td>
                                                    </tr>
                                                    ${email ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;color:#806f64;font-size:12px;font-weight:bold;text-transform:uppercase;">Email</td><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;font-size:15px;"><a href="mailto:${escapeHtml(email)}" style="color:#76503c;">${escapeHtml(email)}</a></td></tr>` : ''}
                                                    ${phone ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;color:#806f64;font-size:12px;font-weight:bold;text-transform:uppercase;">Phone</td><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;font-size:15px;">${escapeHtml(phone)}</td></tr>` : ''}
                                                    ${guests ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;color:#806f64;font-size:12px;font-weight:bold;text-transform:uppercase;">Guests</td><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;font-size:15px;">${escapeHtml(guests)}</td></tr>` : ''}
                                                    ${date ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;color:#806f64;font-size:12px;font-weight:bold;text-transform:uppercase;">Date</td><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;font-size:15px;">${escapeHtml(date)}</td></tr>` : ''}
                                                    ${time ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;color:#806f64;font-size:12px;font-weight:bold;text-transform:uppercase;">Time</td><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;font-size:15px;">${escapeHtml(time)}</td></tr>` : ''}
                                                    ${specialRequest ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;color:#806f64;font-size:12px;font-weight:bold;text-transform:uppercase;">Request</td><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;font-size:15px;">${escapeHtml(specialRequest)}</td></tr>` : ''}
                                                    ${message ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;color:#806f64;font-size:12px;font-weight:bold;text-transform:uppercase;">Message</td><td style="padding:12px 16px;border-bottom:1px solid #e6d8c4;font-size:15px;">${escapeHtml(message)}</td></tr>` : ''}
                                                </table>
                                                <p style="margin:28px 0 0;color:#806f64;font-size:13px;line-height:1.6;">Reply directly to ${escapeHtml(name)} to confirm the table booking.</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:20px 36px;background:#e7d9c6;color:#655148;font-size:12px;">Cozy Cafe - Good coffee. Great mornings.</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `;

                const emailRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'Cozy Cafe Website <onboarding@resend.dev>',
                        to: 'amit.k03377@gmail.com',
                        subject: hasReservationDetails ? `New reservation request from ${name}` : `New message from ${name}`,
                        text: emailText,
                        html: emailHtml,
                    }),
                });

                console.log('Resend status:', emailRes.status);
                const emailResult = await emailRes.text();
                console.log('Resend response body:', emailResult);

                if (!emailRes.ok) {
                    return new Response(JSON.stringify({ message: 'Failed to send.' }), { status: 500 });
                }

                return new Response(JSON.stringify({ message: hasReservationDetails ? 'Reservation request received!' : 'Message sent successfully!' }), { status: 200 });
            } catch (err) {
                console.log('Caught error:', err.message, err.stack);
                return new Response(JSON.stringify({ message: 'Server error.' }), { status: 500 });
            }
        }

        return env.ASSETS.fetch(request);
    },
};