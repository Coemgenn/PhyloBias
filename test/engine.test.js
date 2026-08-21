/* Tests run against the artifact itself: the <script> block is extracted from
   src/index.html and evaluated headless, so there is no second copy of the
   engine to drift out of sync. */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "src", "index.html"), "utf8");
const src = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new Function(src)();
const PB = globalThis.PB;

const BASE = { seed: 111, r0: 2.4, clockRate: 9 };
const hash = o => {
  const s = JSON.stringify(o);
  let x = 0;
  for (let i = 0; i < s.length; i++) x = (Math.imul(x, 31) + s.charCodeAt(i)) | 0;
  return x >>> 0;
};

test("engine is exported and DOM-free", () => {
  assert.ok(PB && typeof PB.runTruth === "function");
});

test("determinism: same scenario, identical truth", () => {
  const a = PB.runTruth(BASE), b = PB.runTruth(BASE);
  assert.strictEqual(hash(a.cases), hash(b.cases));
  assert.strictEqual(hash(a.mutations), hash(b.mutations));
});

test("different seed produces a different epidemic", () => {
  assert.notStrictEqual(hash(PB.runTruth(BASE).cases),
                        hash(PB.runTruth({ ...BASE, seed: 112 }).cases));
});

test("truth ignores policy entirely", () => {
  /* The thesis in test form: sampling policy must not reach the truth layer. */
  const a = PB.truthFor({ ...BASE, policy: { corvane: { seqFraction: 90 } } });
  const b = PB.truthFor({ ...BASE, policy: { corvane: { seqFraction: 0 } } });
  assert.strictEqual(a, b, "same scenario must return the memoised same object");
});

test("outbreak establishes at the default seed", () => {
  assert.ok(PB.runTruth(BASE).stats.cases > 10000);
});

test("final size is bounded — not everyone is infected", () => {
  const T = PB.runTruth(BASE);
  for (const r of PB.REGIONS) {
    const rate = T.stats.byRegion[r.id] / r.pop;
    assert.ok(rate < 0.995, `${r.name} attack rate ${rate} — depletion not binding`);
    assert.ok(rate > 0.5, `${r.name} attack rate ${rate} — barely seeded`);
  }
});

test("all four lineages emerge in their designed regions", () => {
  const T = PB.runTruth(BASE);
  const want = { wild: "brix", kestrel: "aldane", tern: "esker", harrow: "corvane" };
  for (const L of T.lineages) {
    assert.ok(L.emerged, `${L.name} never emerged`);
    assert.strictEqual(L.originRegion, want[L.id], `${L.name} origin`);
    assert.ok(L.cases >= 500, `${L.name} only ${L.cases} cases — too small to sample`);
  }
});

test("severity ordering holds: Kestrel mild, Harrow severe, Tern neutral", () => {
  const T = PB.runTruth(BASE);
  const s = Object.fromEntries(T.lineages.map(l => [l.id, l.severeShare]));
  assert.ok(s.kestrel < s.wild, "Kestrel must be milder than wild type");
  assert.ok(s.harrow > s.wild, "Harrow must be more severe than wild type");
  /* Tern is the control: same severity as wild type, so any misattribution of it
     cannot be blamed on the severity channel. */
  assert.ok(Math.abs(s.tern - s.wild) < 0.05, `Tern ${s.tern} vs wild ${s.wild}`);
});

test("mutation record is a valid perfect phylogeny", () => {
  const T = PB.runTruth(BASE);
  for (const m of T.mutations) {
    assert.ok(m.parent < m.id, "parent must precede child");
    if (m.parent >= 0) {
      assert.ok(T.carriers[m.parent] >= T.carriers[m.id],
        `carriers not monotone at mutation ${m.id}`);
    }
  }
});

test("every case's genotype carries its lineage marker", () => {
  const T = PB.runTruth(BASE);
  for (const L of T.lineages) {
    if (L.id === "wild" || L.markerMutation == null) continue;
    const c = T.cases.find(c => c.lineage === L.id);
    assert.ok(PB.genotypeOf(T, c.id).includes(L.markerMutation),
      `${L.name} case missing its own marker`);
  }
});

