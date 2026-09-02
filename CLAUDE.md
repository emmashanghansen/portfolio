# CLAUDE.md

Emma Shang Hansen's UX design portfolio — static HTML/CSS/JS, no build step, framework, or package manager.

## Files

- `index.html` — homepage with hero and project grid sections
- `projects/*.html` — individual case study pages
- `en/` — the English site, mirroring the two above (see Languages)
- `js/main.js` — for js
- `css/reset.css` — browser reset
- `css/tokens.css`, `typography.css`, `layout.css`, `components.css`, `home.css`, `project.css`

## Languages

Norwegian is the default and lives at the root. English mirrors it under `en/`,
file for file. `css/`, `js/`, `images/` and `videos/` are shared — never duplicated.

The two trees must stay structurally identical: same classes, same ids, same order,
same `data-` attributes, same file names. That is what keeps a diff of a page and its
twin showing only prose. **Any content change on one side must be mirrored on the other.**

Only these differ between a page and its twin: `<html lang>`, `<title>`, the `meta`
description, the `og:` tags, `rel="canonical"`, visible text, `alt` text, `aria-label`s,
the language link, and the number of `../` in asset paths (`en/projects/` sits two levels
deep, so it uses `../../`).

Each page carries `rel="canonical"` plus three `hreflang` alternates (`no`, `en`,
`x-default` → Norwegian). Google ignores hreflang whose targets are not canonical, so
the canonical and the `hreflang` for the page's own language must be the same URL.

The language switch is a plain `<a>`, last in `.navbar__links` — last so the mobile
panel stacks it below Copy email without a flex `order` that would put tab order out of
step with what you see. It is labelled with the language it switches **to**, written in
that language (`Norsk` / `English`), and carries `lang` + `hreflang` so a screen reader
pronounces the label correctly (WCAG 3.1.2).

Spelling: **`epost`**, never `e-post`.

Strings that live in `main.js` are read from the markup rather than hardcoded, so they
translate with the page: menu labels via `data-label-open`/`data-label-close`, the
copy-email announcement from the button's own second label. Paths in JS keep whatever
the markup used and swap only the `#icon-` fragment — hardcoding a relative sprite path
breaks it at a different tree depth.

`en/projects/nga.html` and `nikita.html` are English-only for now: unfinished and unlinked,
so they carry no language link and no `hreflang`.

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
