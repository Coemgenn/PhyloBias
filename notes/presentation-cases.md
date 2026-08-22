# Presentation cases — reproducible settings for the four levers

Every case below was measured against the shipped engine (the `<script>` block of
`src/index.html`, evaluated headless through the same call order as `inferNow()`).
Numbers are exact, not illustrative. Scenario defaults `r0 = 2.4`, `clockRate = 9`
unless stated.

**Reading the tables.** "root" is the inferred region of the whole outbreak's common
ancestor. The true root is always **Brix** (wild type). A lineage verdict is written
`region/genomes`, where `·` means correctly attributed and `LOST` means the marker
mutation was never observed, so no call can be made at all.

**Choosing a baseline.** Seeds **111**, **150** and **888** reconstruct every lineage
correctly under a good uniform policy (day 0, 2%/day, 30% hospital, 95% coverage).
That matters for a demo: starting from all-correct means any error you then induce is
provably the slider's doing, and not a seed that was broken to begin with. Seed 111 is
the only one carrying all six lineages, so it is the house seed. Seeds 42, 203, 314,
500 and 777 already fail at a good policy — avoid them on stage.

---

## Lever 1 — Sequencing start day. The strongest case; lead with it.

### 1A. The early detector becomes the origin (robust across seeds)

Set every region to **day 45, 0.6%/day, 60% hospital, 80% coverage**. Then give **one**
region a real programme: **day 0, 3%/day, 30% hospital, 95% coverage**. Nothing else moves.

| seed | true root | Aldane early | Fenmoor early | Brix early | Corvane early | Doran early | Esker early |
|---|---|---|---|---|---|---|---|
| 111 | Brix | Brix | **Fenmoor** | Brix | **Corvane** | **Doran** | Brix |
| 7   | Brix | **Aldane** | **Fenmoor** | Brix | **Corvane** | **Corvane** | **Corvane** |
| 42  | Brix | **Corvane** | **Corvane** | Brix | **Corvane** | **Corvane** | **Corvane** |
| 150 | Brix | Brix | **Fenmoor** | Brix | **Corvane** | **Doran** | **Esker** |
| 203 | Brix | **Corvane** | **Fenmoor** | Brix | **Corvane** | **Corvane** | **Esker** |
| 314 | Brix | **Corvane** | **Fenmoor** | Brix | **Corvane** | **Corvane** | **Esker** |
| 500 | Brix | **Corvane** | **Fenmoor** | Brix | **Corvane** | **Doran** | **Esker** |
| 888 | Brix | **Aldane** | **Fenmoor** | Brix | **Corvane** | **Doran** | **Esker** |

This is the headline. It is not a seed fluke — it reproduces in 8 of 8 seeds, and the
region you fund is the region the tree points at. Two honest details to state rather
than hide:

- **Brix never moves**, because Brix is genuinely the root. Funding a region that
  really is ancestral does not make it *more* ancestral. The bias creates false
  positives, not a uniform smear.
- **Aldane wins in only 3 of 8**, because capacity is a *percentage of population* and
  Aldane holds 900 people against Corvane's 2,600. A small region cannot out-sample a
  large one even at an identical rate. This is worth saying out loud — it shows the
  mechanism is tip counts, not a hidden "whoever moved the slider" rule.

### 1B. A five-day drag flips the whole outbreak's origin

Seed 111. Everyone at day 45 / 0.6%/day. Doran alone at 3%/day, 95% coverage; sweep only
Doran's **start day**:

| Doran starts | 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | **40** | **45** |
|---|---|---|---|---|---|---|---|---|---|---|
| inferred root | Dor | Dor | Dor | Dor | Dor | Dor | Dor | Dor | **Doran** | **Brix** |

Thresholds for the same sweep on other regions: **Corvane flips at 35→40, Fenmoor at
20→25.** Doran's is the demo — dragging one slider from day 45 to day 40 relocates the
origin of the entire epidemic. Five days of earlier surveillance, and the world names
a different country.

### 1C. Delaying the origin region erases its own claim

Seed 111, uniform baseline (day 0, 2%/day, 30% hospital, 95% coverage). Delay **only**
the region where each lineage actually arose:

| lineage | arose in | correct until | then blamed on | genomes at the flip |
|---|---|---|---|---|
| Delta | Doran | day 40 | **Esker** | 373 → 311 |
| Alpha | Aldane | day 50 | **Corvane** | 16 → 14 |
| Epsilon | Brix | day 55 | **Corvane** | 133 → 117 |
| Zeta | Fenmoor | day 50 | **Aldane** | 39 → 35 |
| Beta | Esker | day 65 | **Corvane** | 12 → 8 |
| Gamma | Corvane | day 80 | **Esker** | 86 → 55 |

Note Delta: **311 genomes of the lineage still in hand** and the origin is still wrong.
That kills the obvious objection ("you just needed more data"). Seed 888's Epsilon is
the extreme version — it flips Brix → Corvane at a 40-day delay while **1,768 genomes**
of Epsilon are still in the sample.

---

## Lever 2 — Testing capacity. Same conclusion, different currency.

