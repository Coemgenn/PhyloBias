/* Real-DOM tests. The engine tests run the <script> headless, which cannot catch
   bugs that only exist once the page is assembled — a mismatched state key, an
   element that never un-hides, a handler that never fires. Those have all shipped
   at least once. jsdom is a dev dependency only; the artifact stays a single
   self-contained file with no build step. */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const html = fs.readFileSync(path.join(__dirname, "..", "src", "index.html"), "utf8");

function page(storage) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`, {
    runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.org/",
    beforeParse(win) {
      if (storage && storage.revealed !== undefined)
        win.localStorage.setItem("phylobias.revealed", storage.revealed);
    },
  });
  return dom.window;
}

test("the page builds without throwing", () => {
  const w = page();
  assert.ok(w.document.querySelector("#map-regions"), "map container missing");
  assert.ok(w.PB, "engine did not initialise");
});

test("the map draws all six regions and they are operable", () => {
  const w = page();
  const regions = w.document.querySelectorAll("#map-regions .region");
  assert.strictEqual(regions.length, 6);
  for (const r of regions) assert.ok(r.querySelector("polygon").getAttribute("fill"));
});

test("controls render with the shipped defaults", () => {
  const w = page();
  const ids = [...w.document.querySelectorAll("#scenario-fields input")].map(i => i.dataset.key);
  assert.deepStrictEqual(ids, ["r0", "clockRate", "seed"]);
  assert.deepStrictEqual(
    [...w.document.querySelectorAll("#policy-fields input")].map(i => i.dataset.key),
    ["startDay", "seqFraction", "hospitalMix", "depth"]);
});

test("the truth tree is hidden until revealed, then actually appears", () => {
  const w = page();
  const tree = w.document.querySelector("#truth-tree");
  const curtain = w.document.querySelector("#truth-curtain");
  assert.ok(tree.hidden, "tree should start hidden");
  assert.ok(!curtain.hidden, "curtain should start visible");
  assert.strictEqual(tree.querySelectorAll("svg").length, 0, "tree should not render while hidden");

  w.document.querySelector("#reveal-btn-2").click();

  assert.ok(curtain.hidden, "curtain did not hide on reveal");
  assert.ok(!tree.hidden, "tree did not un-hide on reveal");
  const svg = tree.querySelector("svg");
  assert.ok(svg, "no svg drawn after reveal");
  assert.ok(svg.querySelectorAll("g.branch").length > 20,
    "tree drew almost nothing — check the scenario keys reach the engine");
});

test("revealing survives a reload", () => {
  const w1 = page();
  w1.document.querySelector("#reveal-btn-2").click();
  assert.strictEqual(w1.localStorage.getItem("phylobias.revealed"), "1",
    "reveal state was not persisted");

  const w2 = page({ revealed: "1" });
  assert.ok(!w2.document.querySelector("#truth-tree").hidden,
    "a revealed tree should still be revealed after reload");
  assert.ok(w2.document.querySelector("#truth-tree svg"), "tree not drawn on restore");
  assert.strictEqual(w2.document.querySelector("#reveal-btn").textContent, "Hide");
});

test("hiding is remembered too, and unreadable storage is survivable", () => {
  const w = page({ revealed: "1" });
  w.document.querySelector("#reveal-btn").click();
  assert.strictEqual(w.localStorage.getItem("phylobias.revealed"), "0");
  const w2 = page({ revealed: "0" });
  assert.ok(w2.document.querySelector("#truth-tree").hidden);
});

test("region colours resolve to the six distinct tokens", () => {
  const w = page();
  w.document.querySelector("#reveal-btn-2").click();
  const svg = w.document.querySelector("#truth-tree svg").outerHTML;
  const used = new Set([...svg.matchAll(/var\(--reg-([a-z]+)\)/g)].map(m => m[1]));
  assert.strictEqual(used.size, 6, `only ${used.size} regions coloured: ${[...used]}`);
});

test("the map and the tree speak the same colour language", () => {
  /* One hue must mean one region everywhere. The map originally encoded
     sequencing effort as fill hue, which left it with no colour in common with
     the tree at all. */
  const w = page({ revealed: "1" });
  const mapColours = new Set([...w.document.querySelectorAll("#map-regions polygon")]
    .map(p => (p.getAttribute("fill").match(/--reg-([a-z]+)/) || [])[1]));
  assert.strictEqual(mapColours.size, 6, "map is not painted by region identity");

  const treeColours = new Set([...w.document.querySelector("#truth-tree svg").outerHTML
    .matchAll(/var\(--reg-([a-z]+)\)/g)].map(m => m[1]));
  assert.deepStrictEqual([...mapColours].sort(), [...treeColours].sort(),
    "map and tree use different region colour sets");

  /* effort rides on fill strength, so it must still vary with policy */
  const before = w.document.querySelector('#map-regions [data-region="corvane"] polygon')
    .getAttribute("fill-opacity");
  const slider = [...w.document.querySelectorAll("#policy-fields input")]
    .find(i => i.dataset.key === "seqFraction");
  w.document.querySelector('.chip[data-region="corvane"]').dispatchEvent(
    new w.MouseEvent("click", { bubbles: true }));
  const s2 = [...w.document.querySelectorAll("#policy-fields input")]
    .find(i => i.dataset.key === "seqFraction");
  s2.value = "95";
  s2.dispatchEvent(new w.Event("input", { bubbles: true }));
  const after = w.document.querySelector('#map-regions [data-region="corvane"] polygon')
    .getAttribute("fill-opacity");
  assert.ok(Number(after) > Number(before),
    `funding Corvane did not strengthen its fill (${before} -> ${after})`);
});

test("clicking a region on the map selects it", () => {
  const w = page();
  const target = w.document.querySelector('#map-regions .region[data-region="corvane"]');
  target.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  assert.strictEqual(w.document.querySelector("#sel-region").textContent, "Corvane");
  assert.strictEqual(
    w.document.querySelector('.chip[data-region="corvane"]').getAttribute("aria-pressed"), "true");
});

test("the inferred tree draws and the verdict reads off it", () => {
  const w = page();
  const svg = w.document.querySelector("#inferred-tree svg");
  assert.ok(svg, "inferred tree not drawn");
  assert.ok(svg.querySelectorAll("g.branch").length > 15, "inferred tree is nearly empty");
  assert.match(w.document.querySelector("#inf-note").textContent, /genomes/);
  for (const id of ["#v-inf-deme", "#v-inf-day", "#v-true-deme", "#v-true-day"])
    assert.ok(w.document.querySelector(id).textContent.trim().length > 0, `${id} is blank`);
});

test("moving a slider changes the reconstruction but never the truth", async () => {
  const w = page({ revealed: "1" });
  const truthBefore = w.document.querySelector("#truth-tree svg").outerHTML;
  const infBefore = w.document.querySelector("#inferred-tree svg").outerHTML;

  /* act on the region that dominates the sample set, so the change cannot be
     absorbed: the default policy leaves Aldane barely sequencing at all */
  w.document.querySelector('.chip[data-region="corvane"]')
    .dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const el = [...w.document.querySelectorAll("#policy-fields input")]
    .find(i => i.dataset.key === "seqFraction");
  el.value = "0";
  el.dispatchEvent(new w.Event("input", { bubbles: true }));
  /* the redraw is coalesced into an animation frame so a drag stays smooth */
  await new Promise(res => w.requestAnimationFrame(() => w.requestAnimationFrame(res)));

  assert.strictEqual(w.document.querySelector("#truth-tree svg").outerHTML, truthBefore,
    "policy changed the truth panel — the whole premise is that it cannot");
  assert.notStrictEqual(w.document.querySelector("#inferred-tree svg").outerHTML, infBefore,
    "policy did not change the reconstruction");
});

test("the full-information toggle sets every region and recovers the truth", () => {
  const w = page({ revealed: "1" });
  const btn = w.document.querySelector("#fullinfo-btn");
  assert.ok(btn, "toggle missing");

  const wrongBefore = w.document.querySelector("#verdict-note").textContent;
  assert.match(wrongBefore, /[1-9] of \d+ variant origins misplaced/,
    "the default policy should open with the bias visible");

  btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));

  /* every region, not just the selected one */
  for (const r of ["aldane", "brix", "corvane", "doran", "esker", "fenmoor"]) {
    const pct = w.document.querySelector(`#map-regions [data-region="${r}"] .region-value`);
    assert.strictEqual(pct.textContent, "100%", `${r} not set to full effort`);
  }
  assert.strictEqual(w.document.querySelector("#fullinfo-btn").textContent, "Restore policy");
  assert.ok(!w.document.querySelector("#fullinfo-note").hidden, "explanation not shown");

  assert.match(w.document.querySelector("#verdict-note").textContent,
    /^0 of \d+ variant origins misplaced/,
    "with complete data every origin should be recovered");

  /* and it restores */
  w.document.querySelector("#fullinfo-btn").dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  assert.strictEqual(w.document.querySelector("#verdict-note").textContent, wrongBefore,
    "restoring did not bring the original policy back");
});

