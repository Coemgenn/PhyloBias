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
The world is fictitious; the mechanics are not.

**Invented, and labelled as such:** the pathogen (Meridian virus, MRV-1), the landmass and its
six regions (Aldane, Brix, Corvane, Doran, Esker, Fenmoor), the variant (Kestrel), and every
number attributed to them. Inventing the setting is deliberate — no reader may mistake the tool
for a claim about a real outbreak, variant, or country.

**Real, and cited visibly on the page:** substitution-rate ranges, serial-interval and
dispersion parameters, the inference methods (neighbour-joining, root-to-tip regression, Fitch
parsimony), and the documented phenomenon of sampling-driven phylogeographic bias. Candidate
authorities — all still UNVERIFIED, check before any derived number ships: TempEst/root-to-tip
methodology, Lemey et al. discrete phylogeography, Nextstrain/Augur, published RNA-virus clock
rates, WHO's 2021 move to Greek-letter variant naming.

Being subtly wrong is worse than being vague. Two hard rules follow:
- The attribution bias must **emerge from an honest implementation of standard method**, never
  be hardcoded. We implement textbook Fitch parsimony and let the artifact appear.
- The page must state that production phylogeographic methods mitigate this bias without
  eliminating it. We show a real failure mode, not a strawman.

Keep source excerpts in `notes/` as they are gathered. See `ARCHITECTURE.md` for the design and
`Overview.md` for the assignment requirements.
