/* Wrap the artifact body in a real HTML document for static hosting.

   src/index.html is written for the Artifact runtime, which supplies the
   doctype, <html>, <head> and a charset at publish time. Served raw by a
   plain web server none of that exists, so the browser falls into quirks
   mode — and the page relies on `box-sizing: border-box` and a percentage
   height, both of which quirks mode changes. Hence this wrapper.

   src/index.html stays the single source of truth; this only ever adds a
   head around it. Run: node tools/build-pages.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "src/index.html";
const OUT = "docs/index.html";

const src = readFileSync(SRC, "utf8");

/* The page's own <title> sits at the top of the body, where the runtime reads
   it. In a real document it belongs in the head — but the SVG tooltips are
   <title> elements too, so only the leading one is moved. */
const m = src.match(/^\s*<title>([^<]*)<\/title>\s*/);
if (!m) throw new Error(`${SRC}: expected a leading <title> to hoist`);
const title = m[1];
const body = src.slice(m[0].length);

/* Mirrors the reset the Artifact runtime injects, so the hosted page starts
   from the same ground the approved one did. */
const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>:root{color-scheme:light}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#faf9f5;color:#141413}img{max-width:100%}</style>
</head>
<body>
${body}</body>
</html>
`;

mkdirSync("docs", { recursive: true });
writeFileSync(OUT, out);
console.log(`${OUT}  ${out.length} bytes  title="${title}"`);