test("mutations accumulate with the clock rate", () => {
  const slow = PB.runTruth({ ...BASE, clockRate: 4 });
  const fast = PB.runTruth({ ...BASE, clockRate: 16 });
  const per = T => T.mutations.length / T.stats.cases;
  assert.ok(per(fast) > per(slow) * 2, "faster clock must yield more mutations per case");
});

test("the inference never reads the answer key", () => {
  /* The credibility rule: the attribution error has to EMERGE from standard
     method, never be injected. Scan the inference functions themselves rather
     than "everything after a marker" — the earlier version flagged the UI's
     default selected region and told us nothing. */
  const NAMES = ["sampleGenomes", "perfectPhylogeny", "rootToTip", "fitchRegions",
                 "buildInferredTree", "autoInferredTree"];
  for (const fn of NAMES) {
    const at = src.indexOf(`function ${fn}(`);
    assert.ok(at > 0, `${fn} not found — rename it in this guard too`);
    /* take the function body by brace matching */
    let i = src.indexOf("{", at), depth = 0, end = i;
    for (; end < src.length; end++) {
      if (src[end] === "{") depth++;
      else if (src[end] === "}") { depth--; if (!depth) break; }
    }
    /* strip comments: a note explaining why a field is NOT read must not trip
       the guard that checks it is not read */
    const body = src.slice(i, end)
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    for (const region of ["aldane", "brix", "corvane", "doran", "esker", "fenmoor"])
      assert.ok(!body.includes(`"${region}"`),
        `${fn} hardcodes the region "${region}" — the bias must emerge, not be injected`);
    for (const lineage of ["kestrel", "harrow", "tern"])
      assert.ok(!body.includes(`"${lineage}"`),
        `${fn} hardcodes the lineage "${lineage}"`);
    assert.ok(!/\.originRegion|\.originDay|\.lineage\b/.test(body),
      `${fn} reads a truth-only field`);
  }
});

/* ---------- display tree ---------- */

test("ladder collapsing preserves every mutation", () => {
  const T = PB.runTruth(BASE);
  const t = PB.autoTree(T, 26, 46);
  let nodes = 0, muts = 0;
  (function w(ns) { for (const n of ns) { nodes++; muts += n.segs.length; w(n.children); } })(t.roots);
  assert.ok(muts > nodes, "collapsing should fold some mutations into shared branches");
  /* a collapsed run must have identical carrier counts — that is what makes the
     mutations indistinguishable and the collapse lossless */
  (function w(ns) {
    for (const n of ns) {
      for (const seg of n.segs) assert.strictEqual(T.carriers[seg.id], n.carriers);
      w(n.children);
    }
  })(t.roots);
});

test("tree lands in a drawable size", () => {
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  assert.ok(t.tips >= 20 && t.tips <= 60, `${t.tips} tips is outside the drawable band`);
});

test("layout puts every child below its parent in time", () => {
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  const L = PB.layoutTree(t.roots, { colW: 14, tMax: 60, depth: 300, padT: 14, padB: 10, padL: 34 });
  for (const n of L.nodes)
    for (const c of n.children)
      assert.ok(c.y0 >= n.y1 - 0.01, "child branch starts above its parent");
  assert.ok(L.cols > 0 && L.width > 0);
});

test("the time axis is trimmed to the drawn tree, not the epidemic", () => {
  /* pruning leaves only mutations that arose early, so scaling the axis to the
     last case would leave most of the width empty */
  const T = PB.runTruth(BASE);
  const t = PB.autoTree(T, 26, 46);
  const span = PB.treeSpan(t.roots);
  assert.ok(span > 0 && span < T.stats.lastDay,
    "tree span should be shorter than the whole epidemic");
  let deepest = 0;
  (function w(ns) { for (const n of ns) { deepest = Math.max(deepest, n.tEnd); w(n.children); } })(t.roots);
  assert.strictEqual(span, deepest);
});

