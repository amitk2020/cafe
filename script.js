const newsletterForm = document.getElementById('newsletterForm');
const contactForm = document.getElementById('contactForm');
const newsletterStatus = document.getElementById('newsletterStatus');
const contactStatus = document.getElementById('contactStatus');
const reserveButtons = document.querySelectorAll('#reserveButton, #heroReserveButton');

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `form-status show ${type}`;
}

function clearStatus(element) {
    element.textContent = '';
    element.className = 'form-status';
}

reserveButtons.forEach((button) => {
    button.addEventListener('click', () => {
        showStatus(contactStatus, 'Thanks! Your table is reserved. We’ll see you soon at Cozy Cafe.', 'success');
    });
});

// Newsletter form submission
newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();

    if (!email) {
        showStatus(newsletterStatus, 'Please enter your email address to subscribe.', 'error');
        return;
    }

    showStatus(newsletterStatus, `Subscribed! We’ll share updates with ${email}.`, 'success');
    newsletterForm.reset();
});

// Contact form submission with Turnstile verification
contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const guests = document.getElementById('guests').value.trim();
    const date = document.getElementById('date').value.trim();
    const time = document.getElementById('time').value.trim();
    const specialRequest = document.getElementById('specialRequest').value.trim();
    const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;

    if (!name || !email || !phone || !guests || !date || !time) {
        showStatus(contactStatus, 'Please complete all required reservation fields.', 'error');
        return;
    }
    if (!turnstileToken) {
        showStatus(contactStatus, 'Please complete the verification check before sending your request.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                phone,
                guests: Number(guests),
                date,
                time,
                specialRequest,
                turnstileToken
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to send.');

        showStatus(contactStatus, result.message || `Reservation request received for ${name}! We’ll be in touch soon.`, 'success');
        contactForm.reset();
    } catch (error) {
        console.error(error);
        showStatus(contactStatus, 'We couldn’t send your reservation request right now. Please try again later.', 'error');
    }
});


