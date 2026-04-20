# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Emma Shang Hansen's UX design portfolio — a static HTML/CSS/JS site with no build step, framework, or package manager.

## Development

Open directly in a browser or use any static file server:

```bash
npx serve .
# or
python3 -m http.server
```

## Architecture

- `index.html` — homepage with hero and project grid sections (currently skeletal)
- `projects/project1.html`, `project2.html` — individual case study pages (currently empty)
- `stylesheet.html` — living style guide / component reference; use this to preview components in isolation
- `navbar.html` — standalone navbar partial; `stylesheet.html` fetches and injects it via `fetch()`; all other pages inline the navbar directly
- `js/main.js` — handles mobile hamburger menu open/close only
- `css/reset.css` — browser reset
- `css/styles.css` — all styles: design tokens → typography classes → layout → components
- `css/fonts.css` — empty; fonts are loaded via `<link>` tags in each HTML file (Adobe Fonts for New Kansas, Google Fonts for Figtree)

## Design tokens (css/styles.css `:root`)

All spacing, colour, typography, and radius values are CSS custom properties. Always use tokens — never hardcode values. Key conventions:

- Colours: `--colour-background-{1,2}`, `--colour-foreground-{1,2}`, `--colour-stroke-{1,2}`
- Spacing scale: `--spacing-{xxs,xs,s,m,l,xl,xxl}` plus big steps `--spacing-{s-64,m-96,l-144}`
- Font sizes: `--fs-{s,m,l,xl,xxl}`; font weights: `--fw-{regular,medium,semi,bold}`
- Page widths: `--page-max-width-home` (800px) for homepage, `--page-max-width-project` (640px) for case studies

## Typography classes

Apply semantic class names rather than styling raw HTML elements directly:
`.text-display`, `.text-large-title`, `.text-title`, `.text-subtitle`, `.text-subtitle-strong`, `.text-large-body`, `.text-body-strong`, `.text-body`

## Layout pattern

Use `.page-container` (max 800px) on homepage sections and `.page-container-narrow` (max 640px) inside project pages. Wrap major vertical sections in `.section` for consistent top/bottom padding.

## Images

Stored under `images/{homepage,projects,about,global}/`. Use `.webp` format. The `empty.txt` files are placeholders keeping empty folders in git.
