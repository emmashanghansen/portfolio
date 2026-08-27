// Custom cursor
const cursor = document.querySelector('.custom-cursor');
if (cursor && matchMedia('(pointer: fine)').matches) {
  const DEPART_MS = 100; // shrink + fade out in place
  const ARRIVE_MS = 260; // grow + fade back in at the destination

  // Resolve --spacing-l (the docked slot's size, see .button::before) to px
  // so the flight target lines up with it regardless of root font size.
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute; visibility:hidden; height:0; width:var(--spacing-l);';
  document.body.appendChild(probe);
  const dockDotRadius = parseFloat(getComputedStyle(probe).width) / 2;
  probe.remove();

  // Pick up where the cursor left off on the previous page, instead of
  // sitting invisible (native pointer showing through) until the mouse
  // next moves.
  const storedX = sessionStorage.getItem('cursorX');
  const storedY = sessionStorage.getItem('cursorY');
  let mouseX = storedX !== null ? parseFloat(storedX) : 0;
  let mouseY = storedY !== null ? parseFloat(storedY) : 0;
  let dockedButton = null;
  let phaseTimer;
  let arriveCleanupTimer;

  if (storedX !== null) {
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
    cursor.classList.add('custom-cursor--visible');
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    sessionStorage.setItem('cursorX', mouseX);
    sessionStorage.setItem('cursorY', mouseY);
    cursor.classList.add('custom-cursor--visible');
    if (!dockedButton) {
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    }
  });

  // Depart: shrink + fade out right where the cursor currently is —
  // the first beat of the dock/undock illusion (see components.css).
  function beginDepart() {
    clearTimeout(arriveCleanupTimer);
    cursor.classList.remove('custom-cursor--arrive');
    cursor.classList.add('custom-cursor--depart');
  }

  // Arrive: grow + fade back in wherever the cursor has just been placed.
  function beginArrive() {
    cursor.classList.remove('custom-cursor--depart');
    cursor.classList.add('custom-cursor--arrive');
    clearTimeout(arriveCleanupTimer);
    arriveCleanupTimer = setTimeout(() => cursor.classList.remove('custom-cursor--arrive'), ARRIVE_MS);
  }

  function dock(button) {
    if (dockedButton === button) return;
    dockedButton = button;
    clearTimeout(phaseTimer);
    cursor.classList.toggle('custom-cursor--on-primary', button.classList.contains('button--primary'));
    beginDepart();

    phaseTimer = setTimeout(() => {
      // Measure the button's *settled* post-hover layout, not its current
      // mid-transition one — some layouts (e.g. the navbar's space-between
      // row) shift siblings as the docking slot opens up, so reading the
      // rect right now would target a spot that's already stale by the
      // time that shift finishes. Forcing the slot to its final width for
      // one synchronous measurement (no repaint happens in between) gives
      // the true landing spot instead.
      document.documentElement.classList.add('measuring-dock-target');
      const rect = button.getBoundingClientRect();
      const paddingLeft = parseFloat(getComputedStyle(button).paddingLeft);
      document.documentElement.classList.remove('measuring-dock-target');

      // Cursor is fully hidden at this point (mid-depart), so the jump
      // to the target is imperceptible.
      cursor.style.left = (rect.left + paddingLeft + dockDotRadius) + 'px';
      cursor.style.top = (rect.top + rect.height / 2) + 'px';
      cursor.classList.add('custom-cursor--docked');
      beginArrive();
    }, DEPART_MS);
  }

  function undock() {
    dockedButton = null;
    clearTimeout(phaseTimer);
    cursor.classList.remove('custom-cursor--docked', 'custom-cursor--on-primary');
    beginDepart();

    phaseTimer = setTimeout(() => {
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
      beginArrive();
    }, DEPART_MS);
  }

  document.addEventListener('mouseover', e => {
    const button = e.target.closest('.button');
    if (button) dock(button);
    else if (e.target.closest('a, button')) cursor.classList.add('custom-cursor--hover');
  });
  document.addEventListener('mouseout', e => {
    const button = e.target.closest('.button');
    if (button) {
      if (!button.contains(e.relatedTarget)) undock();
    } else if (e.target.closest('a, button')) {
      cursor.classList.remove('custom-cursor--hover');
    }
  });

  window.addEventListener('mousedown', () => cursor.classList.add('custom-cursor--press'));
  window.addEventListener('mouseup', () => cursor.classList.remove('custom-cursor--press'));

  document.addEventListener('mouseleave', () => cursor.classList.remove('custom-cursor--visible'));
}

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
