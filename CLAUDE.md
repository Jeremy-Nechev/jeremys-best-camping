# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A fully static site (plain HTML/CSS/JS, no framework, no build step, no package manager) for
"Jeremy's Best Camping," deployed directly to GitHub Pages. There is no `package.json`, no
bundler, no linter, and no test suite.



## Architecture

**No templating — markup is duplicated per page.** There are no includes/partials; the full
`<header>` (wordmark, mobile toggle, nav with its two dropdown submenus), the hero SVG contour
background, and the `<footer>` are copy-pasted into every `index.html`, with only the relative
link prefixes (`../`, `../../`) adjusted per depth. **Any change to nav links, footer links, or
the header/footer markup itself must be repeated by hand across every page** — there is no single
source of truth to edit once. When adding a new destination page, add it to the nav dropdown and
footer nav in every existing `index.html`, not just the new page.

**One shared stylesheet, token-driven.** `assets/css/style.css` is the only CSS file for the
whole site. Design tokens (colors, fonts, spacing scale) live as custom properties in `:root` at
the top of the file — change a token there rather than hardcoding values in markup. Recurring
structural classes used across pages:
- `.wrap` — max-width content container
- `.band` / `.band-mist` — alternating full-width section backgrounds
- `.hero` / `.hero-inner` — page-top hero with the SVG contour-line background
- `.card` / `.card-body` / `.card-go` — clickable link cards, usually inside `.grid.grid-3`
- `.datastrip` / `.data-cell` — small stat rows (elevation, season, booking window) inside cards
- `.eyebrow`, `.kicker`, `.lede`, `.mono` — typography helpers (mono is used for stat-like text)

**One shared script, `assets/js/nav.js`**, loaded on every page: drives the mobile menu toggle and
the desktop hover / mobile click behavior for the two nav dropdowns (`.has-menu`), including
closing on outside click, `Escape`, and focus-out. Page-specific interactivity (see below) is
written as an inline `<script>` at the bottom of that page instead of being added here.

**Page-specific inline scripts.**
- `camping-checklist/index.html` has its own inline script implementing a packing checklist that
  persists checked state to `localStorage` under the key `jbc-checklist`, keyed by each
  checkbox's `data-key` attribute, and drives a progress meter/count.
**Content placeholders.** Unfinished copy and images are marked with a `.placeholder` class
(rendered with a blue border) and `.card-media` blocks with an "Add photo" note — these are
intended to be replaced with real `<p>` copy and `<img>` tags respectively, not removed outright.

**`README.md` is gitignored** (see `.gitignore`) — it's setup/handoff instructions for the human
site owner (how to publish to Pages, add a domain, wire up Formspree) and is intentionally not
tracked or deployed with the site.

Don't use em dashes in writing