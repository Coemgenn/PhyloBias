# Overview — Take-Home Assignment

Working brief for the Anthropic take-home. This file is the single source of truth for
*what has to be delivered*; `CLAUDE.md` covers *how the artifact must be built*; `README.md`
describes the repo itself.

---

## Objective

Build a **functional prototype that demonstrates the ability to ship an impressive,
self-contained experience**, on one of the offered themes.

> ⚠️ **Still missing from the brief as received.** The assignment says "Choose one of the
> following themes:" but the theme list was not included in the text pasted into this repo.
> The concept below is decided; what remains is confirming **which offered theme it is filed
> under**, since the design rationale has to open by naming the theme.

---

## Concept — DECIDED

**An interactive tool showing how early-stage testing, detection, and sequencing decisions
shape what can ever be known about an epidemic's origin and phylogenetic history.**

A simulated outbreak of a fictitious pathogen runs on a fictitious landmass. The user sets
per-region sequencing policy — when sequencing starts, how many cases, how deep. The tool shows
the **true** history beside the history that policy would have let you **infer**, and scores the
gap.

Full design in [ARCHITECTURE.md](ARCHITECTURE.md). In brief, it demonstrates:

1. **Early sequencing is irreplaceable** — cases that resolve before sequencing begins leave no
   sample; that diversity is destroyed, not merely unmeasured.
2. **Variant origin attribution follows sequencing effort, not biology** — the variant is
   credited to whichever region sequenced it first, which is whichever region sequenced most.
3. **The bias punishes the well-prepared** — the region that invested in surveillance is the one
   that gets named and closed off.
4. **Depth changes topology** — unobserved mutations collapse lineages, so many introductions
   are inferred as one.

The world is invented so nothing can be misread as a claim about a real outbreak, variant, or
country. The mechanics are not invented: real methods, real parameter ranges, cited.

### Why it fits the brief

- **Self-contained by construction.** The simulation manufactures its own data, so the critical
  requirement — no reviewer-supplied data, no domain expertise — is satisfied structurally
  rather than by bolting on a demo mode. Criteria #2 and #3 fall out for free.
- **One interaction pattern**, as permitted: set regional sequencing policy, watch inferred
  history move.
- The payoff lands in seconds without instructions.

### Principal risk

Numerical and methodological honesty. A simulation emits confident-looking numbers by default,
and the inference chain is where being subtly wrong is easiest. Mitigations: the attribution
bias must be **emergent from honest textbook method, never hardcoded**; every real parameter
carries a visible citation; the page states plainly that production phylogeographic methods
mitigate this bias without eliminating it.

---

## Critical requirement: self-contained evaluation

The prototype **must be evaluatable without requiring specific data, documents, or domain
expertise from the reviewer.**

If the concept needs domain-specific inputs, either:
- **bundle compelling examples**, or
- provide a **"demo mode"** that showcases the tool without the reviewer sourcing their own data.

Practical reading of this for our case: an Anthropic reviewer with no biosafety background
should be able to open the URL and get something meaningful within seconds, with zero setup,
zero uploads, and zero prior knowledge. Everything the tool operates on ships inside the page.

---

## Deliverable 1 — A functioning prototype (deployed)

- The Anthropic team must be able to **use and interact with it immediately**.
  - A browser- or API-based experience is likely simplest; a local experience must come with
    an appropriate way to run the project.
- It is fine to **focus on a single feature or interaction pattern**.
- **Polish is less important than demonstrating the core idea effectively.**
  - (Note: `CLAUDE.md` sets a *higher* internal bar than the brief requires — treat polish as
    a tiebreaker, never as a reason to ship a thinner core idea.)
- **Must include sample data or demo mode** if the tool requires specific inputs.

**Our shape:** one self-contained HTML page (`src/index.html`) published as a Claude Artifact,
reachable by URL. No build step, no server, no external requests.

## Deliverable 2 — The code

- Submitted via **GitHub repo link**.
- **Code quality matters but is not the primary evaluation criterion.**
- Any languages/technologies are acceptable.

## Deliverable 3 — Design rationale

Required in **both** formats:

- **Self-recorded video, ~5 minutes**
- **Short written doc**

Both must cover:
1. Why this theme and this specific approach
2. What makes the idea **interesting or non-obvious**
3. Key **design decisions and tradeoffs**
4. How it would be **extended with more time**
5. **Approximately how long** was spent

---

## Use of AI during development

- Using Claude Code / Claude.ai / other AI tools is **expected**. Competitor models are permitted.
- **AI transcripts must be submitted** alongside the code.
- What is being evaluated: **judgment** — how the AI is directed, how its outputs are evaluated,
  how tradeoffs are made, and whether an independent vision is maintained.
- Explicit warning: **"A fully AI-generated project with no judgment will not pass."**

Implication for how this repo is run: keep a visible trail of decisions that were *ours* —
rejected directions, corrections to model output, and content the model got wrong and we fixed.
The `notes/` directory is the natural home for that trail.

---

## Submission (via email)

- [ ] GitHub repo link
- [ ] Link to the working prototype (hosted anywhere)
- [ ] Claude/AI transcripts (Claude Code transcripts tool, or claude.ai "Share")
- [ ] Explanation artifacts — **video + short written doc**

---

## Evaluation criteria, restated as a checklist

| # | Criterion | Source | Status |
|---|-----------|--------|--------|
| 1 | Reviewer can interact immediately, no setup | Deliverable 1 | ☐ |
| 2 | No reviewer-supplied data or domain expertise needed | Critical requirement | ☐ |
| 3 | Sample data / demo mode bundled | Critical requirement | ☐ |
| 4 | Core idea demonstrated clearly (one feature is enough) | Deliverable 1 | ☐ |
| 5 | Deployed and reachable by link | Deliverable 1 | ☐ |
| 6 | Public GitHub repo | Deliverable 2 | ☐ |
| 7 | Written design rationale covering all five points | Deliverable 3 | ☐ |
| 8 | ~5 min video covering the same | Deliverable 3 | ☐ |
| 9 | AI transcripts exported | Use of AI | ☐ |
| 10 | Evidence of independent judgment, not pure AI output | Use of AI | ☐ |

## Project-specific constraints layered on top

From `CLAUDE.md` — these are self-imposed, not from the brief, but they bound the build:

- Single file `src/index.html`, no `<html>`/`<head>`/`<body>` wrapper tags, strict CSP,
  everything inlined or `data:`-encoded.
- Theme-aware (light/dark tokens) and responsive; body never scrolls horizontally.
- **Content standard:** the world is fictitious, the mechanics are not. Scenario, pathogen,
  regions and variant are invented; substitution rates, epidemiological parameters and
  inference methods trace to named sources and cite visibly on the page. Excerpts in `notes/`.

---

## Open decisions

**Resolved:** concept and demonstrations (see *Concept*); fictitious world; stochastic branching
process; core interaction is per-region sequencing policy driving inferred history; verdict
panel scores the attribution gap.

Blocking:
- **Which offered theme this files under.** Needs the theme list pasted in.

Open:
- **Region geometry** — hand-authored SVG polygons for the fictional landmass.
- **Uncertainty display** — point estimate or interval on inferred origin date.
- **Parameter provenance** — every real number needs a citation or an "illustrative" flag,
  verified before it appears on the page. Collect in `notes/`.
- **Hosting** — Claude Artifact URL alone, or a GitHub Pages mirror as a stable backup link.
- **Time budget** — the rationale doc must state hours spent; track from now.
