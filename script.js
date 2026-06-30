const form = document.getElementById('newsletterForm');
const reserveButtons = document.querySelectorAll('#reserveButton, #heroReserveButton');

reserveButtons.forEach((button) => {
    button.addEventListener('click', () => {
        alert('Thanks! Your table is reserved. See you soon at Cozy Cafe.');
    });
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();

    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    alert(`Subscribed! Stay tuned for updates at ${email}.`);
    form.reset();
});
