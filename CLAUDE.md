# CLAUDE.md

Emma Shang Hansen's UX design portfolio — static HTML/CSS/JS, no build step, framework, or package manager.

## Files

- `index.html` — homepage with hero and project grid sections (currently skeletal)
- `projects/project1.html`, `project2.html` — individual case study pages (currently empty)
- `stylesheet.html` — living style guide / component reference
- `js/main.js` — for js
- `css/reset.css` — browser reset
- `css/styles.css` — all styles: design tokens → typography classes → layout → components

## Design tokens

All spacing, colour, typography, and radius values are CSS custom properties in `css/styles.css :root`. Always use tokens — never hardcode values.

- Colours: `--colour-background-{1,2}`, `--colour-foreground-{1,2}`, `--colour-stroke-{1,2}`
- Spacing: `--spacing-{xxs,xs,s,m,l,xl,xxl}` plus `--spacing-{s-64,m-96,l-144}`
- Font sizes: `--fs-{s,m,l,xl,xxl}`; weights: `--fw-{regular,medium,semi,bold}`
- Page widths: `--page-max-width-home` (800px), `--page-max-width-project` (640px)
- etc

## Typography

Use semantic class names, never style raw elements directly:
`.text-display`, `.text-large-title`, `.text-title`, `.text-subtitle`, `.text-large-body`, `.text-body-strong`, `.text-body`, plus the `.text-strong` modifier

## Layout

Use `.page-container` on homepage sections and `.page-container-narrow` inside project pages. Wrap major vertical sections in `.section` for consistent padding.

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
