# To-do

Sitewide todos go in General, even when they touch every project page. A project
subsection is only for that project. Uncategorised is for when you can't tell.

## General

- [ ] **Image lightbox on project pages** — clicking an image opens it almost
      full-screen, with a close button in the upper right corner.

- [ ] **Header interactions** — add hover/click interactions to the portfolio header, and
      make the logo change to `--colour-brand` on hover.

- [ ] **Word tooltips** — UI and functionality for hover/click tooltips on certain words
      in the case studies.

- [ ] **Bug: project footers collide with the scroll-up button** — they need more margin
      on top.

- [ ] **Bug: the footer doesn't reveal on mobile** — it used to; now it's just static.
      Make it reveal the way it does on desktop.

- [ ] **og:image URLs are absolute** — every page hardcodes
      `https://emmashanghansen.github.io/portfolio/`. Putting a custom domain on the site
      means rewriting `og:url`, `og:image` and `rel="canonical"` everywhere, or link
      previews break.

- [ ] **Doodles / personality pass** — deliberately last, after applications go out.

## Home

- [ ] **Homepage cards at 2x** — three of the four cards are 960x520, matching their
      `width`/`height` attributes 1:1, so they render at 1x and go soft on retina and on
      the 1.1 hover zoom. `card-rat.webp` is already 1920x1040; re-exporting the other
      three at the same size would even them out with no markup change.

- [ ] **Unused `.projects-heading` rule** — `home.css` styles a class no page uses.
      The dangling `aria-labelledby` it went with is already gone from `index.html`.

## About me

- [ ] **About page** — doesn't exist yet, and `images/about/` is empty.

## Projects

### AI POCUS

- [ ] **Hero as video** — the `.project-hero__image` in `projects/pocus.html` should
      become a looping muted `<video autoplay loop playsinline>` once the animated export
      is ready, replacing the placeholder `<img>`.

- [ ] **Step numbering** — the "Step 1 / 2 / 3" headings sit above screens labelled
      "Fase 2 / 3 / 4". Presumably Fase 1 is setup and isn't shown, but the mismatch is
      more visible now those three stills loop as video.

- [ ] **Norwegian passage left as a comment** — Final testing carries the fuller feedback
      sentence: input being tiring, and upgrading the guidance images to small animations.
      Render it in English if it still says something worth saying, then delete the comment.

### Medication administration

- [ ] **Image captions** — four `<!-- TODO: caption -->` markers in
      `projects/medication.html`. Only the storyboard has a real caption so far.

- [ ] **Copy proofread** — the body text was transcribed from a low-resolution mockup
      render, so individual sentences want a careful read. Note the storyboard caption
      still says "medication *distribution* routine" while the heading two lines above it
      says "administration".

### Jotron

- [ ] **Case study** — the homepage card is "Coming soon" with no page behind it.

### Rat with a Postman Hat

_Nothing open._

### NGA — shelved, not linked from the homepage

- [ ] **Case study images** — five `placeholder.svg` left in `projects/nga.html`. All the
      copy is written, so images are the only thing between it and a live card.

### Nikita — shelved, not linked from the homepage

- [ ] **Case study** — `projects/nikita.html` has two empty `<section>` tags and a
      placeholder hero. Decide whether to write it out or leave the card hidden.

## Uncategorised

_Nothing here yet._

## Done

- [x] **Norwegian hero copy left as a comment** — superseded by the scrapbook hero's
  notebook sentence; the comment is deleted.
- [x] **WCAG 2.2 AA pass** — audit plus remediation across all six pages. Full findings,
  accepted deviations and verification steps in
  `~/.claude/plans/audit-this-website-based-starry-island.md`.
- [x] **Projects heading** — the homepage has no visible heading over the grid. The cards
  are `<h2>` (so there is no h1→h3 jump) and `#projects` names itself with `aria-label`.
  The earlier `aria-labelledby="projects-heading"` pointed at an id that did not exist.
- [x] **Doctor quotes alt text** — the three quotes are now transcribed into the `alt`.
- [x] **Site assets** — all three now exist and are linked on every page:
  - favicon — `favicon.svg`
  - apple-touch-icon — `apple-touch-icon.png`, 180×180, rendered from the favicon
  - og:image — `images/global/social-preview.png`, 2400×1260, alongside `og:url`,
    `og:type` and `twitter:card`
