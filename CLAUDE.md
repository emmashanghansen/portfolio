# CLAUDE.md

Emma Shang Hansen's UX design portfolio — static HTML/CSS/JS, no build step, framework, or package manager.

## Files

- `index.html` — homepage with hero and project grid sections
- `projects/*.html` — individual case study pages
- `js/main.js` — for js
- `css/reset.css` — browser reset
- `css/tokens.css`, `typography.css`, `layout.css`, `components.css`, `home.css`, `project.css`

## Design tokens

All spacing, colour, typography, and radius values are CSS custom properties in
`css/tokens.css :root`. Always use tokens — never hardcode values.

- Colours: `--colour-background-{1,2,3}`, `--colour-foreground-{1,2}` plus
  `--colour-foreground-inverted`, `--colour-stroke-{1,2,3}`, `--colour-brand`
- Spacing: `--spacing-{none,xxs,xs,s,m,l,xl,xxl}` plus `--spacing-big-{s,m,l}` for
  section-level rhythm
- Font sizes: `--fs-{xxs,xs,s,m,l,xl,xxl}`; weights: `--fw-{light,regular,medium,semi,bold}`
- Page widths: `--page-max-width-large` (1056px), `--page-max-width-medium` (768px),
  `--page-max-width-small` (640px)
- Radius: `--radius-{none,small,medium,large,circular}`; shadows `--shadow-0{1,2,3}`

Sizes from `--fs-m` up and spacing from `--spacing-xl` up are fluid `clamp()` values, so
they scale between mobile and desktop without a breakpoint. See the comments in
`tokens.css` for the two breakpoints and the `(hover: hover)` device query.

## Typography

Use semantic class names, never style raw elements directly:
`.text-display`, `.text-large-title`, `.text-title`, `.text-subtitle`, `.text-large-body`,
`.text-body`, `.text-caption`.

Modifiers, which must stay after the type classes in the cascade: `.text-subtle`,
`.text-underline`, `.text-link`, and the weight ramp `.text-strong` / `.text-stronger` /
`.text-strongest`. `.visually-hidden` hides from screen but keeps the element in the
accessibility tree.

## Layout

`.page-container` centres and constrains a homepage section. `.project-section` does the
same inside a case study and spaces its children with `> * + *` margins rather than `gap`.
Section padding currently comes from a bare `section` rule in `layout.css`.

## Elements

Reach for the element that means the thing before reaching for a styled div. A div is
fine for a box that exists purely to position or frame something (`.project-card__image`,
`.scroll-top-slot`, the `.project-hero__detail` pairs inside a `<dl>`), and nowhere else.

- **A captioned image is a `<figure>`** with a `<figcaption>`, never a div wrapping an
  `<img>` and a `<p>`. `.project-section__image` is the class on the figure; the caption
  keeps `.text-caption .text-subtle`. A figure with no caption yet is still a figure.
- **The hero details are a `<dl>`** — they are name/value pairs. Each pair is a
  `<dt>`/`<dd>` grouped in a `<div class="project-hero__detail">`, which is the sanctioned
  way to group them inside a description list.
- **The previous/next block is a `<nav>`**, labelled "Case studies". It is navigation,
  and a bare div keeps it out of the landmark list.
- **Back to top is `<a href="#main">`, not a button.** The browser scrolls, honours the
  `scroll-behavior: smooth` in `reset.css` (already reduced-motion guarded), and moves
  focus to `#main` because it carries `tabindex="-1"`. No JavaScript, and it works with
  JavaScript off. Do not reintroduce a scroll handler for this.
- **A `<ul>` that has had its markers removed needs `role="list"`**, or Safari drops the
  list semantics. `reset.css` strips markers from every `ul`, so this applies to all of
  them. A `<dl>` does not need it.
- **Headings step by one.** On the homepages the project cards are `<h2>`; there is no
  section heading above them, so the section names itself with `aria-label`. Inside a case
  study the kicker ("Background", "Bakgrunn") is the `<h2>` and the real heading below it
  is the `<h3>`, with `<h4>` for numbered steps.
- The copy-email announcement goes through the single `[data-copy-status]` region near the
  skip link on every page — not an `aria-live` on the button, which screen readers handle
  inconsistently when the name of the focused element changes.

## Images

Stored under `images/{homepage,projects,about,global}/`. Use `.webp` format.

## Video

Stored under `videos/projects/<project>/`, mirroring the image folders, and named to match
the still each one replaces. Encode with:

```
ffmpeg -i in.mp4 -vf "scale=1536:-2:flags=lanczos" -c:v libx264 -profile:v high \
  -preset slow -crf 27 -pix_fmt yuv420p -g 60 -an -movflags +faststart out.mp4
```

1536px is 2x the 768px content column; `-an` because these are silent; `+faststart` so
playback can begin on the first bytes. H.264 only — it is the one codec every device
decodes in hardware, which matters more than file size when several loops share a page.

Markup uses the `.project-video` component (see `project.css`): the still sits in normal flow
and sizes the box, the video is layered over it, and `main.js` fetches it only near the
viewport and plays it only while on screen. The still is the fallback, so every video
needs one. Only the wrapper and `.project-video__controls` are named — the image, the video and
the buttons are reached through the wrapper, so keep the markup to that shape.
