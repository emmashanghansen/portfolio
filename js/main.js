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

// Typing animation
const typingEl = document.querySelector('.typing-text');
if (typingEl) {
  const fullText = typingEl.textContent;
  typingEl.textContent = '';

  let i = 0;
  const type = () => {
    if (i < fullText.length) {
      typingEl.textContent = fullText.slice(0, i + 1);
      i++;
      setTimeout(type, 80);
    }
  };
  setTimeout(type, 400);
}
