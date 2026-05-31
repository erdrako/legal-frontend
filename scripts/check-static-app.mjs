import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const js = readFileSync("src/app.js", "utf8");
const css = readFileSync("src/styles.css", "utf8");
const config = readFileSync("config.js", "utf8");

assert(html.includes("LexMapa"), "index.html must include product name");
assert(html.includes("search-form"), "index.html must include search form");
assert(html.includes("config.js"), "index.html must load runtime config");
assert(html.includes("Cambios en debate"), "index.html must include debate section");
assert(html.includes("Cambios recientes"), "index.html must include recent changes section");
assert(html.includes("Explorar por tema"), "index.html must include topics section");
assert(html.includes("Normas importantes"), "index.html must include important norms section");
assert(html.includes("Como leer LexMapa"), "index.html must include how-to-read section");
assert(html.includes("Texto vigente vs texto propuesto"), "index.html must expose legal diff section");
assert(js.includes("fallbackProposal"), "app.js must include change proposal seed");
assert(js.includes("loadInitialData"), "app.js must support API-backed data loading");
assert(js.includes("change-proposals"), "app.js must load change proposals from API");
assert(js.includes("renderDiffs"), "app.js must render legal diffs");
assert(js.includes("legalAdviceWarning"), "app.js must show legal advice warning");
assert(js.includes("Fuente original pendiente de carga"), "app.js must show missing original source state");
assert(js.includes("originalSource"), "app.js must render original sources");
assert(!html.includes("query-examples"), "index.html must not include quick-access query chips");
assert(config.includes("LEXMAPA_CONFIG"), "config.js must define runtime config");
assert(js.includes("MANUAL_FIXTURE"), "app.js must expose fixture data state");
assert(css.includes(".workspace"), "styles.css must include workspace styles");
assert(css.includes(".legal-compare"), "styles.css must include side-by-side diff styles");
assert(css.includes("@media"), "styles.css must include responsive rules");

console.log("Static app checks passed.");

function assert(condition, message) {
  if (!condition) {
    console.error(`Static app check failed: ${message}`);
    process.exit(1);
  }
}