test("every branch carries a real region colour and a tooltip", () => {
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  const svg = PB.renderTreeSVG(t.roots, { tMax: 60, aria: "x" });
  const groups = (svg.match(/<g class="branch">/g) || []).length;
  assert.strictEqual(groups, (svg.match(/<title>/g) || []).length,
    "each branch group needs its own title, or tooltips attach to the whole svg");
  const ids = new Set(PB.REGIONS.map(r => r.id));
  for (const m of svg.match(/var\(--reg-([a-z]+)\)/g) || [])
    assert.ok(ids.has(m.slice(10, -1)), `unknown region token ${m}`);
});

test("variant markers are labelled on the tree", () => {
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  const svg = PB.renderTreeSVG(t.roots, { tMax: 60, aria: "x" });
  for (const name of ["Kestrel", "Tern", "Harrow"])
    assert.ok(svg.includes(">" + name + "<"), `${name} not labelled on the tree`);
});

test("the UI's own scenario object drives the engine correctly", () => {
  /* Regression: the slider key was `clock` while the engine read `clockRate`,
     so the page silently built a 3-mutation tree instead of ~22,000. Tests that
     call runTruth with a hand-written literal cannot catch that — this one
     reads the defaults the page actually ships. */
  const defaults = Object.fromEntries(
    src.match(/const SCENARIO_FIELDS = \[[\s\S]*?\n\];/)[0]
       .match(/key: "(\w+)"[\s\S]*?value: ([\d.]+)/g)
       .map(m => [m.match(/key: "(\w+)"/)[1], Number(m.match(/value: ([\d.]+)/)[1])]));
  const T = PB.runTruth(defaults);
  assert.ok(T.mutations.length > 5000,
    `UI defaults produced only ${T.mutations.length} mutations`);
  assert.ok(PB.autoTree(T, 26, 46).tips >= 20);
});

test("a malformed scenario throws instead of degrading quietly", () => {
  assert.throws(() => PB.runTruth({ seed: 111, r0: 2.4 }), /clockRate/);
  assert.throws(() => PB.runTruth({ seed: 111, r0: 2.4, clockRate: NaN }), /clockRate/);
});

test("the tree draws its root, so lineages are not orphan stubs", () => {
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  assert.ok(t.roots.length > 1, "this scenario should have a root polytomy");
  const svg = PB.renderTreeSVG(t.roots, { tMax: 60, aria: "x" });
  assert.match(svg, /Ancestral genotype/,
    "root connector missing — root lineages would read as unrelated");
});

test("no non-ASCII in executable code: the page cannot declare a charset", () => {
  /* <head> is supplied by the artifact runtime, so a meta charset cannot be added
     here. A literal '·' in a string renders as 'Â·' whenever the file is decoded
     as latin-1. Comments are exempt; strings and identifiers are not. */
  const noComments = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const bad = [...new Set([...noComments].filter(c => c.charCodeAt(0) > 127))];
  assert.deepStrictEqual(bad, [], `non-ASCII in code: ${bad.join(" ")}`);
});

test("branches are coloured by where the lineage was, not where it ended up", () => {
  /* Every lineage descends from the Brix introductions, so the top of every root
     branch must be Brix. Colouring a branch by the region of the mutation that
     ends it painted a lineage's whole 26 days in Brix with its destination's
     colour. */
  const T = PB.runTruth(BASE);
  const t = PB.autoTree(T, 26, 46);
  for (const r of t.roots)
    assert.strictEqual(r.path[0].region, "brix",
      "a root branch starts somewhere other than the index region");

  /* occupancy must tile the branch with no gaps or overlaps */
  (function walk(ns) {
    for (const n of ns) {
      assert.ok(n.path.length >= 1);
      assert.ok(Math.abs(n.path[0].t0 - n.tStart) < 1e-6, "path must start at the branch start");
      assert.ok(Math.abs(n.path[n.path.length - 1].t1 - n.tEnd) < 1e-6, "path must reach the mutation");
      for (let i = 1; i < n.path.length; i++)
        assert.ok(Math.abs(n.path[i].t0 - n.path[i - 1].t1) < 1e-6, "gap in occupancy");
      walk(n.children);
    }
  })(t.roots);
});

