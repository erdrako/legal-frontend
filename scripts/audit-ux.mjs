import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const outputBaseArg = args.find((arg) => arg.startsWith("--output="));
const outputBase = resolve(outputBaseArg?.split("=")[1] ?? "reports/ux-audit.latest");

const files = {
  html: readFileSync(resolve("index.html"), "utf8"),
  opsHtml: readFileSync(resolve("ops.html"), "utf8"),
  js: readFileSync(resolve("src/app.js"), "utf8"),
  opsJs: readFileSync(resolve("src/ops.js"), "utf8"),
  data: readFileSync(resolve("src/senate-agenda-fixtures.js"), "utf8"),
  css: readFileSync(resolve("src/styles.css"), "utf8")
};

const checks = [];

addCheck({
  id: "home-six-sections",
  area: "Information architecture",
  severity: "critical",
  pass: [
    'id="buscar"',
    'id="cambios-en-debate"',
    'id="cambios-recientes"',
    'id="temas"',
    'id="normas"',
    'id="como-leer"'
  ].every((token) => files.html.includes(token)),
  evidence: "Home is organized into hero, debate, recent, topics, norms and how-to-read sections.",
  recommendation: "Keep the home structured by sections instead of shortcuts."
});

addCheck({
  id: "simple-language-search",
  area: "Discovery",
  severity: "critical",
  pass:
    files.html.includes("search-form") &&
    files.html.includes("Que se trata sobre Ley Hojarasca") &&
    files.js.includes("runSearch"),
  evidence: "Home exposes a natural-language search form for real agenda items.",
  recommendation: "Keep the first action centered on a plain-language question."
});

addCheck({
  id: "no-quick-access-chips",
  area: "Discovery",
  severity: "critical",
  pass: !files.html.includes("query-examples") && !files.html.includes("query-chip") && !files.js.includes("renderQueryExamples"),
  evidence: "Home does not render quick-access chips below the search box.",
  recommendation: "Organize discovery through sections, not highlighted shortcut chips."
});

addCheck({
  id: "query-aware-result-focus",
  area: "Discovery",
  severity: "critical",
  pass:
    files.html.includes("search-answer-panel") &&
    files.js.includes("matchedDiffIds") &&
    files.js.includes("initialQueryFromUrl") &&
    files.js.includes("Encontramos un proyecto en debate") &&
    files.css.includes(".matched-diff") &&
    files.css.includes(".capture-search"),
  evidence: "Search results can explain why a proposal matched and support shareable query URLs.",
  recommendation: "Keep natural-language search connected to concrete changes, not only proposal titles."
});

addCheck({
  id: "real-agenda-items",
  area: "Data trust",
  severity: "critical",
  pass:
    files.data.includes("REAL_AGENDA_ITEM") &&
    files.data.includes("ley-hojarasca") &&
    files.data.includes("biocombustibles") &&
    files.data.includes("parque-marino-monte-leon") &&
    files.data.includes("officialAgendaSourceUrl") &&
    files.data.includes("proposedTextOriginalUrls") &&
    !files.data.includes("super-rigi") &&
    !files.data.includes("diputados.gob.ar") &&
    !files.data.includes("reforma-laboral-mvp-2026"),
  evidence: "The productive UI seed uses official Senate agenda items and no longer exposes fictional or Diputados data in this vertical slice.",
  recommendation: "Keep test/demo data out of the user-facing home."
});

addCheck({
  id: "recent-empty-state",
  area: "Information architecture",
  severity: "major",
  pass: files.js.includes("No hay cambios recientes cargados todavia"),
  evidence: "Recent changes has an explicit empty state instead of invented data.",
  recommendation: "Keep empty states honest while data is incomplete."
});

addCheck({
  id: "summary-before-legal-text",
  area: "Comprehension",
  severity: "critical",
  pass: files.html.indexOf("detail-summary") > -1 && files.html.indexOf("detail-summary") < files.html.indexOf("diff-list"),
  evidence: "The screen gives a plain summary before the article-by-article diff.",
  recommendation: "Do not lead with dense legal text."
});

addCheck({
  id: "important-norms-secondary",
  area: "Information architecture",
  severity: "major",
  pass: files.html.includes("Consulta de base, no flujo principal") && files.css.includes(".quiet-section"),
  evidence: "Important norms is visually marked as reference, not the main product flow.",
  recommendation: "Keep norms below debate/recent changes and visually quieter."
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
  pass: files.js.includes("Explicacion simple") && files.js.includes("Interpretacion orientativa") && files.js.includes("practicalImpact"),
  evidence: "Every diff renders what changes and what it means.",
  recommendation: "Do not collapse practical impact into technical legal labels."
});

