// Custom cursor
const cursor = document.querySelector('.custom-cursor');
// Same test the CSS uses (see tokens.css): only devices with a mouse.
if (cursor && matchMedia('(hover: hover)').matches) {
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
  let undocking = false;
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
    if (!dockedButton && !undocking) {
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
    undocking = true;
    clearTimeout(phaseTimer);
    cursor.classList.remove('custom-cursor--docked', 'custom-cursor--on-primary', 'custom-cursor--on-secondary-press');
    beginDepart();

    phaseTimer = setTimeout(() => {
      undocking = false;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
      beginArrive();
    }, DEPART_MS);
  }

  // .button--no-dock is deliberately excluded (see components.css): those
  // buttons fall through to the branch below and get the plain hover scale,
  // the same as any other link, instead of swallowing the dot.
  const DOCKABLE = '.button:not(.button--no-dock)';

  document.addEventListener('mouseover', e => {
    const button = e.target.closest(DOCKABLE);
    if (button) dock(button);
    else if (e.target.closest('a, button')) cursor.classList.add('custom-cursor--hover');
  });
  document.addEventListener('mouseout', e => {
    const button = e.target.closest(DOCKABLE);
    if (button) {
      if (!button.contains(e.relatedTarget)) undock();
    } else if (e.target.closest('a, button')) {
      cursor.classList.remove('custom-cursor--hover');
    }
  });

  window.addEventListener('mousedown', () => {
    cursor.classList.add('custom-cursor--press');
    if (dockedButton && dockedButton.classList.contains('button--secondary')) {
      cursor.classList.add('custom-cursor--on-secondary-press');
    }
  });
  window.addEventListener('mouseup', () => {
    cursor.classList.remove('custom-cursor--press', 'custom-cursor--on-secondary-press');
  });

  document.addEventListener('mouseleave', () => cursor.classList.remove('custom-cursor--visible'));
}

const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar__links a');

// Single source of truth for the layout breakpoint, matching the 48rem used
// throughout the CSS. Above it the links live in the bar and the menu concept
// doesn't exist at all.
const wideQuery = matchMedia('(min-width: 48rem)');

// --- Mobile menu ---
const navToggle = document.querySelector('.navbar__toggle');
const navPanel = document.querySelector('.navbar__links');

if (navToggle && navPanel) {
  const setMenu = open => {
    navPanel.classList.toggle('navbar__links--open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  const closeMenu = () => setMenu(false);

  navToggle.addEventListener('click', () => {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  // Following a link should never leave the panel hanging open behind the
  // new scroll position (or the new page, on a same-document anchor).
  navPanel.addEventListener('click', e => {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (navToggle.getAttribute('aria-expanded') !== 'true') return;
    closeMenu();
    navToggle.focus();
  });

  // A tap anywhere outside the bar dismisses it, the way a menu is expected to
  document.addEventListener('click', e => {
    if (navToggle.getAttribute('aria-expanded') !== 'true') return;
    if (!e.target.closest('.navbar')) closeMenu();
  });

  // Resizing past the breakpoint hands the links back to the bar; leaving
  // aria-expanded="true" behind would misreport a panel that no longer exists.
  wideQuery.addEventListener('change', e => {
    if (e.matches) closeMenu();
  });
}

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
  if (isHomepage && wideQuery.matches) return;
  // Hiding the bar while its menu is open would take the open menu with it
  if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') return;
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
    'mood-smile','canary','ghost-3',
    'chef-hat','school', 'palette','user-heart','atom',
    'toilet-paper','moon-stars', 'heart'
  ];
  let footerIconIndex = 0;
  setInterval(() => {
    footerIconIndex = (footerIconIndex + 1) % footerIcons.length;
    footerIconUse.setAttribute('href', `images/icons/sprite.svg#icon-${footerIcons[footerIconIndex]}`);
  }, 300);
}

// --- Copy email ---
// The address goes to the clipboard rather than handing off to a mail client:
// most people read mail in a browser tab, so a mailto: tends to open some
// unconfigured desktop app and dead-end there. mailto: stays as the last
// resort, for when the browser gives us no way to write to the clipboard.
const COPIED_MS = 1600; // long enough to register, short enough not to linger

async function copyToClipboard(text) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied, or an insecure context — try the legacy route.
    }
  }

  // Deprecated, but still the only path on a plain http:// or file:// page.
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.style.cssText = 'position:fixed; top:0; left:0; opacity:0;';
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0, text.length); // iOS ignores select() on its own
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  field.remove();
  return copied;
}

