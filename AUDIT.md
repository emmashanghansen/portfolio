# Frontend audit

Full read of all six HTML pages, seven CSS files and `js/main.js` (~2,800 lines).
Stages 1 and 1b are committed. Everything below them is proposed, not done.

Totals at the start: **35 KB CSS**, **21 KB JS** (523 lines), **56 distinct classes**,
37 sprite icons, two variable fonts from Google. `main.js` is now 467 lines.

---

## What is already good

Worth saying, because it shapes what is worth changing. The tokens are genuinely
complete and consistently used — nine unused ones out of ~60 is a very low miss rate.
Every image has `width`/`height`, so nothing shifts as the page loads. `role="list"` is
correctly applied everywhere `list-style: none` would otherwise strip list semantics in
Safari. Reduced-motion is handled in five places rather than forgotten. The video
loading strategy (fetch near the viewport, play only on screen, respect Data Saver) is
better than most production sites manage. The comments explain *why*, not *what*.

The problems below are refinements on something already well built.

---

## Stage 1 — semantics (committed: `a9a8137`)

### Heading levels

You asked specifically about h1 → h3 jumps. **There was exactly one, on the homepage.**
The four project cards were `h3` with no `h2` anywhere above them. Now `h2`.

The five case studies had **no jumps at all**. They already read
h1 → h2 (kicker) → h3 (heading) → h4 (steps), which is a correct, non-skipping outline.
Your instinct that the kicker sits a level above the heading is exactly what the markup
already encodes, so nothing there needed relabelling.

What the case studies *do* have is an inconsistent mapping between level and style:

| Page | h2 style | h3 style |
|---|---|---|
| pocus, medication, nikita | `text-subtitle text-subtle` | `text-title` |
| nga | `text-subtitle text-subtle` | `text-subtitle text-stronger` |
| rat | `text-title` (real heading, not a kicker) | `text-subtitle text-subtle` |

So `rat.html` inverts the convention and `nga.html` introduces a third variant. A reader
moving between case studies gets a different visual hierarchy on each. See Stage 2.

### Elements

- **20 captioned images** were `<div>` + `<img>` + `<p>` → now `<figure>` + `<figcaption>`.
  This is the single clearest "styled div" in the codebase: an image with a caption is
  the textbook `figure` case.
- **The previous/next block** at the foot of each case study was a bare `<div>` → now
  `<nav aria-label="Case studies">`. It is site navigation and was invisible in the
  landmark list.
- `aria-labelledby="projects-heading"` pointed at an id that does not exist → replaced
  with `aria-label="Projects"`, so the landmark has a name again.
- Redundant `class="text-display"` on two spans inside an h1 that already carries it.
- **Copy-email status region bug**: `main.js` announces "Email copied" through
  `[data-copy-status]`, which only existed on the homepage. The five case studies had
  `aria-live="polite"` on the button instead — the exact approach the comment in
  `main.js` says is unreliable. The region now exists on all six pages; the `aria-live`
  attributes are gone.
- Two empty `<section>` elements in `nikita.html` rendering as blank padded space.

---

## Stage 1b — native HTML in place of JavaScript (committed)

Every one of these was checked against the actual behaviour in a browser, not assumed.

### Back to top: `<button>` + 12 lines of JS → `<a href="#main">`

The old button called `window.scrollTo` with a reduced-motion check, then moved focus to
`#main` so the next Tab continued from the top of the page. A plain anchor does **all of
that natively**: the browser scrolls, honours the `scroll-behavior: smooth` already in
`reset.css` (which is already wrapped in a reduced-motion guard), and moves focus to the
target because `#main` carries `tabindex="-1"`.

Verified: click → `scrollY: 0`, `document.activeElement` is `main`, next Tab lands on the
first link inside `main`. Identical behaviour, and it now works with JavaScript disabled.

### Hero details: `<ul>` → `<dl>`

"Client / SINTEF Digital", "Role / UX designer" are name-value pairs, which is precisely
what a description list is for. Each pair is now `<dt>`/`<dd>` grouped in a `<div>` (the
sanctioned way to group them inside a `<dl>`). The `role="list"` workaround is no longer
needed. No CSS changed.

