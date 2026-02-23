document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       Intersection Observer — sections visible + nav active
    ========================== */
    const sections   = document.querySelectorAll("section[id]");
    const navAnchors = document.querySelectorAll('.nav-menu a[href^="#"]');

    // Animation fadeInUp sur les sections
    const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    }, { threshold: 0.15 });
    sections.forEach(s => visibilityObserver.observe(s));

    // Lien actif dans la nav selon la section visible
    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navAnchors.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, {
        rootMargin: '-40% 0px -55% 0px', // déclenche quand la section est bien centrée
        threshold: 0
    });
    sections.forEach(s => activeObserver.observe(s));


    /* =========================
       Menu Burger
    ========================== */
    const burger = document.querySelector('.burger');
    const navMenu = document.querySelector('.nav-menu');

    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    burger.addEventListener('click', () => {
        burger.classList.toggle('toggle');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    overlay.addEventListener('click', () => {
        burger.classList.remove('toggle');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });


    /* =========================
       Navigation fluide
    ========================== */
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const y = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: y - 80, behavior: 'smooth' });
            }
            burger.classList.remove('toggle');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });



    /* =========================
       Accordéons Skills (mobile / tablette)
    ========================== */
    const skillGroups = Array.from(document.querySelectorAll('#skills .skill-group'));

    function updateSkillAccordions() {
        const isCompact = window.innerWidth <= 900;
        skillGroups.forEach(group => {
            const title = group.querySelector('.skill-group-title');
            if (!title) return;
            if (isCompact) {
                group.classList.add('accordion');
                // par défaut fermé
                if (!group.classList.contains('open')) group.classList.add('collapsed');
            } else {
                group.classList.remove('accordion', 'collapsed', 'open');
            }
        });
    }

    skillGroups.forEach(group => {
        const title = group.querySelector('.skill-group-title');
        if (!title) return;
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
            if (window.innerWidth > 900) return;
            group.classList.toggle('open');
            group.classList.toggle('collapsed');
        });
    });

    updateSkillAccordions();
    window.addEventListener('resize', updateSkillAccordions);


    /* =====================================================
       GITHUB API — Langages + Filtres automatiques
    ====================================================== */

const projectCards        = Array.from(document.querySelectorAll('.project[data-repo]'));
const filterBar           = document.querySelector('.project-filters');
const projectList         = document.querySelector('.project-list');
const noResults           = document.querySelector('.no-results');
const filtersWrapper      = document.querySelector('.project-filters-wrapper');
const filtersToggleButton = document.querySelector('.project-filters-toggle');

// ---- Palette couleurs soignées (même charte que le CSS) ----
const LANG_PALETTE = {
    JavaScript:  { bg: 'rgba(215,170,30,0.12)',   color: '#D4A017', border: 'rgba(215,170,30,0.3)'   },
    TypeScript:  { bg: 'rgba(49,120,198,0.12)',    color: '#5B9BD5', border: 'rgba(49,120,198,0.3)'   },
    Python:      { bg: 'rgba(55,118,171,0.12)',    color: '#4A9CC7', border: 'rgba(55,118,171,0.3)'   },
    Go:          { bg: 'rgba(0,173,215,0.1)',      color: '#00B4D8', border: 'rgba(0,173,215,0.28)'   },
    Rust:        { bg: 'rgba(180,72,30,0.12)',     color: '#C96442', border: 'rgba(180,72,30,0.28)'   },
    HTML:        { bg: 'rgba(220,80,40,0.1)',      color: '#D96941', border: 'rgba(220,80,40,0.28)'   },
    CSS:         { bg: 'rgba(21,114,182,0.1)',     color: '#3D9BD4', border: 'rgba(21,114,182,0.28)'  },
    Shell:       { bg: 'rgba(80,180,80,0.1)',      color: '#5DBB5D', border: 'rgba(80,180,80,0.28)'   },
    Makefile:    { bg: 'rgba(90,140,90,0.1)',      color: '#7AAE7A', border: 'rgba(90,140,90,0.28)'   },
    Jupyter:     { bg: 'rgba(218,91,11,0.1)',      color: '#E07A3C', border: 'rgba(218,91,11,0.28)'   },
    Dockerfile:  { bg: 'rgba(25,95,175,0.1)',      color: '#4A87C7', border: 'rgba(25,95,175,0.28)'   },
    YAML:        { bg: 'rgba(160,150,130,0.1)',    color: '#A89B80', border: 'rgba(160,150,130,0.28)' },
    JSON:        { bg: 'rgba(160,150,130,0.1)',    color: '#A89B80', border: 'rgba(160,150,130,0.28)' },
};

function palette(lang) {
    return LANG_PALETTE[lang] || { bg: 'rgba(190,132,69,0.08)', color: '#BE8445', border: 'rgba(190,132,69,0.25)' };
}

// Normalise le nom affiché (ex: "Jupyter Notebook" → "Jupyter")
function normalizeLang(lang) {
    if (lang === 'Jupyter Notebook') return 'Jupyter';
    return lang;
}

// Crée un tag <span class="lang-tag">
function createLangTag(rawLang) {
    const lang = normalizeLang(rawLang);
    const span = document.createElement('span');
    span.className = 'lang-tag';
    span.setAttribute('data-lang', lang);
    span.textContent = lang;
    const p = palette(lang);
    span.style.background   = p.bg;
    span.style.color        = p.color;
    span.style.borderColor  = p.border;
    return span;
}