test("touching a slider drops out of full-information mode", () => {
  const w = page();
  w.document.querySelector("#fullinfo-btn").dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const el = [...w.document.querySelectorAll("#policy-fields input")]
    .find(i => i.dataset.key === "seqFraction");
  el.value = "10";
  el.dispatchEvent(new w.Event("input", { bubbles: true }));
  assert.strictEqual(w.document.querySelector("#fullinfo-btn").getAttribute("aria-pressed"), "false",
    "the label still claims full information after a slider moved");
});

test("the root bar shows the root's own region, not a child's", () => {
  /* The reconstruction placed the root in Brix with support 1.00 while the bar
     rendered Fenmoor, because the renderer read the colour off whichever child
     sorted first. A correct inference was being displayed as wrong on the one
     panel whose job is to be compared against the truth. */
  const w = page({ revealed: "1" });
  w.document.querySelector("#fullinfo-btn").dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const bar = sel => {
    const g = w.document.querySelector(`${sel} svg g.branch line`);
    return (g.getAttribute("stroke").match(/--reg-(\w+)/) || [])[1];
  };
  assert.strictEqual(bar("#truth-tree"), "brix", "truth root is not the index region");
  /* The inferred root need not match: it sits under a wide polytomy that carries
     little information about its own state. What must hold is that the bar shows
     the ROOT's reconstructed region and not whichever child sorted first, which is
     what it used to do. */
  const roots = w.PB.REGIONS.map(r => r.id);
  assert.ok(roots.includes(bar("#inferred-tree")), "root bar is not a region at all");
});

