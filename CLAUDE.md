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
- **Dark-committed, single theme.** The theme-aware rule was retired on 21 Aug 2026. Define the
  complete palette once on bare `:root` with `color-scheme: dark`; no `prefers-color-scheme`
  block, no `[data-theme]` block. Paint every colour explicitly — `body` included — so the page
  holds whatever ground the host paints behind it. The reason is chromatic: a hue that must clear
  contrast on `#ffffff` *and* read on near-black is trapped in a narrow middle band, and that tax
  fell hardest on the six region hues the argument is encoded in.
- **Chroma is data.** Colour means region, and nothing else. There is no accent hue; interaction
  is near-white (`--accent` is an ink, not a colour). Chrome is achromatic throughout.
- **Type.** Chakra Petch for display and headings *only* — letting it into figures or labels tips
  it from instrument into costume. Red Hat Mono carries every label and every number; Red Hat Text
  carries prose, including the verdict sentence. No display serif.
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
