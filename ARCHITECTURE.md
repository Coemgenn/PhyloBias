# Architecture

## Thesis

The phylogenetic tree is not the epidemic. It is a shadow the epidemic casts through your
sampling scheme. Change the scheme and you change the history.

The tool shows a simulated outbreak's **true** history beside the history you would have
**inferred** from the genomes your sequencing policy actually collected. Reality never offers
this comparison — you only ever get the reconstruction. A simulation can.

## What it demonstrates

1. **Early sequencing is irreplaceable.** Cases that come and go before sequencing begins leave
   no sample. That diversity is destroyed, not merely unmeasured, and no later investment
   recovers it. Low volume starting early beats high volume starting late.
2. **Variant origin attribution follows sequencing effort, not biology.** Variant Kestrel arises
   in Aldane. Aldane sequences shallowly and late; Corvane sequences early and deep. Kestrel is
   first *observed* in Corvane, phylogeographic inference roots it in Corvane, and the world
   calls it "the Corvane variant."
3. **The bias is systematically unfair to the well-prepared.** The region that invested in
   surveillance is the region that gets named and closed off. Good genomic surveillance is
   punished — a live disincentive in real global health.
4. **Depth changes topology, not just resolution.** Unobserved mutations collapse distinct
   lineages into polytomies, so five introductions are inferred as one.

## Credibility rule: emergent, not hardcoded

The attribution error in (2) must **emerge from an honest implementation of standard method**,
never be injected. We run textbook discrete ancestral-state reconstruction (Fitch parsimony) on
sampled tip locations. A tip set that is 90% Corvane roots at Corvane on its own, because that
is a real and documented sensitivity of discrete phylogeography.

The page must also state the honest caveat: production methods (Bayesian discrete
phylogeography with structured-coalescent corrections) *mitigate* this bias but do not eliminate
it. We are showing a real failure mode, not a strawman.

## Fiction policy

**The world is invented; the mechanics are real.**

Fictitious: the pathogen (Meridian virus, MRV-1), the landmass and its six regions (Aldane,
Brix, Corvane, Doran, Esker, Fenmoor), the variant (Kestrel), every scenario and number
attributed to them.

Real and cited: substitution-rate ranges, serial-interval and dispersion parameters, the
inference methods (neighbour-joining, root-to-tip regression, Fitch parsimony), and the
documented phenomenon of sampling-driven phylogeographic bias.

We invent the setting so that no reader can mistake the tool for a claim about a real outbreak,
a real variant, or a real country. We do **not** invent the physics.

## Pipeline

The thesis and the performance strategy are the same fact: **truth does not depend on sampling
policy.**

```
  SCENARIO controls              POLICY controls (per region)
  R0 · clock rate · seed         start day · volume · depth · detection · delay
         │                                    │
         ▼                                    ▼
   ┌────────────┐          ┌────────────┐          ┌────────────┐
   │   TRUTH    │  ──────► │   SAMPLE   │  ──────► │   INFER    │
   │ transmission          │ who leaves │          │ tree ·     │
   │ tree · genomes        │ a genome,  │          │ tMRCA ·    │
   │ · geography           │ and how    │          │ origin     │
   │ · variant origin      │ complete   │          │ · verdict  │
   └────────────┘          └────────────┘          └────────────┘
    runs ONCE per seed      re-runs on every slider drag (cheap)
```

Policy controls cannot touch the truth panel. That is enforced structurally, and it is the
point: your decisions never change what happened, only what you can know about it.

## Modules

All inlined in `src/index.html`, clearly sectioned. No build step.

| Module | Responsibility |
|---|---|
| `rng` | seeded PRNG (mulberry32) — determinism is load-bearing |
| `sim` | branching process over demes; infinite-sites mutation along the transmission tree; variant emergence |
| `sampler` | applies per-region policy to truth → observed genome set with missing sites |
| `infer` | perfect phylogeny, root-to-tip rooting + clock, ML ancestral demes under an Mk model |
| `metrics` | truth-vs-inference comparison → verdict |
| `state` | single store, one-way flow, `render()` on change |
| `viewMap` | fictional landmass; **input and output** — click a region to set its policy |
| `viewTree` | inferred tree; time axis with the permanently-dark zone |
| `viewControls` | scenario group visually separated from policy group |
| `viewVerdict` | the scoring sentence — the thesis in one line |
| `sources` | citation registry so every real number carries a visible footnote |

### Why a seeded RNG is non-negotiable
Without determinism, moving one slider also changes the outbreak, every comparison becomes
noise, and the tool is unfalsifiable. Same seed → same truth, always.

### The map is a control
A single global sequencing slider cannot produce demonstration (2) — the mechanism *is*
heterogeneity between regions. Clicking a region and funding its sequencing, then watching the
inferred origin migrate toward it, is the core interaction.

### Calibration findings

Four things only showed up once the engine ran, and each changed the design:

- **A single index case is not viable.** With R0 2.4 and dispersion 0.5 the branching process
  has extinction probability ~0.57, so most seeds died before anything happened. The outbreak is
  now seeded by `N_INDEX = 8` introductions, which drops the fizzle rate to ~2% and makes the
  root a polytomy — which is what an early outbreak's phylogeny actually looks like.
- **Founding a variant on one arbitrary host almost always fails**, for the same reason. Variants
  are founded on a host that transmits, and attempts that die out are reverted so the lineage can
  arise again later. Failed markers stay in the record as ordinary mutations that went extinct.
- **Emergence must be keyed to regional seeding, not calendar days.** Regions are seeded at
  seed-dependent times; a fixed day meant variants arose into already-depleted regions.
