# AntArtifact — working notes for Claude

## What this is
A single-page interactive tool about biosafety, shipped as a Claude Artifact. It is an
interview portfolio piece, so polish counts: this should look and feel finished, not like a demo.

## Hard constraints (Artifact runtime)
- `src/index.html` is the deliverable. It gets wrapped in `<!doctype html><head>…</head><body>`
  at publish time — write page content only, no `<html>`/`<head>`/`<body>`/`<!DOCTYPE>` tags of
  your own. A `<title>` tag at the top is read for the artifact name.
- **Self-contained.** A strict CSP blocks external hosts. Inline all CSS and JS, embed assets as
  `data:` URIs. The only exception is Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`).
  No CDN scripts, no fetch/XHR, no remote images.
- **Theme-aware.** Define the full light palette as tokens on bare `:root`; override under
  `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])`; override
  again under `:root[data-theme="dark"]`. `body` needs an explicit token background.
- **Responsive.** Relative units; wide content scrolls inside its own `overflow-x: auto` box.
  The page body must never scroll horizontally.
- Load the `artifact-design` skill before any design pass, and `artifact-diagramming` before
  drawing SVG diagrams.

## Content standard
Biosafety is a domain where being subtly wrong is worse than being vague. Every factual claim
(BSL assignments, containment requirements, agent risk groups) must trace to a named source —
BMBL 6th ed., WHO LBM 4th ed., or the NIH Guidelines — and cite it visibly in the page.
Keep source excerpts in `notes/` as they're gathered.
