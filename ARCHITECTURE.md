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
| `infer` | neighbour-joining, root-to-tip rooting + clock, Fitch parsimony ancestral demes |
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

DemePolicy { detectionRate, seqFraction, seqStartDay, depth, reportingDelay }

Sample { caseId, deme, tSampled, observed: Set<int> }   // observed ⊆ mutations, thinned by depth
```

Sampling is refused when no material exists: a case sampled after `tRemoved` leaves nothing.
That is the irreversibility, implemented rather than asserted.

## Inference chain

1. Hamming distance on observed mutation sets → distance matrix
2. Neighbour-joining → unrooted topology
3. Root-to-tip regression over candidate roots, maximising R² of divergence against sample date
   → root placement, clock-rate estimate, and x-intercept as tMRCA
4. Fitch parsimony over deme labels → ancestral deme at the root and at the Kestrel clade's MRCA
5. Deme-state changes along the tree → inferred introduction count

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

## Open

- Region polygon geometry for the fictional landmass (hand-authored SVG paths)
- Whether inference uncertainty is shown as an interval or a point estimate
- Verification pass on every cited parameter before it appears on the page
