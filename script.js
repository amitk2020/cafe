const newsletterForm = document.getElementById('newsletterForm');
const contactForm = document.getElementById('contactForm');
const reserveButtons = document.querySelectorAll('#reserveButton, #heroReserveButton');

reserveButtons.forEach((button) => {
    button.addEventListener('click', () => {
        alert('Thanks! Your table is reserved. See you soon at Cozy Cafe.');
    });
});

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

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !message) {
        alert('Please enter both your name and a message.');
        return;
    }

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, message })
        });

        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message || 'Message sent successfully!');
        contactForm.reset();
    } catch (error) {
        console.error(error);
        alert('Unable to send your message. Please try again later.');
    }
});
