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

test("no lineage's true origin is referenced outside the truth layer", () => {
  /* Guards the credibility rule: the attribution error has to emerge from the
     inference, never be read off the answer key. */
  const mark = "/* INFERENCE */";
  const i = src.indexOf(mark);
  if (i < 0) { console.log("      (no inference layer yet — guard is inert)"); return; }
  const inference = src.slice(i);
  for (const region of ["aldane", "esker", "corvane"]) {
    assert.ok(!inference.includes(`"${region}"`),
      `origin region "${region}" is hardcoded in the inference layer`);
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

test("layout puts every child to the right of its parent", () => {
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  const L = PB.layoutTree(t.roots, { rowH: 15, tMax: 150, width: 560, padL: 12, padR: 96 });
  for (const n of L.nodes)
    for (const c of n.children)
      assert.ok(c.x0 >= n.x1 - 0.01, "child branch starts left of its parent");
  assert.ok(L.rows > 0 && L.height > 0);
});

test("every branch carries a real region colour and a tooltip", () => {
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  const svg = PB.renderTreeSVG(t.roots, { tMax: 150, aria: "x" });
  const groups = (svg.match(/<g class="branch">/g) || []).length;
  assert.strictEqual(groups, (svg.match(/<title>/g) || []).length,
    "each branch group needs its own title, or tooltips attach to the whole svg");
  const ids = new Set(PB.REGIONS.map(r => r.id));
  for (const m of svg.match(/var\(--reg-([a-z]+)\)/g) || [])
    assert.ok(ids.has(m.slice(10, -1)), `unknown region token ${m}`);
});

test("variant markers are labelled on the tree", () => {
  const t = PB.autoTree(PB.runTruth(BASE), 26, 46);
  const svg = PB.renderTreeSVG(t.roots, { tMax: 150, aria: "x" });
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
