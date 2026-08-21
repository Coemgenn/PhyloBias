# AntArtifact findings — observed biases in phylogeographic inference

## The method itself introduces error, even with perfect data

When you enable "Sequence everything" (omniscient mode), you get every infection and can read every mutation perfectly. Yet the reconstructed tree still differs visibly from the truth. This shows the reconstruction algorithm makes its own assumptions that create artifacts, separate from sampling bias.

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

1. **The method is not neutral.** Even perfect sampling and coverage don't eliminate inference artifacts—they just remove sampling bias, revealing the algorithm's own assumptions.

2. **Coverage depth is phylogeographic information** (when coverage is actually uneven). How thoroughly you sequence a region affects where the algorithm thinks that region sits in evolutionary time.

3. **This bias reverses naïve intuition.** Readers might expect under-sampling to hide a region, not to make it look like the source.

4. **Geographic and temporal sampling are the surviving problem.** Modern WGS solves the coverage-dropout problem, but not the question of *which cases get sequenced* and *when*.
