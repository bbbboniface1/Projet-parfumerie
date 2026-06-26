/* ============================================================
   SIRANI PARFUMERIE — main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* 1. NAVBAR SCROLL EFFECT
    ---------------------------------------------------------------- */
    const navbar = document.querySelector('.navbar-sirani');
    if (navbar) {
        function handleScroll() {
            navbar.classList.toggle('scrolled', window.scrollY > 80);
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    /* 2. INTERSECTION OBSERVER — apparition des cards produits
    ---------------------------------------------------------------- */
    const productCards = document.querySelectorAll('.product-card');
    if (productCards.length) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, i) {
                if (entry.isIntersecting) {
                    setTimeout(function () {
                        entry.target.classList.add('visible');
                    }, i * 80);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        productCards.forEach(function (card) {
            observer.observe(card);
        });
    }

    /* 3. SMOOTH SCROLL sur les ancres
    ---------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* 4. TOGGLE ŒIL — champ password
    ---------------------------------------------------------------- */
    const passwordInput = document.getElementById('password-input');
    const passwordToggle = document.getElementById('password-toggle');
    if (passwordInput && passwordToggle) {
        passwordToggle.addEventListener('click', function () {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye', !isPassword);
                icon.classList.toggle('fa-eye-slash', isPassword);
            }
        });
    }

    /* 5. LAZY LOAD IMAGES — IntersectionObserver sur data-src
    ---------------------------------------------------------------- */
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length) {
        const imgObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imgObserver.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        lazyImages.forEach(function (img) { imgObserver.observe(img); });
    }

    /* 6. TOAST AUTO-DISMISS après 3.5s
    ---------------------------------------------------------------- */
    const sessionToast = document.getElementById('sessionToast');
    if (sessionToast) {
        const bsToast = new bootstrap.Toast(sessionToast, { delay: 3500 });
        bsToast.show();
        sessionToast.addEventListener('hidden.bs.toast', function () {
            const container = sessionToast.parentElement;
            if (container) container.remove();
        });
    }

    /* 7. PAIEMENT — cards radio sélectionnables
    ---------------------------------------------------------------- */
    document.querySelectorAll('.payment-card').forEach(function (card) {
        card.addEventListener('click', function () {
            document.querySelectorAll('.payment-card').forEach(function (c) {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });

        const radio = card.querySelector('input[type="radio"]');
        if (radio && radio.checked) card.classList.add('selected');
    });

    /* 8. COMPTEUR ANIMÉ — pour sections stats
    ---------------------------------------------------------------- */
    function animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        let current = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(function () {
            current = Math.min(current + step, target);
            el.textContent = current.toLocaleString('fr-FR');
            if (current >= target) clearInterval(timer);
        }, 20);
    }

    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        const cObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    cObserver.unobserve(entry.target);
                }
            });
        });
        counters.forEach(function (el) { cObserver.observe(el); });
    }

});