test("each panel's legend reports its own numbers", () => {
  const w = page({ revealed: "1" });
  assert.strictEqual(w.document.querySelectorAll("#truth-count").length, 1, "duplicate id");
  const t = w.document.querySelector("#truth-count").textContent;
  const i = w.document.querySelector("#inferred-count").textContent;
  assert.match(t, /cases/, "truth legend should count cases");
  assert.match(i, /genomes/, "inferred legend should count genomes");
  assert.notStrictEqual(t, i, "the inferred panel is showing the truth's numbers");
});

test("branches meet the root bar in both panels", () => {
  /* The reconstruction's root bar was pinned to day 0 while its branches started
     at the estimated common ancestor, leaving them hanging in mid-air under a
     disconnected bar. */
  const w = page({ revealed: "1" });
  const check = sel => {
    const gs = [...w.document.querySelectorAll(`${sel} svg g.branch`)];
    const barY = +gs[0].querySelector("line").getAttribute("y1");
    const top = Math.min(...gs.slice(1).map(g => +g.querySelector("line").getAttribute("y1")));
    assert.ok(Math.abs(barY - top) < 0.6,
      `${sel}: root bar at y=${barY} but the highest branch starts at y=${top}`);
    return barY;
  };
  const truthY = check("#truth-tree");
  const infY = check("#inferred-tree");
  /* the reconstruction dates the common ancestor later than it really was, so its
     bar sits lower down the page — that offset is the date bias, not a bug */
  assert.ok(infY > truthY,
    "the inferred common ancestor should be dated later than the true day 0");
  assert.match(w.document.querySelector("#inferred-tree svg").outerHTML,
    /inferred common ancestor/, "the inferred root is not labelled as an estimate");
});