### Clipboard: dropped the `execCommand` fallback (~22 lines)

The fallback built a hidden `<textarea>`, selected it, called the deprecated
`document.execCommand('copy')`, then restored focus. It only ever mattered on plain
`http://` or `file://`. The site is on HTTPS, where `navigator.clipboard` always exists,
and the `mailto:` fallback already catches every failure. Four lines now.

### Nav link handler: removed a 240ms delay and a dead branch (~14 lines → 7)

The handler called `preventDefault()` and then `setTimeout(() => window.location.href =
href, 240)` — a quarter-second added to every cross-page click, to animate a bar on a page
that was about to unload. Gone; the browser navigates normally again.

Its `else if` branch was **unreachable**. The only link it matches is either `#projects`
or `../index.html#projects`, so the `href === currentPage` test could never be true, and
the `#projects` case was excluded by the branch's own guard. What survives is the one part
that mattered: hold the bar still for a second so the smooth scroll it triggers does not
immediately hide the bar you just clicked.

### `sectionLinkMap` / `sectionIds`: 10 lines → 1

Ten lines of DOM walking built a map that was used for exactly one thing:
`sectionIds.length > 0`. Now `[...navLinks].some(a => a.getAttribute('href').startsWith('#'))`.

### What was tried and rejected: `<details>` for the mobile menu

The obvious candidate — `<details>`/`<summary>` gives you the open/closed state,
`aria-expanded` and keyboard support for free, deleting ~25 lines. **It does not work
here**, and I tested rather than guessed.

The menu has to be a plain row on desktop, which means forcing a closed `<details>` to
show its content with CSS alone. It cannot be done: the browser hides the content via
`content-visibility` on an internal slot, so even `display: flex !important` on the child
leaves `checkVisibility()` returning `false`. Making it work needs JavaScript toggling the
`open` attribute on resize — more code than the current implementation, not less.

`<details>` would be the right call if the menu were mobile-only. It isn't.

### Worth knowing for the lightbox on your TODO

When you build it, use `<dialog>` with `showModal()`. You get the focus trap, Escape to
close, the backdrop, and the rest of the page made inert — natively, for about five lines
of JS instead of eighty. That is the single best modern-HTML win still available on this
site, and it is in work you have not written yet.

---

## Stage 2 — CSS (proposed)

### Dead code, delete outright

Verified by diffing every selector against every HTML file and against `main.js`:

| What | Where | Note |
|---|---|---|
| `.elevation-01/02/03` | `layout.css` | Never used on any element |
| `.tag` | `home.css`, `typography.css` | Component with no markup |
| `.text-large-body` | `typography.css` | Never used |
| `.text-strongest` | `typography.css` | Never used |
| `.projects-heading` | `home.css` | Left behind when the heading was removed |
| `.button--dock-end` | `components.css` + `main.js` | A whole cursor variant, never applied |
| 9 unused tokens | `tokens.css` | `--colour-grey-60`, `--colour-transparent`, `--colour-stroke-1`, `--colour-image-placeholder`, `--fs-xxs`, `--fw-light`, `--spacing-big-s`, `--page-max-width-small`, `--radius-none` |
| `#icon-eye` | `sprite.svg` | Only sprite symbol never referenced |

That is roughly **40 lines of CSS and 25 lines of JS gone with zero behaviour change**.
Keep the unused tokens if you want the scale to stay complete as a design system — that
is a defensible reason, unlike the dead classes.

### The 87 `class="text-body"` problem

This is the biggest class-count reduction available, and it needs a decision from you
because it contradicts a rule in `CLAUDE.md`.

`class="text-body"` appears **87 times**, on 103 `<p>` and 4 `<li>` — and *nowhere else*.
`text-caption text-subtle` appears 20 times, all on captions. `text-subtitle text-subtle`
29 times. Combined, roughly **130 class attributes that carry no information**: they say
"this paragraph looks like a paragraph".

The rule "never style raw elements directly" is a good default, and it earns its keep for
headings, where the level and the size genuinely need to vary independently. It does not
earn its keep for body copy that is identical in all 107 places. Three scoped rules —

