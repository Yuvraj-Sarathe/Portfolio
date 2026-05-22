'use strict';

/* ═══════════════════════════════════════════════════════════
   THEME SYSTEM
   ═══════════════════════════════════════════════════════════ */
const THEMES = [
    { id: 'obsidian',   label: 'Obsidian' },
    { id: 'phosphor',   label: 'Phosphor' },
    { id: 'manuscript', label: 'Manuscript' },
    { id: 'alabaster',  label: 'Alabaster' },
];

let currentThemeIdx = 0;
let themeSwitchTimer = null;

function loadTheme() {
    const saved = localStorage.getItem('portfolio-theme');
    const idx   = THEMES.findIndex(t => t.id === saved);
    currentThemeIdx = idx >= 0 ? idx : 0;
    applyTheme(THEMES[currentThemeIdx], true);
}

function applyTheme(theme, immediate) {
    if (immediate) {
        document.documentElement.setAttribute('data-theme', theme.id);
    } else {
        document.documentElement.setAttribute('data-theme-switching', '');
        document.documentElement.setAttribute('data-theme', theme.id);
        clearTimeout(themeSwitchTimer);
        themeSwitchTimer = setTimeout(() => {
            document.documentElement.removeAttribute('data-theme-switching');
        }, 20);
    }
    localStorage.setItem('portfolio-theme', theme.id);
}

function cycleTheme() {
    currentThemeIdx = (currentThemeIdx + 1) % THEMES.length;
    applyTheme(THEMES[currentThemeIdx]);
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
   SCROLL ANIMATIONS
   ═══════════════════════════════════════════════════════════ */
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add('will-change-pulse');
                requestAnimationFrame(() => {
                    el.classList.add('is-visible');
                    setTimeout(() => {
                        el.classList.remove('will-change-pulse');
                    }, 1000);
                });
                observer.unobserve(el);
            }
        });
    }, {
        threshold:   0.08,
        rootMargin: '0px 0px -60px 0px',
    });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   BACK TO TOP BUTTON
   ═══════════════════════════════════════════════════════════ */
function setupBackToTop() {
    const btn = document.getElementById('backTop');
    if (!btn) return;

    const heroSection = document.querySelector('.project-hero');
    if (!heroSection) return;

    const observer = new IntersectionObserver(([entry]) => {
        btn.hidden = entry.isIntersecting;
    }, { threshold: 0.1 });

    observer.observe(heroSection);
}

/* ═══════════════════════════════════════════════════════════
   CLICKSPARK — animated sparks on click
   ═══════════════════════════════════════════════════════════ */
function setupClickSpark() {
    const canvas = document.createElement('canvas');
    canvas.className = 'click-spark-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let sparks = [];
    let raf;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function getAccentColor() {
        const style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--accent').trim() || '#e8704a';
    }

    function handleClick(e) {
        const sparkColor = getAccentColor();
        const sparkCount = 8;
        const duration = 400;
        const now = performance.now();

        for (let i = 0; i < sparkCount; i++) {
            const angle = (2 * Math.PI * i) / sparkCount;
            sparks.push({
                x: e.clientX,
                y: e.clientY,
                angle,
                startTime: now
            });
        }

        if (!raf) raf = requestAnimationFrame(draw);
    }

    function draw(timestamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const sparkColor = getAccentColor();

        sparks = sparks.filter(spark => {
            const elapsed = timestamp - spark.startTime;
            if (elapsed >= 400) return false;

            const progress = elapsed / 400;
            const eased = progress * (2 - progress);
            const distance = eased * 15;
            const lineLength = 10 * (1 - eased);

            const x1 = spark.x + distance * Math.cos(spark.angle);
            const y1 = spark.y + distance * Math.sin(spark.angle);
            const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
            const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

            ctx.strokeStyle = sparkColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            return true;
        });

        if (sparks.length > 0) raf = requestAnimationFrame(draw);
        else raf = null;
    }

    document.addEventListener('click', handleClick);
}

/* ═══════════════════════════════════════════════════════════
   HERO ENTRANCE
   ═══════════════════════════════════════════════════════════ */
function setupHeroEntrance() {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.querySelectorAll('[data-reveal]').forEach(el => {
                if (el.closest('.project-hero')) {
                    el.classList.add('will-change-pulse');
                    el.classList.add('is-visible');
                    setTimeout(() => el.classList.remove('will-change-pulse'), 1000);
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
    setupScrollProgress();
    setupScrollAnimations();
    setupBackToTop();
    setupHeroEntrance();
    setupClickSpark();

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', () => {
        cycleTheme();
        if (window.__updateCursorTrail) window.__updateCursorTrail();
    });
});
