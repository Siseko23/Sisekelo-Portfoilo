const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Theme toggle (light/dark) ----------
(function () {
    const root = document.documentElement;
    const toggleBtn = document.getElementById('themeToggle');
    const stored = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = stored || (systemPrefersLight ? 'light' : 'dark');
    if (initial === 'light') root.setAttribute('data-theme', 'light');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isLight = root.getAttribute('data-theme') === 'light';
            if (isLight) {
                root.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                root.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }
})();

// ---------- Mobile nav toggle ----------
(function () {
    const toggleBtn = document.getElementById('navToggle');
    const panel = document.getElementById('navMobilePanel');
    if (!toggleBtn || !panel) return;

    function closePanel() {
        panel.classList.remove('is-open');
        toggleBtn.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', () => {
        const isOpen = panel.classList.toggle('is-open');
        toggleBtn.classList.toggle('is-open', isOpen);
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closePanel));

    document.addEventListener('click', (e) => {
        if (!panel.classList.contains('is-open')) return;
        if (panel.contains(e.target) || toggleBtn.contains(e.target)) return;
        closePanel();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 780) closePanel();
    });
})();

// ---------- Cursor glow ----------
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow && !prefersReducedMotion) {
    let glowVisible = false;
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        if (!glowVisible) { cursorGlow.style.opacity = '1'; glowVisible = true; }
    });
    document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; glowVisible = false; });
}

// ---------- Count-up stats ----------
const countEls = document.querySelectorAll('[data-count]');

function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }

    const duration = 1100;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    countEls.forEach(el => countObserver.observe(el));
}

// ---------- Magnetic tilt (photo card + project cards) ----------
function attachTilt(el, strength) {
    if (prefersReducedMotion) return;
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(-2px)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = '';
    });
}

attachTilt(document.querySelector('.glass-card-photo'), 6);
document.querySelectorAll('.project-card').forEach(card => attachTilt(card, 3));

// ---------- Walking mascot: strolls across whenever you enter a new section ----------
(function () {
    const mascot = document.getElementById('mascotWalker');
    if (!mascot || prefersReducedMotion) return;

    let lastSectionId = null;

    function walk() {
        mascot.classList.remove('is-walking');
        // Force reflow so the animation restarts cleanly if triggered again quickly.
        void mascot.offsetWidth;
        mascot.classList.add('is-walking');
    }

    mascot.addEventListener('animationend', () => mascot.classList.remove('is-walking'));

    if ('IntersectionObserver' in window) {
        const mascotObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.id !== lastSectionId) {
                    lastSectionId = entry.target.id;
                    walk();
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('section[id]').forEach(sec => mascotObserver.observe(sec));
    }
})();

// ---------- Nav scroll-spy with sliding indicator ----------
const navLinkEls = document.querySelectorAll('.nav-links a[data-section]');
const mobileNavLinkEls = document.querySelectorAll('.nav-mobile-links a[data-section]');
const navIndicator = document.getElementById('navIndicator');
const sectionEls = Array.from(mobileNavLinkEls.length ? mobileNavLinkEls : navLinkEls)
    .map(a => document.getElementById(a.dataset.section)).filter(Boolean);

function moveIndicator(link) {
    if (!link || !navIndicator) return;
    navIndicator.style.width = link.offsetWidth + 'px';
    navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
}

if ('IntersectionObserver' in window && sectionEls.length) {
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinkEls.forEach(a => a.classList.remove('active'));
                mobileNavLinkEls.forEach(a => a.classList.remove('active'));

                const activeLink = document.querySelector(`.nav-links a[data-section="${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    moveIndicator(activeLink);
                }
                const activeMobileLink = document.querySelector(`.nav-mobile-links a[data-section="${entry.target.id}"]`);
                if (activeMobileLink) activeMobileLink.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sectionEls.forEach(sec => navObserver.observe(sec));
}

// ---------- Staggered grid reveal (projects, certs) ----------
document.querySelectorAll('.project-grid').forEach(grid => {
    grid.querySelectorAll('.project-card').forEach((card, i) => {
        card.style.transitionDelay = (i * 0.08) + 's';
    });
});

document.querySelectorAll('.cert-grid').forEach(grid => {
    grid.querySelectorAll('.cert-card').forEach((card, i) => {
        card.style.transitionDelay = (i * 0.05) + 's';
    });
});

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealEls.forEach(el => observer.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('in-view'));
}

// ---------- Contact form (EmailJS, with a fallback that always works) ----------
const EMAILJS_PUBLIC_KEY = 'xkZ4rlI6UCwn4hmN7';
const EMAILJS_SERVICE_ID = 'service_c5onzro';
const EMAILJS_TEMPLATE_ID = 'template_cbk62ha';
const CONTACT_EMAIL = 'svmhlamvu@gmail.com';

let emailjsReady = false;
let emailjsLoadFailed = false;

(function () {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
        try {
            emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
            emailjsReady = true;
        } catch (err) {
            emailjsLoadFailed = true;
            console.error('EmailJS init failed:', err);
        }
    };
    script.onerror = () => {
        emailjsLoadFailed = true;
        console.error('EmailJS script failed to load (network/ad-blocker/CDN issue).');
    };
    document.head.appendChild(script);
})();

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

function buildMailtoFallback(form) {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const subject = encodeURIComponent(`Portfolio contact from ${name || 'website visitor'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function showMailtoFallback(form, reason) {
    formStatus.innerHTML = `${reason} <a href="${buildMailtoFallback(form)}">Click here to email me directly instead</a>.`;
    formStatus.className = 'error';
}

contactForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const form = this;

    if (emailjsLoadFailed) {
        showMailtoFallback(form, 'The message service couldn\'t load.');
        return;
    }

    if (typeof emailjs === 'undefined' || !emailjsReady) {
        formStatus.textContent = 'Still loading — try again in a moment.';
        formStatus.className = '';
        // Give it a few seconds, then fall back if it never becomes ready.
        setTimeout(() => {
            if (!emailjsReady) showMailtoFallback(form, 'The message service is taking too long.');
        }, 4000);
        return;
    }

    formStatus.textContent = 'Sending...';
    formStatus.className = '';

    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form).then(
        function () {
            formStatus.textContent = 'Message sent — thanks, I\'ll get back to you soon.';
            formStatus.className = 'success';
            contactForm.reset();
        },
        function (error) {
            // Common causes: EmailJS free-tier quota reached, the service/template
            // was deleted or renamed in the EmailJS dashboard, or the allowed
            // domains list under Account > Security no longer includes this site.
            console.error('EmailJS error:', error);
            showMailtoFallback(form, 'Something went wrong sending that.');
        }
    );
});