test("at least one branch records a migration", () => {
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  let multi = 0;
  (function w(ns) { for (const n of ns) { if (n.path.length > 1) multi++; w(n.children); } })(t.roots);
  assert.ok(multi > 0, "no branch shows a region change — occupancy is not being tracked");
});

test("connectors are continuous with the branches they join", () => {
  /* A joint drawn in a neutral colour breaks the line visually. It is only safe
     to colour it by the parent's endpoint region because every child provably
     starts there — assert that rather than assuming it. */
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  (function walk(ns) {
    for (const n of ns) {
      for (const c of n.children)
        assert.strictEqual(c.path[0].region, n.region,
          "child starts in a different region than its parent's connector colour");
      walk(n.children);
    }
  })(t.roots);
  const svg = PB.renderTreeSVG(t.roots, { tMax: 60, aria: "x" });
  assert.ok(!/stroke="var\(--border-firm\)"/.test(svg), "a connector is still drawn neutral");
});

/* ---------- the claim the whole design rests on ---------- */

test("at full coverage the inferred topology IS the true topology", () => {
  /* This is why perfect phylogeny was chosen over neighbour-joining: at complete
     data the method must contribute zero error, so every difference the sliders
     produce is the sampling policy and not the algorithm. Asserted, not assumed. */
  const T = PB.runTruth(BASE);
  const pol = Object.fromEntries(PB.REGIONS.map(r =>
    [r.id, { startDay: 0, seqFraction: 100, hospitalMix: 0, depth: 100, delay: 0 }]));
  const { samples } = PB.sampleGenomes(T, pol);
  const P = PB.perfectPhylogeny(samples);

  const trueCarriers = new Map();
  samples.forEach((s, i) => {
    for (const m of PB.genotypeOf(T, s.caseId)) {
      if (!trueCarriers.has(m)) trueCarriers.set(m, new Set());
      trueCarriers.get(m).add(i);
    }
  });
  const kept = new Set([...trueCarriers].filter(([, v]) => v.size >= 2).map(([m]) => m));

  const infTips = new Map(), infParent = new Map();
  (function walk(n, p) {
    if (n.mut !== null) { infTips.set(n.mut, n.tips); infParent.set(n.mut, p); }
    for (const c of n.children) walk(c, n.mut === null ? null : n.mut);
  })(P.root, null);

  assert.strictEqual(P.conflicts, 0, "complete data must not conflict");
  assert.ok(kept.size > 100, "not enough clades to make this meaningful");

  for (const m of kept) {
    const want = trueCarriers.get(m), got = infTips.get(m);
    assert.ok(got, `clade for mutation ${m} missing from the reconstruction`);
    assert.strictEqual(got.size, want.size, `clade ${m} has the wrong size`);
    for (const t of want) assert.ok(got.has(t), `clade ${m} has the wrong members`);

    /* nesting too, not just membership */
    let p = T.mutations[m].parent;
    while (p >= 0 && !kept.has(p)) p = T.mutations[p].parent;
    assert.strictEqual(infParent.get(m) ?? null, p >= 0 ? p : null,
      `mutation ${m} is attached under the wrong parent`);
  }
});

test("and it stops being identical once coverage drops", () => {
  /* guards the test above from being vacuous */
  const T = PB.runTruth(BASE);
  const pol = Object.fromEntries(PB.REGIONS.map(r =>
    [r.id, { startDay: 0, seqFraction: 100, hospitalMix: 0, depth: 60, delay: 0 }]));
  const { samples } = PB.sampleGenomes(T, pol);
  const P = PB.perfectPhylogeny(samples);
  assert.ok(P.conflicts > 0,
    "partial coverage should make mutation sets conflict — otherwise the identity test proves nothing");
});
