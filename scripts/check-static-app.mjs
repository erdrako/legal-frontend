import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const js = readFileSync("src/app.js", "utf8");
const css = readFileSync("src/styles.css", "utf8");
const config = readFileSync("config.js", "utf8");

assert(html.includes("LexMapa"), "index.html must include product name");
assert(html.includes("search-form"), "index.html must include search form");
assert(html.includes("config.js"), "index.html must load runtime config");
assert(html.includes("Texto actual vs texto propuesto"), "index.html must expose legal diff section");
assert(js.includes("fallbackProposal"), "app.js must include change proposal seed");
assert(js.includes("loadInitialData"), "app.js must support API-backed data loading");
assert(js.includes("change-proposals"), "app.js must load change proposals from API");
assert(js.includes("renderDiffs"), "app.js must render legal diffs");
assert(js.includes("legalAdviceWarning"), "app.js must show legal advice warning");
assert(config.includes("LEXMAPA_CONFIG"), "config.js must define runtime config");
assert(js.includes("MANUAL_FIXTURE"), "app.js must expose fixture data state");
assert(css.includes(".app-shell"), "styles.css must include app shell styles");
assert(css.includes(".legal-compare"), "styles.css must include side-by-side diff styles");
assert(css.includes("@media"), "styles.css must include responsive rules");

console.log("Static app checks passed.");

function assert(condition, message) {
  if (!condition) {
    console.error(`Static app check failed: ${message}`);
    process.exit(1);
  }
}
