import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const js = readFileSync("src/app.js", "utf8");
const css = readFileSync("src/styles.css", "utf8");

assert(html.includes("LexMapa"), "index.html must include product name");
assert(html.includes("search-form"), "index.html must include search form");
assert(js.includes("approvedOverview"), "app.js must include approved overview seed");
assert(js.includes("renderRelationships"), "app.js must render relationships");
assert(css.includes(".app-shell"), "styles.css must include app shell styles");
assert(css.includes("@media"), "styles.css must include responsive rules");

console.log("Static app checks passed.");

function assert(condition, message) {
  if (!condition) {
    console.error(`Static app check failed: ${message}`);
    process.exit(1);
  }
}