```css
.project-section p,
.project-section li { /* what .text-body does */ }
.project-section figcaption { /* what .text-caption text-subtle does */ }
```

— would remove ~130 class attributes from the markup and shrink every HTML file
noticeably. The type classes stay available for the cases that deviate.

**Trade-off, stated honestly:** you lose the ability to see the type ramp in the markup at
a glance, and a `<p>` dropped outside `.project-section` no longer inherits anything. If
you value reading the hierarchy straight off the HTML, keep it as is — that is a real
benefit, not a rationalisation. My read is that at 87 identical repetitions the ratio has
tipped, but it is your codebase and your call. **If you take this, update `CLAUDE.md` in
the same commit** so the rule and the code do not disagree.

### Structural duplication

Seven classes exist only to say "stack these children in a column with a gap":
`.projects-heading`, `.project-card__body`, `.project-hero__title`, `.project-hero__detail`,
`.project-section__image`, `.footer__links`, `.footer__text`. A single utility —

```css
.stack { display: flex; flex-direction: column; gap: var(--stack-gap, var(--spacing-m)); }
```

— replaces all seven, with `style="--stack-gap: var(--spacing-xs)"` where the gap differs.
Seven named classes become one. The cost is that gap values move into the markup, which
is arguably worse for a design system than for a website. **My recommendation: do the
deletions and the `text-body` change first, live with them, and only reach for `.stack` if
the CSS still feels repetitive afterwards.** Two of those seven are already gone by then.

### Smaller CSS items

- **`body { overflow-x: hidden }` in `layout.css` is a likely cause of your open
  TODO bug** "the footer doesn't reveal like it used to, on mobile". Overflow on `body`
  makes it a scroll container, which is a well-known way to break `position: sticky` on
  descendants — and `.footer` is sticky. Worth testing first: remove it, then find
  whatever is actually overflowing sideways and fix that directly.
- `.navbar__logo:hover` (`components.css:304`) and `.text-link:hover`
  (`typography.css:90`) sit **outside** `@media (hover: hover)`, which the comment block
  in `tokens.css` says everything must do. On a phone, tapping the logo leaves it stuck
  brand-red until you tap elsewhere. Your own rule, two rules missing it.
- **`section { padding: … }` styles a raw element**, then `.project-section` immediately
  resets it to `0`. The base rule is being fought rather than used. Scope it to a class.
- **`#home-hero` and `#footer-cycling-icon` are ID selectors used for styling.** Both
  should be classes; ids are for anchors and scripting. `#footer-cycling-icon` also
  hardcodes `padding-bottom: 3px`, the only hardcoded value in the codebase.
- `.button--disabled` duplicates what `:disabled` already provides, and the markup
  carries both. Use `.button:disabled` and delete the class.
- **`.has-custom-cursor` rules live in `reset.css`.** A reset should not know a component
  exists. Move to `components.css`.
- **Five separate `@media (prefers-reduced-motion: reduce)` blocks** across four files.
  Correct behaviour, scattered enforcement — easy to forget the sixth.

### Loading

Seven render-blocking stylesheets per page (six local + Google Fonts). The local six are
cheap on HTTP/2 but not free. More significant: **`Figtree:ital,wght@0,300..900;1,300..900`
requests the italic axis, and there is not a single `<em>` or `<i>` on the entire site.**
Dropping `ital` removes a whole font file from every page load. Both families also request
weights 200–900 when only 400/500/600/700 are used.

The bigger win, if you want it, is self-hosting both fonts subset to Latin: it removes two
DNS lookups, two TLS handshakes and a render-blocking third-party round trip from every
page. That is a real chunk of your time-to-first-paint, and it is the single most
effective "make it lightweight" change available.

It also removes a fragility that showed up while auditing: when `fonts.googleapis.com` is
unreachable, the entire visual identity falls back to `system-ui` and the page renders in
a generic system sans. The `font-family` declarations are correct — the typography simply
depends on a third party being reachable. Self-hosting makes that impossible.

---

## Stage 3 — JavaScript (proposed)