addCheck({
  id: "source-status-scope",
  area: "Trust",
  severity: "critical",
  pass:
    files.html.includes("proposal-sources") &&
    files.js.includes("originalSources") &&
    files.js.includes("sourceStatus") &&
    files.js.includes("dataStatus") &&
    files.js.includes("legalAdviceWarning"),
  evidence: "Source, data status, scope and legal warning are rendered.",
  recommendation: "Keep trust metadata visible without requiring a technical view."
});

addCheck({
  id: "agenda-source-links",
  area: "Trust",
  severity: "critical",
  pass:
    files.html.includes("agenda-meta") &&
    files.js.includes("renderAgendaMeta") &&
    files.js.includes("officialAgendaSourceUrl") &&
    files.js.includes("officialCitationUrl") &&
    files.js.includes("currentLawOriginalUrl") &&
    files.js.includes("proposedTextOriginalUrl"),
  evidence: "Agenda metadata and original source link fields are visible in the detail flow.",
  recommendation: "Keep agenda/citation/original text source states separate."
});

addCheck({
  id: "stable-legal-dates",
  area: "Trust",
  severity: "major",
  pass: files.js.includes('timeZone: "UTC"') && files.js.includes("formatDate"),
  evidence: "Legal update dates are formatted without local timezone day drift.",
  recommendation: "Keep date-only legal metadata stable across locales."
});

addCheck({
  id: "diff-original-sources",
  area: "Trust",
  severity: "critical",
  pass:
    files.js.includes("currentVersion.originalSource") &&
    files.js.includes("proposedVersion.originalSource") &&
    files.js.includes("Fuentes de este cambio"),
  evidence: "Each diff renders sources for current and proposed versions.",
  recommendation: "Every diff must expose both original source states."
});

addCheck({
  id: "pending-source-visible",
  area: "Trust",
  severity: "critical",
  pass: files.data.includes("Fuente original pendiente de carga") && files.js.includes("PENDING_SOURCE_TEXT"),
  evidence: "Missing original links are explicit and visible.",
  recommendation: "Never hide or invent missing original source links."
});

addCheck({
  id: "pending-diff-visible",
  area: "Trust",
  severity: "critical",
  pass:
    files.js.includes("Comparacion articulo por articulo pendiente de carga") &&
    files.js.includes("LexMapa no inventa diffs legales"),
  evidence: "The UI has an explicit empty state for proposals without loaded legal texts.",
  recommendation: "Do not show article-level comparisons until source texts are loaded."
});

addCheck({
  id: "diff-status-transparency",
  area: "Trust",
  severity: "critical",
  pass:
    files.js.includes("diffStatusSummary") &&
    files.js.includes("formatDiffPublicStatus") &&
    files.js.includes("validationWarnings") &&
    files.css.includes(".diff-warning-panel"),
  evidence: "Public proposal cards and diff cards expose validated, partial, assisted and unresolved states.",
  recommendation: "Never show an assisted or partial diff as if it were fully validated."
});

addCheck({
  id: "no-personalized-legal-advice",
  area: "Trust",
  severity: "critical",
  pass:
    files.data.includes("no brinda asesoramiento legal personalizado") &&
    !/en tu caso|debes hacer|tenes que hacer/i.test(files.html + files.js + files.data),
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
  id: "brief-how-to-read",
  area: "Comprehension",
  severity: "major",
  pass:
    ["Antes", "Despues", "Que cambia", "Que significa"].every((label) => files.html.includes(label)) &&
    files.html.includes("No reemplaza asesoramiento legal profesional"),
  evidence: "How-to-read section is brief and uses the four expected concepts.",
  recommendation: "Keep the explanation short, visual and useful."
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

addCheck({
  id: "remote-processor-status-page",
  area: "Operations",
  severity: "major",
  pass:
    files.opsHtml.includes("Estado operativo") &&
    files.opsHtml.includes("processor-list") &&
    files.opsHtml.includes("job-list") &&
    files.opsJs.includes("/processors/status") &&
    files.opsJs.includes("/processing-queue") &&
    files.opsJs.includes("/detected-projects") &&
    files.opsJs.includes("/processing-review") &&
    files.opsJs.includes("/processing-review/affected-items/resolve-current-sources") &&
    files.opsJs.includes("/processing-review/diffs/resolve") &&
    files.opsJs.includes("detectionEvidence") &&
    files.opsJs.includes("resolvedDiffs") &&
    files.opsJs.includes("No hay procesadores remotos registrados") &&
    files.opsHtml.includes("resolve-current-sources") &&
    files.opsHtml.includes("resolve-diff-candidates") &&
    files.opsHtml.includes("proyectos-detectados") &&
    files.opsHtml.includes("review-list") &&
    files.css.includes(".processor-card") &&
    files.css.includes(".job-card"),
  evidence: "A separate operational page can show processor heartbeats, queue status, staging projects and review cases without cluttering the public legal-diff home.",
  recommendation: "Keep protected actions token-gated and outside the public legal-diff UX."
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
