# AntArtifact findings — observed biases in phylogeographic inference

## The testing paradox: the region that looks hardest becomes the source

Region A does not have to be where mutation X arose. It only has to sequence more than
its neighbours. Whichever region contributes the most tips under a clade is the region
Fitch parsimony hands that clade's ancestor — so the region doing the most surveillance
is the region the tree points at.

This is not a fudge in the model; it falls straight out of the textbook method. Fitch
resolves a node's state bottom-up and leaves genuine ties, and the standard convention
breaks those ties by majority of descendant tips
(the `pick` tie-break inside `fitchRegions`, [src/index.html](src/index.html)). Tip counts are a
sampling artefact, not an evolutionary quantity. Sequencing effort walks in through the
tie-break and comes out the other side as ancestry.

The perverse incentive is the point worth stating on the page: the region that invests
in surveillance is the region that gets named as the origin, and the region that
sequences nothing is never implicated. Naïve readers expect the opposite — that testing
more is how you clear your name.

### This does not contradict the coverage finding below — the two act on different quantities

- **Region attribution** (Fitch) reads *tip counts*. More sequences → more tips → your
  region wins the tie-break → you are named ancestral.
- **Timing** (root-to-tip clock) reads *mutations per sequence*. Shallower coverage →
  fewer observed mutations per genome → your sequences look old → you are placed near
  the root.

They are separate channels into the same conclusion, and they can be driven by opposite
policies. Sampling *breadth* (how many genomes) moves the geography; sampling *depth*
(how much of each genome) moves the dates. A region can be handed the origin by either
route, which is why "just sample more" is not a fix.

---

## The method itself introduces error, even with perfect data

Even in omniscient mode the tree is still a *reconstruction*, not the truth. Enable "Sequence everything" and you get every infection with every mutation read perfectly — and the reconstructed tree still differs visibly from the truth panel beside it. Perfect data removes sampling bias; it does not remove the algorithm's own assumptions, and what is left over is the floor on how well any method can do here. It is the useful control precisely because it shows that floor is not zero.

### Timing estimates get pulled forward by the root date

The algorithm estimates when the most recent common ancestor existed by looking at how many mutations each sample carries. Samples with fewer mutations are assumed to be older. This works fine in general, but it assumes the outbreak's root was actually at day 0.

When a region's samples cluster late with few observed mutations, this date estimate pulls forward, making everything downstream appear later than it actually was. Tern, for instance, was first detected much earlier in reality than the reconstructed tree suggests.

### Regions cluster by accident, not ancestry

The algorithm tries to figure out which region each ancestor came from by looking at what regions the descendants are in. It picks the region that best explains the data with the fewest assumed migrations.

When two regions happen to have sequences that are genetically similar (by chance), the algorithm can misinterpret this as evidence that one region is ancestral to the other. In our observation, Aldane sequences unexpectedly clustered under Fenmoor in the reconstruction, even though they were actually independent introductions from other regions.

---

## Genome coverage creates an inverted sampling bias

You'd expect that sampling fewer sequences from a region would make that region invisible or hard to detect. The opposite happens.

### Low coverage makes a region look ancient

When you lower the genome coverage for a region (read fewer of its sequences), each sampled sequence carries fewer observed mutations—because most mutations were missed in the unsampled sequences.

The dating algorithm interprets "few mutations" as "old sequence." So under-sampled regions look *primitive*—their sequences appear to sit near the root of the tree.

The reconstruction then infers: "This region must be where the outbreak started, because that's the only way to explain why its samples are scattered and old-looking."

This is backwards from what you'd expect. It's not that under-sampling makes a region more visible; it's that under-sampling makes it look *ancestral*.

### The asymmetry

- Over-sample a region → see many mutations → looks recently diversified → appears derived
- Under-sample a region → see few mutations → looks old → appears ancestral

Both biases point the same direction in bias space: sampling depth warps the inferred phylogeography.

---

## How realistic is the coverage bias?

The artifact models coverage depth as **random dropout across the genome** — some mutations missed, others caught. This is realistic for:
- Historical partial-genome sequencing (early pandemic, Sanger-era work)
- Severely under-covered samples (low viral load, degraded material)
- Biased sequencing protocols (targeted regions, not truly whole-genome)

Modern whole-genome sequencing doesn't have this problem. You get the whole genome deterministically or not at all.

**However**, the bias is real where it applies: whenever you have incomplete genomes or uneven coverage, the inferred phylogeography *will* be warped by how much of the genome was captured from each region.

The real biases that survive modern sequencing are **geographic and temporal**:
- Which regions get sampled at all (and when)
- Whether you're catching early cases or late ones
- Whether you're sampling severe cases (hospitals) or mild ones (the community)

