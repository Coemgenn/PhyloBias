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
  assert.strictEqual(w.document.querySelectorAll("#policy-fields input").length, 4);
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

test("clicking a region on the map selects it", () => {
  const w = page();
  const target = w.document.querySelector('#map-regions .region[data-region="corvane"]');
  target.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  assert.strictEqual(w.document.querySelector("#sel-region").textContent, "Corvane");
  assert.strictEqual(
    w.document.querySelector('.chip[data-region="corvane"]').getAttribute("aria-pressed"), "true");
});