Seed 111. Everyone at day 45 / 0.6%/day. One region gets day 0 and a swept capacity:

| region | 0.25 | 0.5 | 1.0 | 1.5 | **2.0** | **2.5** | 3.0 | 5.0 |
|---|---|---|---|---|---|---|---|---|
| Doran | Bri | Bri | Bri | Bri | **Dor** | Dor | Dor | Dor |
| Fenmoor | Bri | Bri | Bri | Bri | Bri | **Fen** | Fen | Fen |
| Corvane | Bri | Bri | Bri | Bri | Bri | **Cor** | Cor | Cor |
| Aldane | Bri | Bri | Bri | Bri | Bri | Bri | Bri | Bri |
| Esker | Bri | Bri | Bri | Bri | Bri | Bri | Bri | Bri |

Clean thresholds at **2.0%/day (Doran)** and **2.5%/day (Fenmoor, Corvane)**. Aldane and
Esker never take the root at any capacity — the same population-size point as 1A, and
a useful guard against the reading that the tool simply rewards slider movement.

### 2A. Funding a region gets it blamed for a variant it never had

Seed 111, starting from the **default policy the page opens on** (no other change).
Raise only **Brix's** capacity from its default 0.80%/day:

| Brix capacity | 0.80 | 1.5 | 2.5 | 3.5 | **5.0** |
|---|---|---|---|---|---|
| Zeta attributed to | Corvane | Corvane | Corvane | Corvane | **Brix** |

Zeta arose in **Fenmoor**. Brix buys sequencing, and Zeta becomes Brix's variant. This
is the perverse-incentive story in a single drag from the page's own opening state.

The mirror also holds, and should be shown for honesty: raising **Doran** to 5%/day
*fixes* Delta, and raising **Fenmoor** to 5%/day *fixes* Zeta. Funding your own
surveillance clears your name — right up until it implicates you for someone else's
lineage. Both directions are real, which is what makes it a trap rather than a bug.

---

## Lever 3 — Test allocation. The trickiest lever; scarcity is what makes it bite.

The user-visible fact: at a comfortable budget, dragging hospital/community barely moves
attribution. It bites **only under scarcity**, which is the honest and more interesting
claim. Use capacity **0.25%/day**.

### 3A. Same budget, 2.2× the genomes, two lineages ruined — seed 150

Seed 150 (all-correct at a good policy). Uniform day 0, **0.25%/day**, 95% coverage.
Sweep allocation only. **The test budget is identical at every column: 4,410 tests.**

| allocation | genomes | Alpha (mild, ×0.5) | Delta (severity-neutral) |
|---|---|---|---|
| 0% hospital | 270 | Aldane ✓ (14) | Doran ✓ (7) |
| 20% hospital | 388 | Aldane ✓ (13) | **Esker ✗** (11) |
| 60% hospital | 511 | **LOST** (1) | **Esker ✗** (16) |
| 100% hospital | 584 | **LOST** (0) | **Esker ✗** (20) |

Spend the same money, get **2.2× the genomes**, and lose both a lineage and an origin.
This is the best single case on the sheet, because two *different* mechanisms fire at
once and the artifact separates them:

- **Alpha** is the severity channel. It is mild (×0.5), so it is under-represented in
  the ward, and hospital-only sampling stops seeing it at all.
- **Delta is severity-neutral** (15.1% severe+critical against wild type's 14.2% at this
  seed — verified, not assumed). Its flip cannot be the severity channel. It is
  geographic: the hospital arm saturates at each region's ward census, so shifting to
  hospital reweights genomes *between* regions unevenly, which changes the tip counts
  the reconstruction reads as ancestry.

That second point is the one to make in the room. Delta says the allocation lever is
not merely "hospitals miss mild cases" — it warps geography too, through saturation.

### 3B. The simpler version on the house seed

Seed 111, uniform day 0, 0.25%/day, 95% coverage: genomes rise **256 → 663** (2.6×)
across the sweep while **Alpha goes from correctly attributed on 6 genomes to LOST at
70% hospital**. One mechanism, one slider — use this if 3A is too much at once.

---

## Lever 4 — Genome coverage. Real, but caveat it honestly.

### 4A. Under-cover one region and it becomes the ancestor

Seed 111, everyone at day 0 / 1.5%/day / 30% hospital / 95% coverage — then drop **one**
region's coverage. The genome count never changes (1,791 throughout); only how much of
each genome is read.

| Fenmoor coverage | 95% | 80% | 70% | **60%** |
|---|---|---|---|---|
| inferred root | Brix | Brix | Brix | **Fenmoor** |
| inferred tMRCA | day 7.4 | 9.9 | 11.7 | 13.1 |

| Corvane coverage | 95% | 80% | 60% | **40%** | 20% |
|---|---|---|---|---|---|
| inferred root | Brix | Brix | Brix | **Corvane** | **Corvane** |
| inferred tMRCA | day 7.4 | 3.2 | **−6.1** | **−25.2** | **−73.7** |

