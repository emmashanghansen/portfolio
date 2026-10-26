# CLAUDE.md

Emma Shang Hansen's UX design portfolio. Static HTML, CSS and JS. No build step, no
framework, no package manager — open a file in a browser and it runs.

## Files

- `index.html` — the homepage: hero, then the project grid
- `projects/*.html` — one case study each
- `js/main.js` — custom cursor, navbar, footer icon, hero items, copy email, project
  videos
- `css/` — loaded in this order: `reset.css`, `tokens.css`, `typography.css`,
  `layout.css`, `components.css`, then `home.css` or `project.css`

## Design tokens

Every colour, spacing, type and radius value is a custom property in `css/tokens.css`.
Use a token. Never hardcode a value. Don't change a token or add a new one — if none
fits, ask first. That file is commented — read it for the scale, the
two breakpoints and the `(hover: hover)` device query.

## Typography

Use the semantic classes in `css/typography.css`. Never style a raw element. Modifiers
like `.text-subtle` and the weight ramp must come after the type class, or the cascade
drops them.

## Layout

`.page-container` centres a homepage section. `.project-section` does the same in a case
study, and spaces its children with `> * + *` margins rather than `gap`. Section padding
comes from a bare `section` rule in `layout.css`.

## Elements

Reach for the element that means the thing before a styled div. A div is fine for a box
that only positions or frames something, and nowhere else.

- A captioned image is a `<figure>` with a `<figcaption>`, never a div wrapping an `<img>`
  and a `<p>`. A figure with no caption yet is still a figure.
- The hero details are a `<dl>`. They are name/value pairs.
- The previous/next block is a `<nav>`, labelled "Case studies". A bare div keeps it out
  of the landmark list.
- Back to top is `<a href="#main">`, not a button. The browser scrolls and moves focus on
  its own, and it works with JavaScript off. Do not add a scroll handler.
- Every `<ul>` needs `role="list"`. `reset.css` strips the markers, and Safari then drops
  the list semantics.
- Headings step by one. The cards are `<h2>` on the homepage, which has no heading above
  the grid. In a case study the kicker is the `<h2>`, the real heading below it the
  `<h3>`, and numbered steps are `<h4>`.
- The copy-email announcement goes through the one `[data-copy-status]` region, not an
  `aria-live` on the button. Screen readers handle a focused element renaming itself
  inconsistently.

## Images

Stored under `images/{homepage,projects,about,global,icons}/`. Use `.webp`.

## Video

Stored under `videos/projects/<project>/`, named to match the still it replaces. Encode
with:

```
ffmpeg -i in.mp4 -vf "scale=1536:-2:flags=lanczos" -c:v libx264 -profile:v high \
  -preset slow -crf 27 -pix_fmt yuv420p -g 60 -an -movflags +faststart out.mp4
```

1536px is 2x the 768px content column. `-an` because these are silent. `+faststart` so
playback can begin on the first bytes. H.264 only — every device decodes it in hardware,
which matters more than file size when several loops share a page.

Markup uses the `.project-video` component in `project.css`. The still sits in normal flow
and sizes the box; the video layers over it. `main.js` fetches the video near the viewport
and plays it only on screen. Every video needs a still — the still is the fallback. Only
the wrapper and `.project-video__controls` are named, so keep the markup to that shape.
