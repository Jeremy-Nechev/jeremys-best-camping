# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Jekyll site for "Jeremy's Best Camping," deployed directly to GitHub Pages (Pages builds Jekyll
sites automatically, no CI config needed). There is no `package.json`, no JS bundler, no linter,
and no test suite. There **is** a `Gemfile` (the `github-pages` gem, for running the exact same
Jekyll version locally via `bundle exec jekyll serve` that GitHub Pages builds with remotely) but
Ruby isn't required to deploy: pushing to GitHub is enough, Pages builds it server-side.

This site was converted from a hand-duplicated static HTML site to Jekyll specifically so a single
page's content is small and easy to edit, and shared chrome (nav, footer, hero shell, map
boilerplate) lives in one place instead of being copy-pasted into every page.

## Architecture

**Every page is `layout: default` plus front matter plus body content.** A page like
`big-sur/index.html` is now just:

```yaml
---
layout: default
title: "Big Sur"
description: "Redwood canyons on one side of the highway, cliffs and cold surf on the other."
eyebrow: "Central Coast"
hero_title: "Big Sur"
lede: "Redwood canyons on one side of the highway, cliffs and cold surf on the other."
section: destinations
map_markers:
  - name: "Pfeiffer Big Sur State Park"
    href: "#camp-pfeiffer-big-sur-state-park"
    lat: 36.2472
    lng: -121.7789
---
<section class="band">
  ... the page's actual unique content (cards, ground listings, hikes, prose) ...
</section>
```

To edit a page's title, meta description, hero eyebrow/heading/intro line, or nav highlight,
edit the front matter at the top. To edit the actual content, edit the plain HTML below the
`---` exactly like before, there's no markdown conversion and no build step required to preview
changes other than a normal Jekyll build.

Front matter fields, by convention:
- `title` — page `<title>` suffix (before " · Jeremy's Best Camping")
- `description` — `<meta name="description">`
- `eyebrow`, `hero_title`, `lede` — the three lines in the page's hero (`hero_title` may contain
  raw HTML, e.g. the homepage's `"Campgrounds worth<br>going to."`)
- `section` — `destinations` or `plan`, controls which header/footer nav dropdown gets the
  `is-active` highlight (see `_includes/header.html`); omit on pages that shouldn't highlight
  either one (currently just the homepage)
- `hero_actions` — optional list of `{label, url, quiet}`, renders extra buttons in the hero
  (currently only the homepage uses this)
- `map_id`, `map_markers` — optional; see "Campground maps" below

**`_layouts/default.html`** is the only layout: full `<head>`, `{% include header.html %}`,
`<main>` wrapping `{% include hero.html %}` then `{{ content }}`, `{% include footer.html %}`,
and the shared scripts. Conditionally pulls in the Leaflet CSS/JS only when `page.map_markers`
is set.

**`_includes/`** holds everything that used to be copy-pasted per page:
- `header.html` / `footer.html` — the site chrome. Both loop over `site.data.nav` (see below)
  for the actual links, so a nav link only needs to be added or renamed in one place.
- `hero.html` — the hero section (SVG contour background + eyebrow/heading/lede/actions), driven
  entirely by the front matter fields above.
- `leaflet-map.html` — the Leaflet init script (tile layer, markers, popups, click-to-enable
  scroll zoom) parameterized by `page.map_id` (defaults to `campground-map`; the homepage's
  site-wide map sets `map_id: site-map`) and `page.map_markers`.

**`_data/nav.yml`** is the single source of truth for the header dropdowns and footer nav
columns (`destinations` and `plan` lists, each entry a `{title, url}`, with an optional
`footer_title` override for the shorter footer labels like "Checklist" vs. "Camping checklist").
Add a new destination or plan-a-trip page here and it appears in the header and footer on every
page automatically, no per-page edits needed.