document.querySelectorAll('[data-copy-email]').forEach(button => {
  const [restingLabel, copiedLabel] = button.querySelectorAll('.button__labels > *');
  let resetTimer;

  button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail;
    if (!await copyToClipboard(email)) {
      window.location.href = `mailto:${email}`;
      return;
    }

    button.classList.add('button--changed');
    // Keep the accessible name to whichever label is actually showing — the
    // button is a live region, so the swap is what announces the copy.
    restingLabel.setAttribute('aria-hidden', 'true');
    copiedLabel.removeAttribute('aria-hidden');

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      button.classList.remove('button--changed');
      restingLabel.removeAttribute('aria-hidden');
      copiedLabel.setAttribute('aria-hidden', 'true');
    }, COPIED_MS);
  });
});

// --- Project videos ---
// Case-study clips layered over the still they replace. Deferred twice so three
// looping videos don't sink the page: fetched only when the block is close to
// the viewport, played only while it's on screen.
const videoBlocks = document.querySelectorAll('.project-video');

// Data Saver means don't spend the megabytes at all: nothing below runs, so
// --ready is never added and the still simply stays.
if (videoBlocks.length && !navigator.connection?.saveData) {
  const FETCH_MARGIN = '150% 0px'; // runway to buffer in before it's on screen
  const PLAY_RATIO = 0.15;         // a sliver showing is enough to start
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The sprite sits at a different depth on the homepage than under /projects/,
  // so swap the fragment and keep whichever path the markup already used.
  const setIcon = (use, name) =>
    use.setAttribute('href', use.getAttribute('href').replace(/#icon-.+$/, `#icon-${name}`));

  videoBlocks.forEach(block => {
    const video = block.querySelector('video');
    const toggle = block.querySelector('[data-video-toggle]');
    const toggleIcon = toggle.querySelector('use');
    const replay = block.querySelector('[data-video-replay]');

    // Only the buttons set this, so scrolling past never restarts a video the
    // reader stopped. Reduced motion starts stopped.
    let pausedByReader = reduceMotion;

    const play = () => video.play()?.catch(() => {}); // autoplay can still be refused

    const syncToggle = () => {
      setIcon(toggleIcon, video.paused ? 'player-play' : 'player-pause');
      toggle.setAttribute('aria-label', video.paused ? toggle.dataset.labelPlay : toggle.dataset.labelPause);
    };
    video.addEventListener('play', syncToggle);
    video.addEventListener('pause', syncToggle);

    // One decoded frame is the only thing that reveals the video and its
    // controls, so a 404 or a codec the browser won't touch leaves just the still.
    // Arriving on screen and becoming playable race each other, so whichever
    // lands second is the one that starts it.
    let onScreen = false;
    video.addEventListener('loadeddata', () => {
      block.classList.add('project-video--ready');
      if (onScreen && !pausedByReader) play();
    }, { once: true });

    toggle.addEventListener('click', () => {
      pausedByReader = !video.paused;
      if (pausedByReader) video.pause();
      else play();
    });

    replay.addEventListener('click', () => {
      video.currentTime = 0;
      pausedByReader = false;
      play();
    });

    new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      observer.disconnect(); // a file only needs fetching once
      video.preload = 'auto'; // preload="none" in the markup held it back until here
      video.src = video.dataset.src;
    }, { rootMargin: FETCH_MARGIN }).observe(block);

    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (!onScreen) video.pause();
      else if (!pausedByReader) play();
    }, { threshold: PLAY_RATIO }).observe(block);
  });

  // Touch has no hover for the controls to ride on, so a tap on the video
  // reveals them — and only that one, so moving to the next takes them away.
  if (matchMedia('(hover: none)').matches) {
    const hideAll = except => videoBlocks.forEach(block => {
      if (block !== except) block.classList.remove('project-video--controls-visible');
    });

    videoBlocks.forEach(block => {
      block.addEventListener('click', e => {
        if (e.target.closest('.project-video__controls')) return; // pressing a button isn't a request to dismiss it
        const showing = block.classList.contains('project-video--controls-visible');
        hideAll(block);
        block.classList.toggle('project-video--controls-visible', !showing);
      });
    });

    // A tap anywhere else dismisses them, the same as the mobile menu does.
    document.addEventListener('click', e => {
      if (!e.target.closest('.project-video')) hideAll();
    });
  }
}
