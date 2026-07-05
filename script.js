const newsletterForm = document.getElementById('newsletterForm');
const contactForm = document.getElementById('contactForm');
const reserveButtons = document.querySelectorAll('#reserveButton, #heroReserveButton');

reserveButtons.forEach((button) => {
    button.addEventListener('click', () => {
        alert('Thanks! Your table is reserved. See you soon at Cozy Cafe.');
    });
});

// Newsletter form submission
newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();

    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    alert(`Subscribed! Stay tuned for updates at ${email}.`);
    newsletterForm.reset();
});

// Contact form submission with Turnstile verification
contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();
    const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;

    if (!name || !message) {
        alert('Please enter both your name and a message.');
        return;
    }
    if (!turnstileToken) {
        alert('Please complete the verification check.');
        return;
    }

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, message, turnstileToken })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to send.');

        alert(result.message || 'Message sent successfully!');
        contactForm.reset();
    } catch (error) {
        console.error(error);
        alert('Unable to send your message. Please try again later.');
    }
});