`main.js` is down to 467 lines after Stage 1b. Roughly half of what remains is the custom
cursor. You have chosen to keep both the cursor and the footer cycler and slim them, which
is the right instinct for a design portfolio — they are the personality, and personality is
the product here.

The navbar items in this stage are already done (see Stage 1b). What is left:

### Custom cursor (~150 lines JS, ~90 CSS)

- Delete the `button--dock-end` branch entirely: dead in CSS, dead in markup, and it
  costs a `classList.contains` on every dock plus a second measurement path.
- The `measuring-dock-target` forced-reflow dance is clever and correct, but it exists
  only because the navbar is `justify-content: space-between`, so opening the dock slot
  shifts siblings. A fixed-width or `margin-left: auto` navbar would remove the need for
  the whole measurement mechanism.
- `sessionStorage` is written on **every** `mousemove`. That is hundreds of writes a
  second during normal movement, and `sessionStorage` is synchronous and hits disk.
  Throttle to the `mouseleave`/`pagehide` event instead — one write, same result.
- **Accessibility note, not a request to remove it:** `cursor: none` on every link and
  button means anyone with a motor or vision difficulty who relies on the system cursor
  (including a larger or high-contrast OS cursor) loses it. The dot is 24px and
  brand-red, so it is visible — but it does not respect OS cursor settings. Consider
  disabling it under `prefers-reduced-motion: reduce`, which is a reasonable proxy.

### Footer icon cycler (~45 lines)

- `setInterval` at 300ms **runs forever**, including while the tab is in the background.
  Gate it on `document.visibilityState` — a two-line change that stops it burning battery
  on a tab nobody is looking at.
- 30 of the 37 sprite icons exist solely to feed this loop. That is fine if you like it
  (I think you do), but it means the 27 KB sprite is essentially a decorative asset. Worth
  knowing what it is buying.

---

## Stage 4 — content and site integrity

Not code quality, but found while reading and worth acting on before anything else here.

- **`nga.html` and `nikita.html` are live, published and unreachable.** No homepage card
  links to either. `rat.html`'s footer has no "next", so the previous/next chain dead-ends
  before them. They are reachable only by direct URL — and by search engines, which will
  index them. `nga.html` ships **five `placeholder.svg` images** with captions describing
  what should be there; `nikita.html` has a placeholder hero and one section of copy.
  Either finish them, or add `<meta name="robots" content="noindex">` until you do.
- `card-nga.webp` and `card-nikita.webp` exist in `images/homepage/` but no page
  references them — the cards were built and then removed, or never added.
- `images/global/logo-brown-no_bg-41230c.webp` is unreferenced.
- `.DS_Store` files are committed at the repo root and in `images/`. Add a `.gitignore`.
- Empty placeholder directories: `images/about/`, `images/global/`, `images/projects/project1/`.
- **`CLAUDE.md` is out of date.** It documents `stylesheet.html`, `css/styles.css`,
  `projects/project1.html` and `projects/project2.html` — none of which exist. It lists
  token names (`--colour-background-{1,2}`, `--spacing-{s-64,m-96,l-144}`,
  `--page-max-width-home`) that do not match `tokens.css`. Fix this early: it is the file
  that tells an assistant how to work on this repo, and right now it is misleading.

---

## Suggested order

1. **Stage 4 first** — the `noindex` on two unfinished public pages is the only finding
   with a visible consequence for someone applying for jobs, and `CLAUDE.md` being wrong
   makes every later session worse. Half an hour.
2. **Stage 2 deletions** — dead classes, dead tokens, dead icon, the two hover-query
   misses, the ID selectors. Purely subtractive, nothing to weigh up. An hour.
3. **The `overflow-x: hidden` investigation** — you have an open bug that this probably
   explains.
4. **The fonts** — drop `ital`, narrow the weight ranges. Ten minutes for a real payload
   win. Self-hosting is a bigger job; do it separately if you want it.
5. **The `text-body` decision** — needs your call, and `CLAUDE.md` changes with it.
6. **Stage 3 JS slimming** — the cursor and cycler cleanups. Lowest risk of the lot
   because nothing about the visible behaviour changes.
7. **`.stack`** — only if the CSS still feels repetitive after 2 and 5. It probably will
   not.
