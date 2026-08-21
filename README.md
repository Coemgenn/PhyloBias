# PhyloBias - how sampling decisions write an outbreak's history

An interactive, single-page tool showing how early testing and sequencing decisions determine
what can ever be known about an epidemic's origin and phylogenetics.

## The idea

The phylogenetic tree of a pathogen that is built a posteriori is not a perfect description of its history. It is a shadow the epidemic casts through sampling, discovery, detection and policy choices made. Change the scheme and you change the history.

The tool simulates an outbreak of a fictional pathogen across a fictional landmass, then shows
its **true** history beside the history you would have **inferred** from the genomes your
sequencing policy actually collected. Reality never offers that comparison — you only ever get
the reconstruction. A simulation can.

Set each region's sequencing policy — when it starts, how much, how deep — and watch the
conclusions move:

> You would have concluded Variant Kestrel arose in **Corvane** on **day 41**.
> It arose in **Aldane** on **day 11**.

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

The attribution error is **emergent, not hardcoded** — we implement textbook discrete
ancestral-state reconstruction and the bias appears on its own, because that is a real
documented sensitivity of the method. The page says so, and says that production methods
mitigate it without eliminating it.

## Fiction policy

**The world is invented; the mechanics are real.**

Invented: the pathogen (Meridian virus, MRV-1), the landmass and its six regions (Aldane, Brix,
Corvane, Doran, Esker, Fenmoor), the variant (Kestrel), and every number attributed to them.
The setting is fictional so that no reader can mistake the tool for a claim about a real
outbreak, variant, or country.

Real and cited visibly on the page: substitution-rate ranges, serial-interval and dispersion
parameters, the inference methods (neighbour-joining, root-to-tip regression, Fitch parsimony),
and the documented phenomenon of sampling-driven phylogeographic bias.

## Running it

No build step, no dependencies, no server required.

```
open src/index.html
```

The deployed version is published as a Claude Artifact — see the link in the submission.

## Layout

```
src/index.html    the artifact — the entire deliverable
ARCHITECTURE.md   pipeline, modules, data model, inference chain
Overview.md       assignment requirements and deliverable checklist
CLAUDE.md         working constraints for AI-assisted development
notes/            source excerpts and verification records
```
