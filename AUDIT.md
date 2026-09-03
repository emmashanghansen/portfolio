# Frontend audit

Full read of all six HTML pages, seven CSS files and `js/main.js` (~2,800 lines).
Stage 1 is already committed. Everything below it is proposed, not done.

Totals as they stand: **35 KB CSS**, **21 KB JS**, **56 distinct classes**, 37 sprite
icons, two variable fonts from Google.

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

---

## Stage 3 — JavaScript (proposed)

`main.js` is 523 lines. Roughly 40% is the custom cursor. You have chosen to keep both
the cursor and the footer cycler and slim them, which is the right instinct for a design
portfolio — they are the personality, and personality is the product here.

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

### Navbar (~70 lines)

- `sectionLinkMap` and `sectionIds` are built with 10 lines of DOM walking, and the only
  thing either is ever used for is `const isHomepage = sectionIds.length > 0`. Replace the
  whole block with a `data-page="home"` attribute on `<body>`, or a single
  `document.getElementById('projects')` check.
- The nav-link handler **delays every navigation by 240ms** via
  `setTimeout(() => window.location.href = href, 240)` after `preventDefault()`. This adds
  a quarter-second to every click, and hand-rolling navigation loses the browser's own
  handling. If the delay exists to let the bar animate, that animation is not worth 240ms
  on every page change. My recommendation is to remove it.
- `navLinks.forEach` runs before `suppressHide` and `suppressTimeout` are declared further
  down the file. It works — `let` hoists into the temporal dead zone but the handler only
  runs on click, long after declaration — but it reads as a bug and will trip up the next
  person, including you in six months.

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
