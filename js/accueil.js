document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       Intersection Observer
    ========================== */

    const sections = document.querySelectorAll("section");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.2
    });

    sections.forEach(section => observer.observe(section));


    /* =========================
       Menu Burger
    ========================== */
    const burger = document.querySelector('.burger');
    const navMenu = document.querySelector('.nav-menu');

    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    // Toggle du menu
    burger.addEventListener('click', () => {
        burger.classList.toggle('toggle');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Fermer avec l'overlay
    overlay.addEventListener('click', () => {
        burger.classList.remove('toggle');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Fermer avec le X (si vous voulez garder cette fonctionnalité)
    navMenu.addEventListener('click', (e) => {
        if (e.target === navMenu && e.offsetX > navMenu.offsetWidth - 60 && e.offsetY < 60) {
            burger.classList.remove('toggle');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });


    /* =========================
       Navigation fluide avec sections imbriquées
    ========================== */
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const href = link.getAttribute('href');
            const target = document.querySelector(href);

            if (target) {
                // Calcul exact de la position de la section par rapport au document
                const rect = target.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetY = rect.top + scrollTop;

                // Scroll fluide avec offset pour header fixe
                window.scrollTo({ top: targetY - 80, behavior: 'smooth' });
            }

            // Fermer le menu burger si actif
            burger.classList.remove('toggle');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });


    /* =========================
       Formulaire EmailJS
    ========================== */

    if (typeof emailjs !== "undefined") {
        emailjs.init("kduBzZEV46HHYUSRs");
    }

    const form = document.querySelector("form");

    if (form && typeof emailjs !== "undefined") {
        const notyf = new Notyf();

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            emailjs.sendForm('service_kcxhmsc', 'template_rop1777', form)
                .then(() => {
                    notyf.success('Message envoyé avec succès!');
                    form.reset();
                })
                .catch(() => {
                    notyf.error("Échec de l'envoi du message.");
                });
        });
    }


    /* =========================
       Typing effect
    ========================== */

    const heroTitle = document.querySelector('#hero h1');

    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';

        let i = 0;

        setTimeout(() => {
            const typeWriter = setInterval(() => {
                if (i < text.length) {
                    heroTitle.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeWriter);
                }
            }, 100);
        }, 1000);
    }

});


/* =========================
   Scroll events (hors DOMContentLoaded)
========================== */

let lastScroll = 0;

window.addEventListener('scroll', () => {

    const header = document.querySelector('header');
    const hero = document.querySelector('#hero');

    const currentScroll = window.pageYOffset;

    // Header hide/show
    if (header) {
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
    }

    // Parallax
    if (hero) {
        hero.style.transform = `translateY(${currentScroll * 0.5}px)`;
    }

    lastScroll = currentScroll;
});


/* =========================
   Resize
========================== */

window.addEventListener('resize', () => {

    if (window.innerWidth > 900) {

        const navMenu = document.querySelector('.nav-menu');
        const burger = document.querySelector('.burger');

        if (navMenu) navMenu.classList.remove('active');
        if (burger) burger.classList.remove('active');
    }

});

