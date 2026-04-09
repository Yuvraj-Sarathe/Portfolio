'use strict';

/* ═══════════════════════════════════════════════════════════
   THEME SYSTEM
   ═══════════════════════════════════════════════════════════ */
const THEMES = [
    { id: 'obsidian',   label: 'Obsidian' },
    { id: 'phosphor',   label: 'Phosphor' },
    { id: 'manuscript', label: 'Manuscript' },
];

let currentThemeIdx = 0;

function loadTheme() {
    const saved = localStorage.getItem('portfolio-theme');
    const idx   = THEMES.findIndex(t => t.id === saved);
    currentThemeIdx = idx >= 0 ? idx : 0;
    applyTheme(THEMES[currentThemeIdx]);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme.id);
    const label = document.getElementById('themeName');
    if (label) label.textContent = theme.label;
    localStorage.setItem('portfolio-theme', theme.id);
}

function cycleTheme() {
    currentThemeIdx = (currentThemeIdx + 1) % THEMES.length;
    applyTheme(THEMES[currentThemeIdx]);
}

/* ═══════════════════════════════════════════════════════════
   CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════ */
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;
let rafId  = null;

function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top  = mouseY + 'px';
    }
}

function animateRing() {
    if (cursorRing) {
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top  = ringY + 'px';
    }
    rafId = requestAnimationFrame(animateRing);
}

function onMouseLeave() {
    if (cursorDot)  cursorDot.style.opacity  = '0';
    if (cursorRing) cursorRing.style.opacity = '0';
}
function onMouseEnter() {
    if (cursorDot)  cursorDot.style.opacity  = '1';
    if (cursorRing) cursorRing.style.opacity = '0.5';
}

function onMouseDown() {
    if (cursorRing) cursorRing.classList.add('is-clicking');
}
function onMouseUp() {
    if (cursorRing) cursorRing.classList.remove('is-clicking');
}

function setupCursor() {
    if (!cursorDot || !cursorRing) return;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    animateRing();

    const interactives = document.querySelectorAll('a, button, .approach-item, .featured-card, .project-row, .contact-link, .back-top, .theme-btn');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('is-hovering');
            cursorRing.classList.add('is-hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('is-hovering');
            cursorRing.classList.remove('is-hovering');
        });
    });
}

/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════ */
function setupScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrollTop    = window.scrollY;
        const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
        const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width    = pct + '%';
    }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════
   NAV — scroll effect + scroll spy
   ═══════════════════════════════════════════════════════════ */
function setupNav() {
    const nav      = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id], header[id]');

    if (!nav) return;

    const onScroll = () => {
        // Sticky shadow
        if (window.scrollY > 20) {
            nav.classList.add('is-scrolled');
        } else {
            nav.classList.remove('is-scrolled');
        }

        // Scroll spy
        const offset = 90;
        let current  = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - offset) {
                current = sec.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ═══════════════════════════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════════════════════════ */
function setupMobileMenu() {
    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('is-open');
        mobileMenu.classList.toggle('is-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        mobileMenu.setAttribute('aria-hidden',  String(!isOpen));
    });

    // Close on link click
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('is-open');
            mobileMenu.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden',  'true');
        });
    });
}

/* ═══════════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
   ═══════════════════════════════════════════════════════════ */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href   = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

/* ═══════════════════════════════════════════════════════════
   SCROLL ANIMATIONS (IntersectionObserver)
   ═══════════════════════════════════════════════════════════ */
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold:   0.1,
        rootMargin: '0px 0px -40px 0px',
    });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   BACK TO TOP BUTTON
   ═══════════════════════════════════════════════════════════ */
function setupBackToTop() {
    const btn = document.getElementById('backTop');
    if (!btn) return;

    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const observer = new IntersectionObserver(([entry]) => {
        btn.hidden = entry.isIntersecting;
    }, { threshold: 0.1 });

    observer.observe(heroSection);
}

/* ═══════════════════════════════════════════════════════════
   CONTACT FORM — with real validation
   ═══════════════════════════════════════════════════════════ */
