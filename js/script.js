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

// ---------- Bob, the blanket-ghost tour guide ----------
(function () {
    const mascot = document.getElementById('scrollMascot');
    const bubble = document.getElementById('mascotBubble');
    if (!mascot || !bubble) return;

    const messages = {
        top: "Welcome! My name is Bob, and I'll be your guide through Sisekelo's portfolio.",
        about: "Here is the person behind the products. Sisekelo builds practical systems for real South African challenges.",
        education: "These are Sisekelo's key academic achievements — from his ICT Diploma to his current Honours degree.",
        experience: "This is where Sisekelo turned knowledge into experience through development, tutoring and real project work.",
        work: "Now for the exciting part — these are some of the systems Sisekelo has designed and built.",
        'github-activity': "Here is a glimpse of Sisekelo's development activity and the consistency behind his work.",
        skills: "These are the tools Sisekelo uses to turn ideas into reliable, full-stack products.",
        certificates: "These certifications show Sisekelo's commitment to continuous learning across AI, cloud and cybersecurity.",
        resume: "Need the full story? Sisekelo's résumé is available here to view or download.",
        contact: "Like what you have seen? This is the best place to start a conversation with Sisekelo.",
        footer: "I hope you enjoyed learning more about Sisekelo Mhlamvu. Have a great day!"
    };

    let currentProgress = 0;
    let targetProgress = 0;
    let lastProgress = 0;
    let bubbleTimer;
    let activeKey = '';

    function keepBubbleInViewport() {
        if (!bubble.classList.contains('is-visible')) return;
        bubble.style.setProperty('--bubble-shift-x', '0px');
        bubble.style.setProperty('--bubble-arrow-x', '50%');

        const margin = 10;
        const mascotRect = mascot.getBoundingClientRect();
        const bubbleRect = bubble.getBoundingClientRect();
        let shift = 0;

        if (bubbleRect.left < margin) shift += margin - bubbleRect.left;
        if (bubbleRect.right + shift > window.innerWidth - margin) {
            shift -= (bubbleRect.right + shift) - (window.innerWidth - margin);
        }

        bubble.style.setProperty('--bubble-shift-x', `${shift}px`);

        // Keep the speech-tail aimed at Bob even when the bubble is shifted.
        const bubbleWidth = bubbleRect.width || 1;
        const mascotCenter = mascotRect.left + mascotRect.width / 2;
        const adjustedBubbleLeft = bubbleRect.left + shift;
        const arrowPercent = Math.max(10, Math.min(90, ((mascotCenter - adjustedBubbleLeft) / bubbleWidth) * 100));
        bubble.style.setProperty('--bubble-arrow-x', `${arrowPercent}%`);
    }

    function say(key, hold = 5200) {
        if (!messages[key] || activeKey === key) return;
        activeKey = key;
        clearTimeout(bubbleTimer);
        bubble.textContent = messages[key];
        bubble.classList.add('is-visible');
        mascot.classList.add('is-speaking');
        requestAnimationFrame(keepBubbleInViewport);
        bubbleTimer = setTimeout(() => {
            bubble.classList.remove('is-visible');
            mascot.classList.remove('is-speaking');
        }, hold);
    }

    const targets = [document.getElementById('top'), ...document.querySelectorAll('section[id]'), document.querySelector('footer')].filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
        if (!visible) return;
        const key = visible.target.tagName === 'FOOTER' ? 'footer' : visible.target.id;
        say(key, key === 'footer' ? 7000 : 5200);
    }, { threshold:[.25,.45,.65], rootMargin:'-18% 0px -28% 0px' });
    targets.forEach(t => observer.observe(t));

    setTimeout(() => say('top', 6500), 700);

    if (prefersReducedMotion) {
        mascot.style.transform = 'translateX(calc(50vw - 30px))';
        return;
    }

    function frame() {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        targetProgress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
        currentProgress += (targetProgress - currentProgress) * .035;
        const x = currentProgress * Math.max(0, window.innerWidth - 66);
        mascot.style.transform = `translateX(${x}px)`;
        keepBubbleInViewport();
        const moving = Math.abs(currentProgress - lastProgress) > .0006;
        mascot.classList.toggle('is-walking', moving);
        mascot.classList.toggle('is-dancing', currentProgress >= .965);
        lastProgress = currentProgress;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    window.addEventListener('resize', keepBubbleInViewport);
})();

// ---------- Mobile nav toggle ----------
(function () {
    const toggleBtn = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (!toggleBtn || !navLinks) return;

    function closeMenu() {
        navLinks.classList.remove('is-open');
        toggleBtn.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        toggleBtn.classList.toggle('is-open', isOpen);
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu after tapping a link, or when the viewport is resized back to desktop
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth > 780) closeMenu(); });
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

// ---------- Nav scroll-spy with sliding indicator ----------
const navLinkEls = document.querySelectorAll('.nav-links a[data-section]');
const navIndicator = document.getElementById('navIndicator');
const sectionEls = Array.from(navLinkEls).map(a => document.getElementById(a.dataset.section)).filter(Boolean);

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
                const activeLink = document.querySelector(`.nav-links a[data-section="${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    moveIndicator(activeLink);
                }
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

// ---------- Contact form (EmailJS) ----------
let emailjsLoadFailed = false;

(function () {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
        try {
            emailjs.init({ publicKey: 'xkZ4rlI6UCwn4hmN7' });
        } catch (e) {
            emailjsLoadFailed = true;
            console.error('EmailJS init failed:', e);
        }
    };
    script.onerror = () => { emailjsLoadFailed = true; };
    document.head.appendChild(script);
})();

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

function buildMailtoFallback() {
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    const subject = encodeURIComponent(`Portfolio enquiry from ${name || 'website visitor'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    return `mailto:svmhlamvu@gmail.com?subject=${subject}&body=${body}`;
}

function showFallback(reasonText) {
    formStatus.innerHTML = `${reasonText} Your message wasn't lost — <a href="${buildMailtoFallback()}" style="text-decoration:underline;">click here to send it via your email app</a> instead.`;
    formStatus.className = 'error';
}

if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (submitBtn && submitBtn.disabled) return; // guard against double-submit

        if (emailjsLoadFailed || typeof emailjs === 'undefined') {
            // Give the script one last moment to finish loading before falling back
            if (typeof emailjs === 'undefined' && !emailjsLoadFailed) {
                formStatus.textContent = 'Still loading — try again in a moment.';
                formStatus.className = '';
                return;
            }
            showFallback('The message service didn\'t load.');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;
        formStatus.textContent = 'Sending...';
        formStatus.className = '';

        // Safety timeout in case the request hangs indefinitely
        const timeout = setTimeout(() => {
            if (submitBtn) submitBtn.disabled = false;
            showFallback('That\'s taking too long, so it may not have gone through.');
        }, 12000);

        emailjs.sendForm('service_c5onzro', 'template_cbk62ha', this).then(
            function () {
                clearTimeout(timeout);
                if (submitBtn) submitBtn.disabled = false;
                formStatus.textContent = 'Message sent — thanks, I\'ll get back to you soon.';
                formStatus.className = 'success';
                contactForm.reset();
            },
            function (error) {
                clearTimeout(timeout);
                if (submitBtn) submitBtn.disabled = false;
                console.error('EmailJS error:', error);
                showFallback('Something went wrong sending that.');
            }
        );
    });
}
