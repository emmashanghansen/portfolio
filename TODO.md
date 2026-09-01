# To-do

- [ ] **Image lightbox on project pages** — clicking an image opens it almost
      full-screen, with a close button in the upper right corner.

Add hover/click interactions to the portfolio header.
Make logo change to color-brand on hover. 
Add UI and functionality for hover/click tooltips for certain words in projects. 

- [ ] **Pocus hero as video** — the `.project-hero__image` in `projects/pocus.html`
      should become a looping muted `<video autoplay loop playsinline>` once the
      animated export is ready, replacing the placeholder `<img>`.

- [ ] **NGA case study images** — five `placeholder.svg` left in `projects/nga.html`. All
      the copy is written, so images are the only thing between it and a live card. The
      cheapest of the three "Coming soon" cards to finish.

- [ ] **Medication image captions** — four `<!-- TODO: caption -->` markers in
      `projects/medication.html`. Only the storyboard has a real caption so far.

- [ ] **Medication copy proofread** — the body text was transcribed from a low-resolution
      mockup render, so individual sentences want a careful read. Note the storyboard
      caption still says "medication *distribution* routine" while the heading two lines
      above it says "administration".

- [ ] **Nikita case study** — `projects/nikita.html` has two empty `<section>` tags and a
      placeholder hero. Decide whether to write it out or hide the card until it's ready.

- [ ] **Jotron case study** — the homepage card is "Coming soon" with no page behind it.

- [ ] **Pocus step numbering** — the "Step 1 / 2 / 3" headings sit above screens labelled
      "Fase 2 / 3 / 4". Presumably Fase 1 is setup and isn't shown, but the mismatch is
      more visible now those three stills loop as video.

- [ ] **Homepage cards at 2x** — four of the five cards are 960x520, matching their
      `width`/`height` attributes 1:1, so they render at 1x and go soft on retina and on
      the 1.1 hover zoom. `card-rat.webp` is already 1920x1040; re-exporting the other
      four at the same size would even them out with no markup change.

- [ ] **About page** — doesn't exist yet, and `images/about/` is empty.

- [ ] **Doodles / personality pass** — deliberately last, after applications go out.

- [ ] **og:image URLs are absolute** — every page hardcodes
      `https://emmashanghansen.github.io/portfolio/`. Putting a custom domain on the site
      means rewriting `og:url` and `og:image` everywhere, or link previews break.

## Done

- [x] **WCAG 2.2 AA pass** — audit plus remediation across all six pages. Full findings,
  accepted deviations and verification steps in
  `~/.claude/plans/audit-this-website-based-starry-island.md`.
- [x] **Projects heading** — restored as an `<h2>`, which also gave `#projects` an
  accessible name via `aria-labelledby`.
- [x] **Doctor quotes alt text** — the three quotes are now transcribed into the `alt`.

- [x] **Site assets** — all three now exist and are linked on every page:
  - favicon — `favicon.svg`
  - apple-touch-icon — `apple-touch-icon.png`, 180×180, rendered from the favicon
  - og:image — `images/global/social-preview.png`, 2400×1260, alongside `og:url`,
    `og:type` and `twitter:card`

Bug: project footers need more margin on top, because content collides with the scroll-up button. 
Bug: The footer doesn't "reveal" like it used to, on mobile. Now it's just static. Make it reveal, like on desktop. 