// ---- Comptage des projets par langage ----
const langCount = {}; // { JavaScript: 3, Python: 2, ... }

function updateFilterCounts() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        let existingBadge = btn.querySelector('.count');

        if (filter === 'all') {
            const total = projectCards.filter(c => !c.classList.contains('hidden')).length;
            if (!existingBadge) {
                existingBadge = document.createElement('span');
                existingBadge.className = 'count';
                btn.appendChild(existingBadge);
            }
            existingBadge.textContent = projectCards.length;
            return;
        }

        const count = langCount[filter] || 0;
        if (count > 0) {
            if (!existingBadge) {
                existingBadge = document.createElement('span');
                existingBadge.className = 'count';
                btn.appendChild(existingBadge);
            }
            existingBadge.textContent = count;
        }
    });
}

// ---- Met en forme la grille en fonction du nombre de projets visibles ----
function updateProjectLayout() {
    if (!projectList) return;
    const visibleCards = projectCards.filter(card => !card.classList.contains('hidden'));
    projectList.classList.toggle('single-project', visibleCards.length === 1);
}

// ---- Ajoute un bouton filtre si inexistant ----
function addFilterBtn(lang) {
    if (filterBar.querySelector(`[data-filter="${lang}"]`)) return;
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.setAttribute('data-filter', lang);
    btn.textContent = lang;
    filterBar.appendChild(btn);
    btn.addEventListener('click', applyFilter);
}

// ---- Applique le filtre sélectionné ----
function applyFilter(e) {
    const btn = e.currentTarget;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    let visible = 0;

    projectCards.forEach(card => {
        const langs = (card.getAttribute('data-langs') || '').split(',').filter(Boolean);
        const match = filter === 'all' || langs.includes(filter);
        card.classList.toggle('hidden', !match);
        if (match) visible++;
    });

    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
    updateProjectLayout();
}

// Bouton "Tous" déjà dans le HTML
filterBar.querySelector('[data-filter="all"]').addEventListener('click', applyFilter);

// ---- Toggle filtres en mode mobile (type burger) ----
if (filtersToggleButton && filtersWrapper) {
    filtersToggleButton.addEventListener('click', () => {
        filtersWrapper.classList.toggle('open');
    });
}

// ---- Récupère les langages depuis le fichier languages.json ----
fetch('languages.json')
  .then(res => res.json())
  .then(data => {
      data.forEach(d => {
          const card = document.querySelector(`.project[data-repo="${d.repo}"]`);
          if (!card) return;
          card.setAttribute('data-langs', d.languages.join(','));
          const container = card.querySelector('.project-langs');
          container.innerHTML = '';
          d.languages.forEach(lang => container.appendChild(createLangTag(lang)));
          d.languages.forEach(lang => {
              langCount[lang] = (langCount[lang] || 0) + 1;
              addFilterBtn(lang);
          });
      });
      updateFilterCounts();
      // Met à jour la mise en page initiale (vue "Tous")
      updateProjectLayout();
  })
  .catch(err => console.error(err));

/* =========================
   Zoom image (modal)
========================== */
const modal        = document.getElementById('imgModal');
const modalImg     = document.getElementById('imgModalImg');
const modalClose   = document.getElementById('imgModalClose');
const modalBackdrop = modal?.querySelector('.img-modal-backdrop');

document.querySelectorAll('.project-img-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
        const img = wrapper.querySelector('.project-img');
        if (!img || !modal) return;
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

const closeModal = () => {
    modal?.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { if (modalImg) modalImg.src = ''; }, 350);
};

modalClose?.addEventListener('click', closeModal);
modalBackdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
});

    /* =========================
       Formulaire EmailJS
    ========================== */
    if (typeof emailjs !== 'undefined') emailjs.init('kduBzZEV46HHYUSRs');

    const form = document.querySelector('form');
    if (form && typeof emailjs !== 'undefined') {
        const notyf = new Notyf();
        form.addEventListener('submit', e => {
            e.preventDefault();
            emailjs.sendForm('service_kcxhmsc', 'template_rop1777', form)
                .then(() => { notyf.success('Message envoyé avec succès !'); form.reset(); })
                .catch(() => { notyf.error("Échec de l'envoi du message."); });
        });
    }


    /* =========================
       Typing effect hero
    ========================== */
    const heroTitle = document.querySelector('#hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        setTimeout(() => {
            const iv = setInterval(() => {
                if (i < text.length) { heroTitle.textContent += text.charAt(i); i++; }
                else clearInterval(iv);
            }, 100);
        }, 1000);
    }

});


/* =========================
   Scroll — header + parallax
========================== */
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const hero   = document.querySelector('#hero');
    const cur    = window.pageYOffset;
    if (header) header.style.transform = cur > lastScroll && cur > 100 ? 'translateY(-100%)' : 'translateY(0)';
    if (hero)   hero.style.transform   = `translateY(${cur * 0.5}px)`;
    lastScroll = cur;
});


/* =========================
   Resize
========================== */
window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        document.querySelector('.nav-menu')?.classList.remove('active');
        document.querySelector('.burger')?.classList.remove('active');
    }
});