The coverage bias in this artifact is a useful historical demonstration—it shows how incomplete data creates false structure—but it's not the active problem in contemporary studies.

---

## Implications

1. **The method is not neutral.** Even perfect sampling and coverage don't eliminate inference artifacts—they just remove sampling bias, revealing the algorithm's own assumptions. Omniscient mode is the control that proves it: no policy can beat a tree that is still wrong with complete data.

2. **Coverage depth is phylogeographic information** (when coverage is actually uneven). How thoroughly you sequence a region affects where the algorithm thinks that region sits in evolutionary time.

3. **This bias reverses naïve intuition.** Readers expect under-sampling to hide a region, not to make it look like the source — and they expect testing more to clear a region, not to nominate it as the origin. Both intuitions are backwards, by different mechanisms.

4. **Geographic and temporal sampling are the surviving problem.** Modern WGS solves the coverage-dropout problem, but not the question of *which cases get sequenced* and *when*.

---

## Shape and geography are separate channels — and coverage buys only one of them

Observed at the screenshot config (seed 111, coverage at 100%, sequencing from day 13):
the reconstructed tree's *shape* is almost indistinguishable from the truth panel, while
the geography is badly wrong — Wild type placed in Doran on day 11 when it arose in Brix
on day 1. This is not a coincidence of that one setting. It is the sharpest thing the
model does, and it is guaranteed rather than lucky.

### At complete coverage the topology is exactly right, whatever the sampling policy

Measured by asking, for every mutation, whether the set of sampled tips carrying it in the
reconstruction is *identical* to the set that truly carries it:

| policy | genomes | clades recovered | root geography |
|---|---|---|---|
| uniform, day 0, 2%/day | 2,149 | **469/469 = 100%** | correct |
| default (lopsided) | 1,321 | **311/311 = 100%** | correct, 1 lineage wrong |
| late + lopsided | 1,451 | **338/338 = 100%** | correct, 3 lineages wrong |
| uniform, day 62, 0.15%/day | 155 | **100%** | **WRONG** |
| uniform, day 80, 0.2%/day | 67 | **100%** | **WRONG** |

Held across six seeds × three policies: **18 of 18 exact**, including seed 888's day-80
programme that collects **30 genomes total** and still reconstructs their genealogy
perfectly — while getting the root region wrong. Sampling *breadth and timing do not
degrade tree shape at all.*

The reason is structural, not empirical. Under infinite sites with no recombination, a
mutation *is* a clade: everyone carrying it descends from the one host it arose in. If
every mutation in a genome is observed, the nesting of mutation sets reconstructs the
genealogy of those tips exactly — which is what `perfectPhylogeny` computes, and what the
comment above the inference section already asserts. Complete coverage means the only
information the topology needs is present, so there is nothing left for sampling policy
to break.

### The caveat that keeps this honest

"The shape is exactly right" means *exactly right about the tips you actually collected*.
A day-62 programme returns a perfect tree of 155 genomes; a day-0 programme returns a
perfect tree of 2,149. Both are correct. They are correct about different epidemics — and
the late one is a smaller, later, geographically skewed subset. The tree is not lying; it
is answering truthfully about a sample that was chosen badly. That is a harder failure to
detect than a visibly mangled tree, which is precisely why it matters.

### Coverage degrades shape steeply, but it is a slope, not a cliff

Seed 111, uniform day 0 / 2%/day, coverage swept:

| coverage | 100% | 99% | 98% | 95% | 90% | 80% | 60% | 40% | 20% |
|---|---|---|---|---|---|---|---|---|---|
| clades recovered | **100%** | 94.5% | 90.6% | 80.4% | 69.9% | 52.1% | 26.0% | 11.2% | 2.4% |

So "deep coverage reconstructs the shape well" is fair: 99% coverage still recovers 94.5%
of true clades. Only *complete* coverage is exact.

### The asymmetry, which is the actual lesson

- **Sampling breadth and timing** damage geography and leave topology untouched.
- **Genome coverage** damages *both* — the coverage sweep above also takes the root
  region from correct at 100% to wrong at 90% and below.

Coverage is therefore **necessary but not sufficient**. Deep sequencing is the only lever
that buys tree shape, and it cannot buy geography; breadth and timing are the only levers
that buy geography, and they do nothing for shape.

The mechanism behind the asymmetry: topology is read from *within-genome* information —
how one sample's mutations nest inside another's. Geography is read from *between-sample*
information — which regions the tips are labelled with, and in what proportion. No amount
of depth on the genomes you hold can manufacture a genome you never collected. This is
why "we sequenced to full depth" is not an answer to attribution bias, and why a
programme can produce an immaculate phylogeny and still name the wrong country.