Fenmoor needs only a drop to 60% — a plausible number for degraded material. And note
the **sign difference**: under-covering small Fenmoor pushes the estimated ancestor
*later*, while under-covering large Corvane drags it to **74 days before the outbreak
began**. Big regions dominate the root-to-tip regression, so damaging them damages the
clock itself. Same lever, opposite direction, decided by population.

### 4B. The archaic effect, stated in dates

Seed 111, uniform, 1.0%/day, coverage swept globally:

| coverage | inferred tMRCA | Epsilon inferred day (true 15) | Beta inferred day (true 29) |
|---|---|---|---|
| 95% | 8.2 | 30 | 54 |
| 80% | 9.1 | 37 | 70 |
| 60% | 9.9 | 49 | 48 |
| 40% | 6.9 | 2 | 86 |
| 20% | 1.5 | **−16** | 9 |

At 20% coverage Epsilon is dated **16 days before the epidemic started**. Also worth
showing: readable Epsilon genomes fall 123 → 21 and Gamma 277 → 51. Thinning coverage
does not just blur the dates, it destroys the lab's ability to *call the lineage at all*.

**The caveat, which belongs on the slide and not in the footnotes.** Modern whole-genome
sequencing is closer to all-or-nothing than to this random per-site dropout, so 4A/4B
model historical partial-genome work, low-viral-load or degraded samples, and targeted
protocols — not a contemporary well-run lab. Say this before someone else does. The
surviving modern biases are Levers 1–3: *which* cases get sequenced, and *when*.

---

## Cross-cutting case — a perfect tree that names the wrong country

This is the one to close on. It is not a fifth lever; it is the result that explains why
the other four cannot be traded against each other.

**Setup.** Seed 111. Set **every** region's genome coverage to **100%** and leave the
sampling policy lopsided (or simply use the page's default policy). Then compare the two
tree panels by shape alone, ignoring colour.

| policy, all at 100% coverage | genomes | true clades recovered | geography |
|---|---|---|---|
| uniform, day 0, 2%/day | 2,149 | **469/469 — exact** | all correct |
| default policy | 1,321 | **311/311 — exact** | Alpha wrong |
| late + lopsided | 1,451 | **338/338 — exact** | Alpha, Delta, Zeta wrong |
| uniform, day 62, 0.15%/day | 155 | **exact** | **root wrong** |
| uniform, day 80, 0.2%/day | 67 | **exact** | **root wrong** |

Reproduces in **18 of 18** seed × policy combinations tested. The extreme is seed 888 at
day 80 / 0.2%/day: **30 genomes**, the genealogy of those 30 reconstructed perfectly, and
the root region wrong.

**Why it is guaranteed, not lucky.** Under infinite sites without recombination a mutation
*is* a clade — everyone carrying it descends from the single host it arose in. Observe
every mutation and the nesting of mutation sets reconstructs those tips' genealogy exactly.
Sampling policy has nothing left to break. Say this on stage; it converts an anecdote into
a proof, and it is the strongest evidence that the tool implements real method rather than
a scripted failure.

**The line to deliver.** Topology is read from *within-genome* information — how one
sample's mutations nest inside another's. Geography is read from *between-sample*
information — which regions the tips carry, and in what proportion. **No amount of depth
on the genomes you hold can manufacture a genome you never collected.** So "we sequenced
to full depth" is not an answer to attribution bias.

**The caveat that must go with it.** "Exactly right" means exactly right about *the tips
you collected*. The day-62 programme returns a flawless tree of 155 genomes; the day-0
programme returns a flawless tree of 2,149. Both are honest. They describe different
epidemics. A visibly mangled tree at least announces its own failure — this one does not,
which is what makes it the more dangerous artefact.

**Supporting slope**, if asked whether 100% coverage is a knife-edge (it is not):
coverage 99% → 94.5% of clades, 98% → 90.6%, 95% → 80.4%, 90% → 69.9%, 20% → 2.4%. Deep
coverage recovers shape *well*; only complete coverage recovers it *exactly*.

---

## Suggested running order

1. **1A** — the early detector becomes the origin, 8 seeds. Establishes the thesis and
   its robustness before anyone can call it a fluke.
2. **1B** — the five-day drag. Makes it visceral.
3. **2A** — funding Brix gets Brix blamed for Fenmoor's variant, from the page's own
   default state. The perverse incentive.
4. **3A** — same budget, 2.2× the data, two lineages lost. The trap, with the
   severity-neutral Delta proving there are two mechanisms.
5. **4A** — under-coverage as false ancestry, immediately followed by the modern-WGS
   caveat.
6. **Cross-cutting case** — the perfect tree that names the wrong country. Shows the four
   levers are not interchangeable: coverage buys shape, breadth buys geography, neither
   substitutes.
7. **Omniscient mode** — the control. Errors that survive perfect data are the method's
   floor, not the policy's fault. Ending here is what makes the rest falsifiable.

The two guards to keep in the answer pocket: **Brix never moves** (no false positives on
a region that really is ancestral) and **Aldane never wins on capacity** (population, not
slider movement, drives it). Both make the point that this is a mechanism, not a rigged
demo.
