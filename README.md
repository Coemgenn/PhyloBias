# PhyloBias — how sampling decisions write an outbreak's history

An interactive, single-page tool showing how early testing and sequencing decisions determine
what can ever be known about an epidemic's origin and phylogenetics. It ships as a Claude
Artifact titled **Meridian**; `phylobias` is the repo and package name.

## The idea

The phylogenetic tree of a pathogen that is built a posteriori is not a perfect description of its history. It is a shadow the epidemic casts through sampling, discovery, detection and policy choices made. Change the scheme and you change the history.

The tool simulates an outbreak of a fictional pathogen across a fictional landmass, then shows
its **true** history beside the history you would have **inferred** from the genomes your
sequencing policy actually collected. Reality never offers that comparison — you only ever get
the reconstruction. A simulation can.

Set each region's testing policy and watch the conclusions move. The verdict panel reads every
origin down one table — what you would conclude beside what actually happened — and scores the
run as *N of M origins recovered*. This is the opening state, unmodified: a populous hub that
sequences early and deeply, a periphery that barely sequences at all.

| Variant | Concluded region | Concluded day | True region | True day |
|---|---|---|---|---|
| Wild type | Brix | 17 | Brix | 1 |
| Alpha | **Corvane** | 52 | Aldane | 15 |
| Beta | Esker | 59 | Esker | 29 |
| Gamma | Corvane | 45 | Corvane | 30 |
| Delta | **Esker** | 46 | Doran | 26 |
| Epsilon | Brix | 40 | Brix | 15 |
| Zeta | **Corvane** | 45 | Fenmoor | 23 |

Four of seven origins recovered, from 1,321 genomes. Every misattribution lands on a region that
sequenced heavily — and every date runs late, because the earliest cases were never sampled.
(Measured against the shipped engine at the default scenario, seed 111; more cases in
[notes/presentation-cases.md](notes/presentation-cases.md).)

## The controls

**The virus** (act 01) — transmission rate, mutation rate, and a scenario seed that redeals the
outbreak so you can tell a pattern from a fluke.

**Testing policy** (act 02), set per region, four levers:

- **Sequencing begins** — the day this region starts testing. Everything before it is invisible.
- **Testing capacity** — share of the region swabbed daily; the size of the budget.
- **Test allocation** — how that budget splits between hospital intake and community screening.
- **Genome coverage** — share of positive tests that go on to be sequenced.

**Omniscient mode** is a control experiment, not a policy: every infection sequenced the moment
it happens. The reconstruction still misses, and what is left is the method's own floor.

The truth panel starts behind a curtain, so you can try reading the reconstruction before seeing
the answer key.

## What it demonstrates

1. **Early sequencing is irreplaceable.** Cases that come and go before sequencing begins leave
   no sample. That diversity is destroyed, not merely unmeasured. Low volume starting early
   beats high volume starting late.
2. **Variant origin attribution follows sequencing effort, not biology.** The region that
   sequences first and deepest becomes the region the variant is named after.
3. **The bias punishes the well-prepared.** Invest in genomic surveillance, get named as the
   source, get closed off. A live disincentive in global health.
4. **Depth changes topology, not just resolution.** Unobserved mutations collapse distinct
   lineages, so five introductions are inferred as one.
5. **The efficient channel is the biased one.** Under scarcity, shifting the same test budget
   from community screening to hospital intake buys **2.2× the genomes** and loses both a mild
   lineage and a severity-neutral origin — through two separate mechanisms, the ward missing
   mild cases and the ward census saturating unevenly between regions. Cheap surveillance and
   representative surveillance are not the same purchase.

The attribution error is **emergent, not hardcoded** — we implement textbook discrete
ancestral-state reconstruction and the bias appears on its own, because that is a real
documented sensitivity of the method. The page says so, and says that production methods
mitigate it without eliminating it.

## Fiction policy

**The world is invented; the mechanics are real.**

Invented: the pathogen, the landmass and its six regions (Aldane, Brix, Corvane, Doran, Esker,
Fenmoor), the six lineages (wild type plus Alpha through Zeta), and every number attributed to
them. The setting is fictional so that no reader can mistake the tool for a claim about a real
outbreak, variant, or country.

Real and cited visibly on the page: substitution-rate ranges, serial-interval and dispersion
parameters, the inference methods (neighbour-joining, root-to-tip regression, Fitch parsimony),
and the documented phenomenon of sampling-driven phylogeographic bias. Claims still awaiting a
checked source are tracked in [notes/UNVERIFIED.md](notes/UNVERIFIED.md) and must not ship as
stated numbers until they clear.

## Running it

The artifact itself has no build step and no runtime dependencies. It is written for the Artifact
runtime, though, which supplies the doctype and `<head>` at publish time — so opening
`src/index.html` straight off disk lands the browser in quirks mode. Build the hosting wrapper
and open that instead:

```
node tools/build-pages.mjs   # src/index.html -> docs/index.html, with a real <head>
open docs/index.html
```

`docs/` is the GitHub Pages mirror. Rebuild it whenever `src/index.html` changes, or the hosted
page drifts behind the artifact.

Tests are the only place a dependency appears (jsdom, dev-only):

```
npm install
npm test        # 53 tests: engine invariants + DOM rendering
```

## Layout

```
src/index.html        the artifact — the entire deliverable
docs/index.html       generated static-hosting mirror, do not edit by hand
tools/build-pages.mjs the generator that wraps the artifact in a real document
test/engine.test.js   simulation, sampling and inference invariants
test/dom.test.js      rendering, theming and accessibility, under jsdom
ARCHITECTURE.md       pipeline, modules, data model, inference chain
Overview.md           assignment requirements and deliverable checklist
CLAUDE.md             working constraints for AI-assisted development
notes/                source excerpts, measured demo cases, verification records
```
