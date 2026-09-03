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

The one deliberate exception is the language banner, which exists only on the Norwegian
pages — see below. Expect a diff of a root page against its English twin to show the
banner and its `<head>` script, and nothing else structural.

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

### Language banner

**Currently switched off** by a single `display: none` rule at the end of the language
banner section in `components.css`. Delete that rule to bring it back; everything below
still describes how it behaves when it is on. The "English" link in the navbar is
unaffected and stays visible, so there is still a way across for a visitor who needs one.

The site never redirects on browser language. Instead each Norwegian page carries a
`.language-banner` offering the English version, shown only to a visitor whose browser
lists no Norwegian at all. There is no banner on the English pages: English is the
fallback, and anyone reading it got there by choosing to.

It ships **visible** in the markup, and an inline `<script>` in `<head>` hides it before
first paint by putting `.language-banner-off` on `<html>`. That direction round means a
Norwegian reader never sees it flash, and an English reader never has the page shift out
from under them. With JS off, it stays: a link to the English version is harmless.

That script must stay **above the stylesheet links**. A script placed after a
`<link rel="stylesheet">` waits for that sheet before running, and the Google Fonts
sheet is the slowest thing on the page — putting it lower reintroduces the flash it
exists to prevent, and stalls HTML parsing while it waits.

Dismissal is remembered in `localStorage` under `language-banner-dismissed`. Clicking
any `a[hreflang]` sets it too: reaching for the switch settles the question either way,
so someone whose browser says one language while they read the other is not nagged.

Strings that live in `main.js` are read from the markup rather than hardcoded, so they
translate with the page: menu labels via `data-label-open`/`data-label-close`, the
copy-email announcement from the button's own second label. Paths in JS keep whatever
the markup used and swap only the `#icon-` fragment — hardcoding a relative sprite path
breaks it at a different tree depth.

`en/projects/nga.html` and `nikita.html` are English-only for now: unfinished and unlinked,
so they carry no language link and no `hreflang`.

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
- **The previous/next block is a `<nav>`**, labelled in the page's own language
  ("Case studies" / "Prosjekter"). It is navigation, and a bare div keeps it out of the
  landmark list.
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
