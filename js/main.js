// Custom cursor
const cursor = document.querySelector('.custom-cursor');
// Same test the CSS uses (see tokens.css): only devices with a mouse. Read as a
// live query rather than once at load — a tablet gaining a mouse, or DevTools
// device emulation being switched off, flips this mid-session.
const hoverQuery = matchMedia('(hover: hover)');
let cursorReady = false;

function initCustomCursor() {
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
      const style = getComputedStyle(button);
      document.documentElement.classList.remove('measuring-dock-target');

      // The slot is the button's first child, so the dot normally lands inside
      // the leading edge — opposite the trailing icon. A button whose icon
      // leads moves its slot to the end, so measure from that edge instead.
      const dockX = button.classList.contains('button--dock-end')
        ? rect.right - parseFloat(style.paddingRight) - dockDotRadius
        : rect.left + parseFloat(style.paddingLeft) + dockDotRadius;

      // Cursor is fully hidden at this point (mid-depart), so the jump
      // to the target is imperceptible.
      cursor.style.left = dockX + 'px';
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

// The class is what licenses the CSS to hide the native pointer, so it goes on
// only once there is a dot to replace it with, and comes off the moment there
// isn't. Nothing here can leave the page with no pointer at all.
function syncCustomCursor() {
  if (!cursor) return;
  if (hoverQuery.matches) {
    if (!cursorReady) {
      cursorReady = true;
      initCustomCursor();
    }
    document.documentElement.classList.add('has-custom-cursor');
  } else {
    document.documentElement.classList.remove('has-custom-cursor');
    cursor.classList.remove('custom-cursor--visible');
  }
}

hoverQuery.addEventListener('change', syncCustomCursor);
syncCustomCursor();

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

// Hide navbar on scroll down, show on scroll up
// Always on project pages; on homepage only on mobile (≤768px)
let lastScrollY = window.scrollY;
let suppressHide = false;
let suppressTimeout;

// The homepage is the one whose nav links point at sections of the page itself.
const isHomepage = [...navLinks].some(a => a.getAttribute('href').startsWith('#'));

// Following a nav link holds the bar in place for a moment, so the smooth scroll
// it triggers doesn't immediately hide the bar you just used.
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    suppressHide = true;
    navbar.classList.remove('navbar--hidden');
    clearTimeout(suppressTimeout);
    suppressTimeout = setTimeout(() => { suppressHide = false; }, 1000);
  });
});

window.addEventListener('scroll', () => {
  if (isHomepage && wideQuery.matches) return;
  // Hiding the bar while its menu is open would take the open menu with it
  if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') return;
  // Same for a focus ring inside it: sliding the bar away would carry a focused
  // link off screen while it still holds focus (WCAG 2.2 — 2.4.11). Reveal rather
  // than merely skip, so a bar already hidden when focus arrives comes back.
  if (navbar.contains(document.activeElement)) {
    navbar.classList.remove('navbar--hidden');
    lastScrollY = window.scrollY;
    return;
  }
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

// Tabbing into the bar has to bring it back even with no scroll in between
if (navbar) {
  navbar.addEventListener('focusin', () => navbar.classList.remove('navbar--hidden'));
}

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
  // Hovering holds the icon still so you can look at it, and a tap does the same on
  // touch, where there is no hover to hold. Reduce Motion stops it running at all.
  const footerIconLine = footerIcon.closest('p') || footerIcon;
  let footerIconIndex = 0;
  let footerIconTimer = null;
  let footerIconHeld = false;

  const cycleFooterIcon = () => {
    if (footerIconTimer || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    footerIconTimer = setInterval(() => {
      footerIconIndex = (footerIconIndex + 1) % footerIcons.length;
      footerIconUse.setAttribute('href', `images/icons/sprite.svg#icon-${footerIcons[footerIconIndex]}`);
    }, 300);
  };
  const holdFooterIcon = () => {
    clearInterval(footerIconTimer);
    footerIconTimer = null;
  };

  footerIconLine.addEventListener('mouseenter', holdFooterIcon);
  footerIconLine.addEventListener('mouseleave', () => {
    if (!footerIconHeld) cycleFooterIcon();
  });
  footerIconLine.addEventListener('click', () => {
    footerIconHeld = !footerIconHeld;
    if (footerIconHeld) holdFooterIcon();
    else cycleFooterIcon();
  });

  cycleFooterIcon();
}

// --- Copy email ---
// The address goes to the clipboard rather than handing off to a mail client:
// most people read mail in a browser tab, so a mailto: tends to open some
// unconfigured desktop app and dead-end there. mailto: stays as the last
// resort, for when the browser gives us no way to write to the clipboard.
const COPIED_MS = 1600; // long enough to register, short enough not to linger

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false; // no clipboard, or permission refused — the caller falls back to mailto:
  }
}

const copyStatus = document.querySelector('[data-copy-status]');

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
    // Keep the accessible name to whichever label is actually showing.
    restingLabel.setAttribute('aria-hidden', 'true');
    copiedLabel.removeAttribute('aria-hidden');
    // The announcement goes through a dedicated status node: a live region on the
    // button itself has to announce a name change on the focused element, which
    // screen readers handle inconsistently.
    if (copyStatus) copyStatus.textContent = 'Email copied';

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      button.classList.remove('button--changed');
      restingLabel.removeAttribute('aria-hidden');
      copiedLabel.setAttribute('aria-hidden', 'true');
      if (copyStatus) copyStatus.textContent = '';
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
    const replay = block.querySelector('[data-video-replay]');
    const toggleIcon = toggle?.querySelector('use');
    // A half-authored block skips itself rather than throwing and taking the
    // remaining videos on the page down with it.
    if (!video || !toggle || !replay || !toggleIcon) return;

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
      // The video now covers the still, so hand the still's description over to it —
      // otherwise AT sees a described image and an unnamed video for the same content.
      const still = block.querySelector('img');
      if (still) {
        video.setAttribute('aria-label', still.getAttribute('alt') || '');
        still.setAttribute('aria-hidden', 'true');
      }
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
