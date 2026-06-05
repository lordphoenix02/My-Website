document.documentElement.classList.add('js');

// Add this JavaScript to toggle the menu
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

const revealItems = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
    });
}, {
    threshold: 0.18
});

revealItems.forEach((item) => revealObserver.observe(item));

const photoStage = document.querySelector('.photo-stage');

if (photoStage) {
    photoStage.addEventListener('pointermove', (event) => {
        const bounds = photoStage.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        photoStage.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
        photoStage.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
    });

    photoStage.addEventListener('pointerleave', () => {
        photoStage.style.setProperty('--tilt-x', '0deg');
        photoStage.style.setProperty('--tilt-y', '0deg');
    });
}

document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
    });
});

document.querySelectorAll('.project-card, .certification-item').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width * 100).toFixed(2);
        const y = ((event.clientY - bounds.top) / bounds.height * 100).toFixed(2);

        card.style.setProperty('--glow-x', `${x}%`);
        card.style.setProperty('--glow-y', `${y}%`);
    });

    card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--glow-x');
        card.style.removeProperty('--glow-y');
    });
});
