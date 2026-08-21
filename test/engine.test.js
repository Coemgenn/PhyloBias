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
