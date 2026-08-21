# Unverified claims

Per the content standard in `CLAUDE.md`: the world is invented, the mechanics are not.
Everything below is a **lead**, not a citation. None of it may ship as a stated number on the
page until checked against a real source.

## Carried over

- Substitution-rate range for the molecular clock (RNA viruses, per site per year)
- Serial interval shape/scale, and negative-binomial dispersion `k` for offspring
- Severity tier distribution
- Root-to-tip regression (TempEst) as the standard rooting/clock diagnostic
- Lemey et al. discrete phylogeography; Nextstrain/Augur as the production toolchain
- WHO's 2021 move to Greek-letter variant naming

## Added by the sampling-economics rework

- **Test positivity as a surveillance-adequacy indicator.** The WHO ~5% positivity benchmark is
  the well-known reference point. Not yet checked; no positivity figure is currently stated on
  the page as a real-world value.
- **Real-world peak per-capita testing rates.** The `MAX_CAPACITY = 5` slider ceiling (5% of the
  population swabbed per day) is asserted on the page to be "several times any real programme's
  peak". That comparison needs a source before it stands. Recollection, unverified: the highest
  national rates during COVID were of order 1%/day.
- **Hospital-admission enrichment.** The model treats admissions as a pool whose census bounds
  the hospital arm, rather than assigning a literal positivity figure — deliberately, to avoid
  inventing a number. If a positivity figure is ever stated, it needs a source.

## Deliberately stated as a limitation, not a citation

Prevalence in this world peaks around 32%, far above any real outbreak, because the population
is under 10,000 with a ~92% attack rate. This makes random screening **more** efficient here
than in reality. It is disclosed on the page in the Method & sources panel, and it biases the
argument *against* the page's own thesis, which is the safe direction.
