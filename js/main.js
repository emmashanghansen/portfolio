// Sliding navbar indicator
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar-links a');
const indicator = document.querySelector('.navbar-indicator');

function positionIndicator(el, animate) {
  if (!indicator || !el) return;
  const navRect = navbar.getBoundingClientRect();
  const linkRect = el.getBoundingClientRect();
  if (!animate) indicator.style.transition = 'none';
  indicator.style.left = (linkRect.left - navRect.left) + 'px';
  indicator.style.width = linkRect.width + 'px';
  if (!animate) requestAnimationFrame(() => requestAnimationFrame(() => { indicator.style.transition = ''; }));
}

const activeLink = document.querySelector('.navbar-links a[aria-current="page"]');
positionIndicator(activeLink, false);

navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => positionIndicator(link, true));
  link.addEventListener('mouseleave', () => positionIndicator(activeLink, true));

  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    positionIndicator(link, true);
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

// Hide navbar on scroll down, show on scroll up
let lastScrollY = window.scrollY;
let suppressHide = false;
let suppressTimeout;

window.addEventListener('scroll', () => {
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
  const footerIcons = [
    'tabler_heart.svg','tabler_sun.svg','tabler_star.svg','tabler_palette.svg',
    'tabler_apple.svg','tabler_music.svg','tabler_seedling.svg','tabler_plant.svg', 'tabler_heart.svg',
    'tabler_bubble.svg','tabler_yin-yang.svg','tabler_brush.svg','tabler_robot.svg',
    'tabler_cloud.svg', 'tabler_seedling.svg','tabler_shirt.svg','tabler_sun.svg','tabler_crown.svg','tabler_bulb.svg',
    'tabler_mood-smile-beam.svg', 'tabler_heart.svg','tabler_eyeglass.svg','tabler_moon.svg',
    'tabler_mood-smile.svg','tabler_canary.svg','tabler_ghost-3.svg','tabler_slice.svg',
    'tabler_chef-hat.svg','tabler_school.svg', 'tabler_palette.svg','tabler_user-heart.svg','tabler_atom.svg',
    'tabler_toilet-paper.svg','tabler_moon-stars.svg', 'tabler_heart.svg'
  ];
  let footerIconIndex = 0;
  setInterval(() => {
    footerIconIndex = (footerIconIndex + 1) % footerIcons.length;
    footerIcon.src = `images/icons/footer-icons/${footerIcons[footerIconIndex]}`;
  }, 300);
}

// Typing animation
// Each phrase is an array of segments: {text, cls}
// cls is optional — add any CSS class to style that segment
const typingEl = document.querySelector('.typing-text');
if (typingEl) {
  const phrases = [
    [{text: "I'm a "}, {text: "UX designer", cls: "text-display-strong"}],
    [{text: "I'm nerdy and curious"}],
    [{text: "I love creativity"}],
    // [{text: "I worship creativity"}],
    [{text: "I love art, food and fashion"}],
    [{text: "I'm a tech optimist"}],
    [{text: "I'm inspired by biology"}],
    [{text: "I'm an adventurer"}],
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
