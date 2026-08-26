const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar__links a');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    suppressHide = true;
    navbar.classList.remove('navbar--hidden');
    clearTimeout(suppressTimeout);
    suppressTimeout = setTimeout(() => { suppressHide = false; }, 1000);
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isSamePage = href.startsWith('#') || href === currentPage;
    if (!isSamePage) {
      e.preventDefault();
      setTimeout(() => { window.location.href = href; }, 240);
    } else if (!href.startsWith('#')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});

// Detect homepage (has in-page section links) — feeds isHomepage below
const sectionLinkMap = {};
navLinks.forEach(a => {
  const href = a.getAttribute('href');
  if (href && href.startsWith('#')) {
    const section = document.getElementById(href.slice(1));
    if (section) sectionLinkMap[href.slice(1)] = a;
  }
});
const sectionIds = Object.keys(sectionLinkMap);

// Hide navbar on scroll down, show on scroll up
// Always on project pages; on homepage only on mobile (≤768px)
let lastScrollY = window.scrollY;
let suppressHide = false;
let suppressTimeout;

const isHomepage = sectionIds.length > 0;

window.addEventListener('scroll', () => {
  const isMobile = window.innerWidth <= 768;
  if (isHomepage && !isMobile) return;
  const currentScrollY = window.scrollY;
  if (!suppressHide) {
    if (currentScrollY > lastScrollY && currentScrollY > navbar.offsetHeight) {
      navbar.classList.add('navbar--hidden');
    } else {
      navbar.classList.remove('navbar--hidden');
    }
  }
  lastScrollY = currentScrollY;
}, { passive: true });

// Footer icon cycling
const footerIcon = document.getElementById('footer-cycling-icon');
if (footerIcon) {
  const footerIconUse = footerIcon.querySelector('use');
  const footerIcons = [
    'heart','sun','star','palette',
    'apple','music','seedling','plant', 'heart',
    'bubble','yin-yang','brush','robot',
    'cloud', 'seedling','shirt','sun','crown','bulb',
    'mood-smile-beam', 'heart','eyeglass','moon',
    'mood-smile','canary','ghost-3','slice',
    'chef-hat','school', 'palette','user-heart','atom',
    'toilet-paper','moon-stars', 'heart'
  ];
  let footerIconIndex = 0;
  setInterval(() => {
    footerIconIndex = (footerIconIndex + 1) % footerIcons.length;
    footerIconUse.setAttribute('href', `images/icons/sprite.svg#icon-${footerIcons[footerIconIndex]}`);
  }, 300);
}

// Typing animation
// Each phrase is an array of segments: {text, cls}
// cls is optional — add any CSS class to style that segment
const typingEl = document.querySelector('.typing-text');
if (typingEl) {
  const phrases = [
    [{text: "I am a "}, {text: "UX designer", cls: "text-display-strong"}],
    [{text: "I am nerdy and curious"}],
    [{text: "I love creativity"}],
    // [{text: "I worship creativity"}],
    [{text: "I love art, food and fashion"}],
    [{text: "I am a tech optimist"}],
    [{text: "I am inspired by biology"}],
    [{text: "I am an adventurer"}],
  ];

  const plain = p => p.map(s => s.text).join('');

  const render = (phrase, count) => {
    let left = count, html = '';
    for (const {text, cls} of phrase) {
      if (!left) break;
      const chunk = text.slice(0, left);
      left -= chunk.length;
      html += cls ? `<span class="${cls}">${chunk}</span>` : chunk;
    }
    typingEl.innerHTML = html;
  };

  typingEl.innerHTML = '';
  let idx = 0, charCount = 0;

  const run = () => {
    const prevPhrase = phrases[(idx + phrases.length - 1) % phrases.length];
    const next = phrases[idx];
    const nextPlain = plain(next);
    const curPlain = plain(prevPhrase).slice(0, charCount);

    let shared = 0;
    while (shared < curPlain.length && shared < nextPlain.length && curPlain[shared] === nextPlain[shared]) shared++;

    const erase = () => {
      if (charCount > shared) {
        render(prevPhrase, --charCount);
        setTimeout(erase, 40);
      } else {
        type();
      }
    };

    const type = () => {
      if (charCount < nextPlain.length) {
        render(next, ++charCount);
        setTimeout(type, 80);
      } else {
        idx = (idx + 1) % phrases.length;
        setTimeout(run, 3000);
      }
    };

    erase();
  };

  setTimeout(run, 400);
}
