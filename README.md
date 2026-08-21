# AntArtifact

An online, interactive tool about **biosafety**, built as a shippable Claude Artifact
(portfolio piece for an Anthropic interview).

## What it is

A single self-contained web page — no build step, no server, no external dependencies —
published as an Artifact so it can be opened and shared by URL.

## Status

Scaffold only. The subject matter and interaction design are not yet decided.

Open questions to settle before building:
- **Audience** — working bench scientists, policy readers, or a general/technical-lay audience?
- **Core interaction** — what does the user actually *do*? (classify an agent by BSL, walk a
  risk-assessment decision tree, explore a containment-practice matrix, compare real incidents…)
- **Sources** — which authorities to cite (CDC/NIH *BMBL* 6th ed., WHO Laboratory Biosafety
  Manual 4th ed., NIH Guidelines for rDNA)?

## Layout

```
src/index.html   the artifact — the whole deliverable lives here
notes/           research, source excerpts, design decisions
```

## Publishing

The page is published with the Artifact tool pointed at `src/index.html`. Re-publishing the
same path updates the same URL.
