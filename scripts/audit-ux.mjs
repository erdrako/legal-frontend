import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const outputBaseArg = args.find((arg) => arg.startsWith("--output="));
const outputBase = resolve(outputBaseArg?.split("=")[1] ?? "reports/ux-audit.latest");

const files = {
  html: readFileSync(resolve("index.html"), "utf8"),
  js: readFileSync(resolve("src/app.js"), "utf8"),
  css: readFileSync(resolve("src/styles.css"), "utf8")
};

const checks = [];

addCheck({
  id: "simple-language-search",
  area: "Discovery",
  severity: "critical",
  pass:
    files.html.includes("search-form") &&
    files.html.includes("que cambia con la reforma laboral") &&
    files.js.includes("runSearch"),
  evidence: "Home exposes a natural-language search form for the MVP question.",
  recommendation: "Keep the first action centered on a plain-language question."
});

addCheck({
  id: "suggested-questions",
  area: "Discovery",
  severity: "major",
  pass: [
    "que cambia con la reforma laboral",
    "que cambia para los trabajadores",
    "que pasa con las indemnizaciones",
    "que cambia en el periodo de prueba"
  ].every((query) => files.js.includes(query)),
  evidence: "Suggested searches cover the expected MVP user intents.",
  recommendation: "Add more suggestions only after observing real search language."
});

addCheck({
  id: "summary-before-legal-text",
  area: "Comprehension",
  severity: "critical",
  pass: files.html.indexOf("proposal-short") > -1 && files.html.indexOf("proposal-short") < files.html.indexOf("diff-list"),
  evidence: "The screen gives a plain summary before the article-by-article diff.",
  recommendation: "Do not lead with dense legal text."
});

addCheck({
  id: "affected-topics-and-groups",
  area: "Impact",
  severity: "critical",
  pass:
    files.html.includes("topics-list") &&
    files.html.includes("groups-list") &&
    files.js.includes("renderTopics") &&
    files.js.includes("renderGroups"),
  evidence: "The UI separates affected topics from impacted groups.",
  recommendation: "Keep topics and groups visible before detailed legal comparison."
});

addCheck({
  id: "side-by-side-diff",
  area: "Comparison",
  severity: "critical",
  pass:
    files.html.includes("diff-list") &&
    files.css.includes(".legal-compare") &&
    files.js.includes("legal-text current") &&
    files.js.includes("legal-text proposed"),
  evidence: "Each change has current and proposed text in separate blocks.",
  recommendation: "Preserve access to both legal texts in every diff item."
});

addCheck({
  id: "plain-explanation-per-change",
  area: "Comprehension",
  severity: "critical",
  pass: files.js.includes("Que cambia") && files.js.includes("Que significa") && files.js.includes("practicalImpact"),
  evidence: "Every diff renders what changes and what it means.",
  recommendation: "Do not collapse practical impact into technical legal labels."
});

addCheck({
  id: "source-status-scope",
  area: "Trust",
  severity: "critical",
  pass:
    files.html.includes("source-box") &&
    files.html.includes("scope-box") &&
    files.js.includes("dataStatus") &&
    files.js.includes("legalAdviceWarning"),
  evidence: "Source, data status, scope and legal warning are rendered.",
  recommendation: "Keep trust metadata visible without requiring a technical view."
});

addCheck({
  id: "no-personalized-legal-advice",
  area: "Trust",
  severity: "critical",
  pass:
    files.js.includes("no brinda asesoramiento legal personalizado") &&
    !/en tu caso|debes hacer|tenes que hacer/i.test(files.html + files.js),
  evidence: "The interface warns that it is not personalized legal advice.",
  recommendation: "Avoid imperative advice for a user's individual situation."
});

addCheck({
  id: "accessibility-basics",
  area: "Accessibility",
  severity: "major",
  pass:
    files.html.includes('<html lang="es">') &&
    files.html.includes('aria-label="Navegacion principal"') &&
    files.html.includes('class="sr-only"') &&
    countMatches(files.html, /<h1[>\s]/g) === 1,
  evidence: "The static page has language, landmarks, hidden labels and one H1.",
  recommendation: "Keep labels and document structure explicit as the UI grows."
});

addCheck({
  id: "responsive-layout",
  area: "Responsive",
  severity: "major",
  pass:
    countMatches(files.css, /@media/g) >= 2 &&
    files.css.includes(".legal-compare") &&
    files.css.includes("grid-template-columns: 1fr"),
  evidence: "CSS defines responsive breakpoints and collapses the diff layout.",
  recommendation: "Verify real mobile screenshots before production announcements."
});

addCheck({
  id: "stable-readable-type",
  area: "Visual",
  severity: "major",
  pass: !/letter-spacing:\s*-/i.test(files.css) && !/font-size:[^;]*vw/i.test(files.css),
  evidence: "Typography avoids negative letter spacing and viewport-scaled font sizes.",
  recommendation: "Use fixed/rem sizes and responsive containers instead of viewport font scaling."
});

addCheck({
  id: "no-external-runtime-assets",
  area: "Reliability",
  severity: "minor",
  pass: !/https?:\/\/(?!lexmapa-api\.linqorait\.com)/i.test(files.html),
  evidence: "The static shell does not depend on third-party runtime assets.",
  recommendation: "Keep the MVP shell self-contained for Cloudflare Pages."
});

const score = calculateScore(checks);
const result = {
  generatedAt: new Date().toISOString(),
  target: "legal-frontend",
  score,
  status: score >= 90 && checks.every((check) => check.severity !== "critical" || check.pass) ? "PASS" : "FAIL",
  checks
};

if (!checkOnly) {
  mkdirSync(dirname(outputBase), { recursive: true });
  writeFileSync(`${outputBase}.json`, `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(`${outputBase}.md`, renderMarkdown(result));
}

console.log(`UX audit ${result.status}: ${score}/100 (${checks.filter((check) => check.pass).length}/${checks.length} checks passing)`);

if (result.status !== "PASS") {
  for (const check of checks.filter((item) => !item.pass)) {
    console.error(`- ${check.id}: ${check.recommendation}`);
  }
  process.exit(1);
}

function addCheck(check) {
  checks.push(check);
}

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function calculateScore(items) {
  const weights = {
    critical: 10,
    major: 6,
    minor: 3
  };
  const total = items.reduce((sum, item) => sum + weights[item.severity], 0);
  const passed = items.filter((item) => item.pass).reduce((sum, item) => sum + weights[item.severity], 0);
  return Math.round((passed / total) * 100);
}

function renderMarkdown(report) {
  const rows = report.checks
    .map(
      (check) =>
        `| ${check.pass ? "PASS" : "FAIL"} | ${check.severity} | ${check.area} | ${check.id} | ${escapePipes(check.evidence)} |`
    )
    .join("\n");

  return `# LexMapa UX Audit

Generated: ${report.generatedAt}

Target: ${report.target}

Status: ${report.status}

Score: ${report.score}/100

## Checks

| Result | Severity | Area | Check | Evidence |
|---|---|---|---|---|
${rows}

## Follow-up

- Run \`npm run audit:ux\` after significant frontend changes.
- Run \`npm run audit:ux:check\` in CI or before deploy.
- Treat this as a product heuristic audit, not a replacement for user testing.
`;
}

function escapePipes(value) {
  return String(value).replaceAll("|", "\\|");
}