**Campground maps.** Any page with a Leaflet map declares its pins as `map_markers` front matter
(each a `{name, href, lat, lng}`), and drops the `<div id="campground-map" class="site-map
site-map-region" ...></div>` (or, on the homepage only, `id="site-map"` without
`site-map-region`) wherever the map should sit in the page's content. `_includes/leaflet-map.html`
does the rest. `href` is either a same-page anchor (`#camp-slug`, most pages) or a site-root path
(the homepage's map links out to other pages).

**Weather widget.** `_layouts/default.html` renders a live current-conditions widget right under
the hero on any page that resolves a lat/lng: either explicit `weather_lat`/`weather_lng` front
matter, or (the common case) the first entry in `map_markers`, so most destination pages get it
for free with no per-page edits. `_includes/weather-widget.html` renders the loading-state
placeholder server-side; `assets/js/weather.js` fetches the free, keyless National Weather
Service API (`api.weather.gov`, US-only, which fits since every destination is in California) and
swaps in the temperature/forecast, or a fallback link to weather.gov on failure. Pages with
neither `map_markers` nor an explicit `weather_lat`/`weather_lng` simply don't render the widget
or load the script. This covers live conditions; it does not cover fire-road or campground
closures; those are known ahead of time and belong as a manually-written note in the page's "Know
before you go" prose instead of an automated feed.

**Internal links use `{{ site.baseurl }}`.** Every internal `href` in page content and in
`map_markers` is written as a site-root-relative path (e.g. `{{ site.baseurl }}/national-parks/
yosemite/`) rather than the old `../`-counted relative paths, so pages can be moved without
re-deriving depth-relative links. `site.baseurl` is empty in `_config.yml` by default (correct
for a custom domain or a `username.github.io` user-page deploy); if this ever deploys as a
GitHub Pages *project* page (`username.github.io/reponame/`), set `baseurl: "/reponame"` there.
External links (recreation.gov, campsitephotos.com, etc.) are untouched absolute URLs.

**One shared stylesheet, token-driven, unchanged by the Jekyll conversion.**
`assets/css/style.css` is still the only CSS file for the whole site. Design tokens (colors,
fonts, spacing scale) live as custom properties in `:root` at the top of the file, change a
token there rather than hardcoding values in markup. Recurring structural classes used across
pages:
- `.wrap` — max-width content container
- `.band` / `.band-mist` — alternating full-width section backgrounds
- `.hero` / `.hero-inner` — page-top hero with the SVG contour-line background
- `.card` / `.card-body` / `.card-go` — clickable link cards, usually inside `.grid.grid-3`
- `.datastrip` / `.data-cell` — small stat rows (elevation, season, booking window) inside cards
- `.eyebrow`, `.kicker`, `.lede`, `.mono` — typography helpers (mono is used for stat-like text)

**One shared script, `assets/js/nav.js`**, loaded on every page via the layout: drives the mobile
menu toggle and the desktop hover / mobile click behavior for the two nav dropdowns (`.has-menu`),
including closing on outside click, `Escape`, and focus-out.

**Page-specific inline scripts** still live in that page's own content instead of being added to
`nav.js` or a shared include:
- `camping-checklist/index.html` has its own inline script (kept verbatim in the page body, after
  the front matter) implementing a packing checklist that persists checked state to
  `localStorage` under the key `jbc-checklist`, keyed by each checkbox's `data-key` attribute,
  and drives a progress meter/count.

**Adding a new destination page:** create `slug/index.html` with front matter (`layout: default`,
`title`, `description`, `eyebrow`, `hero_title`, `lede`, `section: destinations`, and
`map_markers` if it has campgrounds), write its content, then add one entry to
`_data/nav.yml`'s `destinations` list. That's the only shared file that needs touching.

**Content placeholders.** Unfinished copy and images would be marked with a `.placeholder` class
(rendered with a blue border) and `.card-media` blocks with an "Add photo" note, meant to be
replaced with real `<p>` copy and `<img>` tags respectively, not removed outright. None of the
current pages use these (all copy is filled in), but the CSS classes still exist in
`assets/css/style.css` if new placeholder content is added later.

**`README.md` is gitignored** (see `.gitignore`) — it's setup/handoff instructions for the human
site owner (how to publish to Pages, add a domain, edit a page) and is intentionally not tracked
or deployed with the site.

Don't use em dashes in writing