function setupContactForm() {
    const form      = document.getElementById('contactForm');
    const thankYou  = document.getElementById('thankYou');
    const backBtn   = document.getElementById('backToForm');
    if (!form || !thankYou) return;

    // Field validators
    const validators = {
        name:    v => v.trim().length >= 2    ? '' : 'Name must be at least 2 characters.',
        email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.',
        subject: v => v.trim().length >= 3    ? '' : 'Subject must be at least 3 characters.',
        message: v => v.trim().length >= 10   ? '' : 'Message must be at least 10 characters.',
    };

    function showError(fieldId, msg) {
        const input = document.getElementById(fieldId);
        const err   = document.getElementById(fieldId + 'Error');
        if (input) input.classList.toggle('is-invalid', !!msg);
        if (err)   err.textContent = msg;
    }

    function validateField(fieldId, value) {
        const fn  = validators[fieldId];
        const msg = fn ? fn(value) : '';
        showError(fieldId, msg);
        return !msg;
    }

    // Live validation on blur
    ['name', 'email', 'subject', 'message'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('blur', () => validateField(id, el.value));
        el.addEventListener('input', () => {
            if (el.classList.contains('is-invalid')) {
                validateField(id, el.value);
            }
        });
    });

    form.addEventListener('submit', e => {
        e.preventDefault();

        const nameEl    = document.getElementById('name');
        const emailEl   = document.getElementById('email');
        const subjectEl = document.getElementById('subject');
        const msgEl     = document.getElementById('message');

        const valid = [
            validateField('name',    nameEl?.value    || ''),
            validateField('email',   emailEl?.value   || ''),
            validateField('subject', subjectEl?.value || ''),
            validateField('message', msgEl?.value     || ''),
        ].every(Boolean);

        if (!valid) return;

        // Open mailto
        const subj = encodeURIComponent(subjectEl.value);
        const body = encodeURIComponent(
            `Name: ${nameEl.value}\nEmail: ${emailEl.value}\n\nMessage:\n${msgEl.value}`
        );
        window.open(`mailto:yuvrajsarathe07@gmail.com?subject=${subj}&body=${body}`, '_blank');

        // Show thank you
        form.hidden        = true;
        thankYou.hidden    = false;
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            form.reset();
            form.hidden     = false;
            thankYou.hidden = true;
            ['name','email','subject','message'].forEach(id => showError(id, ''));
        });
    }
}

/* ═══════════════════════════════════════════════════════════
   3D TILT on featured cards
   ═══════════════════════════════════════════════════════════ */
function setupCardTilt() {
    document.querySelectorAll('.featured-card, .approach-item, .timeline-content').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect   = card.getBoundingClientRect();
            const x      = e.clientX - rect.left;
            const y      = e.clientY - rect.top;
            const cx     = rect.width  / 2;
            const cy     = rect.height / 2;
            const rX     = ((y - cy) / cy) * 3;
            const rY     = ((cx - x) / cx) * 3;
            card.style.transform = `perspective(800px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* ═══════════════════════════════════════════════════════════
   HERO NAME — stagger on load
   ═══════════════════════════════════════════════════════════ */
function setupHeroEntrance() {
    // Force a small delay so CSS transition fires after render
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.querySelectorAll('[data-animate]').forEach(el => {
                // Elements in the hero fire immediately (no IO needed)
                if (el.closest('.hero')) {
                    el.classList.add('is-visible');
                }
            });
        });
    });
}

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    setupCursor();
    setupScrollProgress();
    setupNav();
    setupMobileMenu();
    setupSmoothScroll();
    setupScrollAnimations();
    setupBackToTop();
    setupContactForm();
    setupCardTilt();
    setupHeroEntrance();

    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', cycleTheme);

    // Close mobile menu on outside click
    document.addEventListener('click', e => {
        const hamburger  = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        if (!hamburger || !mobileMenu) return;
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('is-open');
            mobileMenu.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden',  'true');
        }
    });
});