- **Tern is neutral in *severity*, not in transmissibility** (×1.3). Fully neutral, it stayed
  around 500 cases — too few to sample or to infer an origin for. Its job is isolating geographic
  bias from the severity channel, which only requires severity parity with wild type.

### The permanently-dark zone
Everything left of a region's sequencing start day is hatched on the tree's time axis: diversity
no future spending can reach. Sliding the start date right and watching the dark zone swallow
the true origin carries demonstration (1) better than any statistic.

## Data model

```js
Case {
  id, parent, deme, tInf, tRemoved,
  mutations: Set<int>,   // infinite sites
  variant: 0 | 1
}

DemePolicy { startDay, capacity, hospitalMix, depth }   // capacity = % of population swabbed/day

Sample { caseId, deme, tSampled, observed: Set<int> }   // observed ⊆ mutations, thinned by depth
```

Sampling is refused when no material exists: a case sampled after `tRemoved` leaves nothing.
That is the irreversibility, implemented rather than asserted.

## Inference chain

1. Perfect phylogeny over observed mutation sets → topology
2. Root-to-tip regression of observed mutation count against sample date → clock rate and tMRCA
3. **Maximum-likelihood ancestral state reconstruction** under an Mk model: Felsenstein pruning
   down-pass, marginal-posterior up-pass, migration rate fitted over a grid rather than assumed
4. Deme-state changes along the tree → inferred introduction count

Fitch parsimony was tried first and **replaced**. It admitted 132 migrations where 3,127 had
happened, then collapsed each node onto whichever region held the most tips — wrong even at
complete data, which would have made every slider-induced error unattributable to sampling.

## Verdict

> You would have concluded Variant Kestrel arose in **Corvane** on **day 41**.
> It arose in **Aldane** on **day 11**.

## Scale and performance

~5,000 truth cases, ≤300 sampled genomes. Neighbour-joining at n=300 is ~10⁷ operations — tens
of milliseconds. Fitch is linear. Root-to-tip is trivial. Truth is computed once per seed, so
slider drags only re-run sampling and inference.

## Testing

No build step, so tests read `src/index.html`, extract the `<script>` block, evaluate it, and
assert against the engine. Key invariants: determinism under a fixed seed, monotonicity of
recoverable history in sequencing start day, and that the attribution flip reproduces.

Node 24 LTS is installed under `~/.local` (no Homebrew, no sudo). Run `node --test test/*.test.js`.
Fifty invariants pass, covering determinism, bounded final size, lineage emergence and origin,
the severity ordering, perfect-phylogeny validity of the mutation record, clock scaling, the
sampling economics (capacity monotonicity, hospital saturation, community severity-neutrality),
and the omniscient control recovering every root.

## Open

- Region polygon geometry for the fictional landmass (hand-authored SVG paths)
- Whether inference uncertainty is shown as an interval or a point estimate
- Verification pass on every cited parameter before it appears on the page

## Sampling economics

`capacity` buys **tests**, not cases. The two channels convert tests into genomes at very
different rates, and which one is the better buy changes over the outbreak.

| | hit rate | reach | scaling |
|---|---|---|---|
| **Community** | the prevalence of the population screened — most swabs return nothing | every severity tier, in true proportion | unbounded |
| **Hospital** | high; admissions are pre-enriched by being ill | severe and critical only (~16% of cases) | **saturates** at the ward census |

Measured at seed 111: at 0.25%/day capacity the hospital arm yields 604 genomes against
community's 252; at 5%/day it yields 1,344 against 3,789, having stopped improving after 2%.
The sampled severity mix at 100% community is 18/35/27/14/6 against a true 19/37/29/11/5; at
100% hospital it is 0/0/0/70/30.

So the dilemma is **more genomes or less biased genomes**, and the rational early choice —
hospital, while prevalence is too low for screening to pay — is the one that hides a mild
lineage. The trap is structural, not asserted.

**Honest caveat, stated on the page.** This world holds under 10,000 people and infects most of
them, so prevalence peaks far above any real outbreak. Random screening is therefore *more*
efficient here than in reality, which means the page **understates** the pull toward hospital
sampling rather than exaggerating it.

## The omniscient control

A button that bypasses the sampler entirely: every infection sequenced the moment it happens,
including those nobody ever knew about. It is labelled on the page as impossible, because it is —
no programme reaches the asymptomatic case that never presented.

Its job is to separate *the method is broken* from *your sampling broke it*. Without it, a
skeptical reader cannot tell those apart, and every claim on the page is unfalsifiable.

| | genomes/seed | origins misplaced | root recovered |
|---|---|---|---|
| default (lopsided) | 1,182 | 5 / 22 | 5 of 8 |
| every slider maxed | 3,714 | 4 / 22 | 8 of 8 |
| **omniscient** | 8,812 | **2 / 22** | **8 of 8** |

Two of the four failures at maxed sliders are the same two that survive omniscience — the
method's own floor. The other two are clades of 9 and 19 tips: genuinely too small to place.

## Why `support` is not shown

The reconstruction reports a marginal posterior for each node's region. At the root it is
essentially always 1.000 — and it is 1.000 on **six of the eight roots it gets wrong** under the
default policy. The one root scoring below 1.0 anywhere is a *correct* one.

The number is a product over every tip below the node, so a 12% edge in log-likelihood totals
(187.3 against 164.5 on seed 111) becomes odds of 8×10⁹. It answers "if every tip were an
independent witness, how sure would I be?" — and the tips that decide a root are identical
zero-mutation genomes, largely one clonal expansion, which are not independent witnesses at all.

The page shows the evidence instead: how many genomes carry no informative mutations, and how
they split by region. A test asserts the view layer never references `support`.
