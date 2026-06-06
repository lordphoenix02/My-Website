document.documentElement.classList.add('js');

// Add this JavaScript to toggle the menu
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    navLinks.classList.toggle('active');
    hamburger?.setAttribute('aria-expanded', navLinks.classList.contains('active').toString());
}

const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle?.querySelector('i');
const themeLabel = themeToggle?.querySelector('span');

function applyTheme(theme) {
    const isDark = theme === 'dark';

    document.body.dataset.theme = isDark ? 'dark' : 'light';
    themeToggle?.setAttribute('aria-pressed', isDark.toString());
    themeToggle?.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);

    if (themeIcon && themeLabel) {
        themeIcon.className = `fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`;
        themeLabel.textContent = isDark ? 'Light' : 'Dark';
    }
}

const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
applyTheme(savedTheme);

themeToggle?.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme', nextTheme);
    applyTheme(nextTheme);
});

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
        document.querySelector('.hamburger')?.setAttribute('aria-expanded', 'false');
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

const projectCards = document.querySelectorAll('.project-card');

function pickProjectCard(activeCard) {
    projectCards.forEach((card) => card.classList.toggle('is-picked', card === activeCard));
}

projectCards.forEach((card) => {
    card.addEventListener('pointerenter', () => pickProjectCard(card));
    card.addEventListener('focusin', () => pickProjectCard(card));
    card.addEventListener('pointerleave', () => {
        if (!card.matches(':focus-within')) {
            card.classList.remove('is-picked');
        }
    });
    card.addEventListener('click', (event) => {
        if (!event.target.closest('a')) {
            pickProjectCard(card);
        }
    });
});

const photoMusicButtons = document.querySelectorAll('.photo-music-toggle');
const mysteryMusic = document.querySelector('#mysteryMusic');
let mysteryAudioContext;

function updateMusicButton(button, isPlaying) {
    const icon = button.querySelector('i');
    const label = button.dataset.playLabel || button.getAttribute('aria-label') || 'Play music';

    button.dataset.playLabel ||= label;
    button.classList.toggle('is-playing', isPlaying);
    button.setAttribute('aria-pressed', isPlaying.toString());
    button.setAttribute('aria-label', isPlaying ? 'Pause music' : button.dataset.playLabel);

    if (icon) {
        icon.className = `fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`;
    }
}

function clearActiveMusicButtons() {
    photoMusicButtons.forEach((button) => updateMusicButton(button, false));
}

function ensureMysterySource(source) {
    if (!mysteryMusic) {
        return false;
    }

    if (!source) {
        return false;
    }

    const nextSource = new URL(source, window.location.href).href;

    if (mysteryMusic.currentSrc !== nextSource && mysteryMusic.src !== nextSource) {
        mysteryMusic.src = source;
        mysteryMusic.load();
    }

    if (mysteryMusic.readyState === 0) {
        mysteryMusic.load();
    }

    return true;
}

function playFallbackMysteryTone(toneIndex) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
        return;
    }

    mysteryAudioContext ||= new AudioContext();

    if (mysteryAudioContext.state === 'suspended') {
        mysteryAudioContext.resume();
    }

    const startTime = mysteryAudioContext.currentTime;
    const notes = [
        [196, 261.63, 311.13],
        [220, 293.66, 349.23],
        [174.61, 233.08, 329.63],
        [246.94, 329.63, 392]
    ][toneIndex] || [196, 261.63, 311.13];

    notes.forEach((frequency, index) => {
        const oscillator = mysteryAudioContext.createOscillator();
        const gain = mysteryAudioContext.createGain();
        const noteStart = startTime + index * 0.12;

        oscillator.type = index === 1 ? 'triangle' : 'sine';
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.01, noteStart + 0.38);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.13, noteStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.42);

        oscillator.connect(gain);
        gain.connect(mysteryAudioContext.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.44);
    });
}

async function toggleMysterySound(button) {
    const toneIndex = Number(button.dataset.tone || 0);
    const audioSource = button.dataset.src;
    const isCurrentButtonPlaying = button.classList.contains('is-playing') && !mysteryMusic?.paused;

    if (isCurrentButtonPlaying) {
        mysteryMusic.pause();
        clearActiveMusicButtons();
        return;
    }

    clearActiveMusicButtons();
    updateMusicButton(button, true);

    if (ensureMysterySource(audioSource)) {
        mysteryMusic.volume = 0.46;

        if (!mysteryMusic.paused) {
            mysteryMusic.pause();
        }

        mysteryMusic.currentTime = 0;

        try {
            await mysteryMusic.play();
            return;
        } catch {
            updateMusicButton(button, false);
            playFallbackMysteryTone(toneIndex);
            return;
        }
    }

    updateMusicButton(button, false);
    playFallbackMysteryTone(toneIndex);
}

photoMusicButtons.forEach((button) => {
    button.addEventListener('click', () => toggleMysterySound(button));
});

mysteryMusic?.addEventListener('ended', clearActiveMusicButtons);
