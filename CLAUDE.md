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
`.text-display`, `.text-large-title`, `.text-title`, `.text-subtitle`, `.text-subtitle-strong`, `.text-large-body`, `.text-body-strong`, `.text-body`

## Layout

Use `.page-container` on homepage sections and `.page-container-narrow` inside project pages. Wrap major vertical sections in `.section` for consistent padding.

## Images

Stored under `images/{homepage,projects,about,global}/`. Use `.webp` format.