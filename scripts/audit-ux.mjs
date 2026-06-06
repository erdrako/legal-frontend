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
  id: "layered-public-navigation",
  area: "Information architecture",
  severity: "critical",
  pass:
    files.html.includes("app-root") &&
    files.html.includes("global-search-form") &&
    files.html.includes('data-view="home"') &&
    files.html.includes('data-view="cambios"') &&
    files.html.includes('data-view="temas"') &&
    files.html.includes('data-view="como-leer"') &&
    files.html.includes('data-view="fuentes"') &&
    files.js.includes("ALLOWED_VIEWS"),
  evidence: "The public product is organized as small simulated views instead of a single dense page.",
  recommendation: "Keep the navigation split into home, results, laws in treatment, topics, detail, how-to-read and sources."
});

addCheck({
  id: "simple-language-search",
  area: "Discovery",
  severity: "critical",
  pass:
    files.html.includes("global-search-form") &&
    files.js.includes("renderSearchResults") &&
    files.js.includes("/search?q=") &&
    files.js.includes("resultKind"),
  evidence: "Search is a first-class flow and relies on backend result classification.",
  recommendation: "Keep search centered on plain-language queries and avoid frontend-only semantic guessing."
});

addCheck({
  id: "safe-route-and-query-handling",
  area: "Security",
  severity: "critical",
  pass:
    files.js.includes("MAX_QUERY_LENGTH") &&
    files.js.includes("normalizeUserQuery") &&
    files.js.includes("encodeURIComponent") &&
    files.js.includes("ALLOWED_VIEWS") &&
    files.js.includes("DETAIL_TABS") &&
    files.js.includes("escapeHtml"),
  evidence: "User-provided view, tab, id and query values are whitelisted, bounded or escaped before rendering or API calls.",
  recommendation: "Keep route and query validation explicit as new views are added."
});

addCheck({
  id: "no-quick-access-chips",
  area: "Discovery",
  severity: "critical",
  pass: !files.html.includes("query-examples") && !files.html.includes("query-chip") && !files.js.includes("renderQueryExamples"),
  evidence: "Home does not render shortcut chips below the search box.",
  recommendation: "Organize discovery through views and sections, not highlighted shortcuts."
});

addCheck({
  id: "neutral-public-taxonomy",
  area: "Information architecture",
  severity: "critical",
  pass:
    files.js.includes("Leyes en tratamiento") &&
    files.js.includes("Leyes tratadas") &&
    !files.html.includes("Normas importantes") &&
    !files.js.includes("Normas importantes"),
  evidence: "The UI uses neutral terms and removes the arbitrary important-norms section.",
  recommendation: "Avoid ranking legal materials as important unless a governed criterion is approved."
});

addCheck({
  id: "home-stays-light",
  area: "Comprehension",
  severity: "major",
  pass:
    files.js.includes("renderHomePage") &&
    files.js.includes("Informacion legal en capas") &&
    files.js.includes("benefit-grid") &&
    files.js.includes("topicCatalog.slice(0, 6)") &&
    files.js.includes("Ver todas"),
  evidence: "The home introduces the product and sends users to separate views for deeper reading.",
  recommendation: "Do not move dense legal comparisons back onto the home page."
});

addCheck({
  id: "detail-tabs",
  area: "Comparison",
  severity: "critical",
  pass:
    files.js.includes("renderTabButton") &&
    files.js.includes("resumen") &&
    files.js.includes("comparacion") &&
    files.js.includes("fuentes") &&
    files.js.includes("estado") &&
    files.css.includes(".tabs") &&
    files.css.includes(".tab-button"),
  evidence: "Proposal detail is split into summary, comparison, sources and data status tabs.",
  recommendation: "Use tabs for peer-level detail sections so the user chooses depth intentionally."
});

addCheck({
  id: "diffs-use-accordions",
  area: "Comparison",
  severity: "critical",
  pass:
    files.js.includes("<details class=\"diff-accordion\"") &&
    files.js.includes("<summary>") &&
    files.css.includes(".diff-accordion") &&
    files.css.includes(".diff-accordion[open]"),
  evidence: "Individual article-level diffs are collapsed into accordions.",
  recommendation: "Keep individual diff units expandable so long legal text does not dominate the page."
});

addCheck({
  id: "bounded-legal-text-panels",
  area: "Comparison",
  severity: "critical",
  pass:
    files.js.includes("legal-text-body") &&
    files.css.includes(".legal-text-body") &&
    files.css.includes("overflow: auto") &&
    files.css.includes("scrollbar-gutter") &&
    files.css.includes("overscroll-behavior"),
  evidence: "Long current/proposed legal texts are constrained inside internal scroll panels.",
  recommendation: "Keep original legal text available without turning detail pages into endless scrolling."
});

addCheck({
  id: "summary-before-comparison",
  area: "Comprehension",
  severity: "critical",
  pass:
    files.js.includes("return renderSummaryTab(proposal);") &&
    files.js.includes("const tab = state.route.params.tab || \"resumen\"") &&
    files.js.includes("En simple"),
  evidence: "The default detail tab gives a plain-language summary before comparison.",
  recommendation: "Do not lead non-legal users directly into dense legal text."
});

addCheck({
  id: "plain-explanation-per-change",
  area: "Comprehension",
  severity: "critical",
  pass:
    files.js.includes("Explicacion simple") &&
    files.js.includes("Impacto orientativo") &&
    files.js.includes("practicalImpact"),
  evidence: "Every loaded diff keeps what-changes and what-it-means explanations visible.",
  recommendation: "Keep simple explanation separate from original text and source blocks."
});

addCheck({
  id: "original-sources-visible",
  area: "Trust",
  severity: "critical",
  pass:
    files.js.includes("Fuentes de este cambio") &&
    files.js.includes("renderSourcesTab") &&
    files.js.includes("originalSource") &&
    files.js.includes("currentLawOriginalUrl") &&
    files.js.includes("proposedTextOriginalUrl") &&
    files.js.includes("officialAgendaSourceUrl"),
  evidence: "Proposal and diff views expose agenda, current text and proposed text source states.",
  recommendation: "Never hide source state behind interpretation."
});

addCheck({
  id: "pending-source-visible",
  area: "Trust",
  severity: "critical",
  pass: files.data.includes("Fuente original pendiente de carga") && files.js.includes("PENDING_SOURCE_TEXT"),
  evidence: "Missing original links are explicit and visible.",
  recommendation: "Keep pending source states visible instead of inventing links."
});

addCheck({
  id: "pending-diff-visible",
  area: "Trust",
  severity: "critical",
  pass:
    files.js.includes("Comparacion articulo por articulo pendiente de carga") &&
    files.js.includes("LexMapa no inventa diffs legales"),
  evidence: "The UI has an explicit empty state for proposals without loaded legal texts.",
  recommendation: "Show pending comparison states transparently and keep source blocks accessible."
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
  id: "real-senate-agenda-items",
  area: "Data trust",
  severity: "critical",
  pass:
    files.data.includes("REAL_AGENDA_ITEM") &&
    files.data.includes("ley-hojarasca") &&
    files.data.includes("biocombustibles") &&
    files.data.includes("parque-marino-monte-leon") &&
    files.data.includes("officialAgendaSourceUrl") &&
    !files.data.includes("super-rigi") &&
    !files.data.includes("diputados.gob.ar") &&
    !files.data.includes("reforma-laboral-mvp-2026"),
  evidence: "The productive public seed uses official Senate agenda items and no fictional or Diputados data in this vertical slice.",
  recommendation: "Keep demo/test data out of the public product."
});

addCheck({
  id: "recent-empty-state",
  area: "Information architecture",
  severity: "major",
  pass: files.js.includes("Todavia no hay cambios recientes cargados"),
  evidence: "Already-treated laws have an honest empty state instead of invented data.",
  recommendation: "Keep empty states explicit while datasets are incomplete."
});

addCheck({
  id: "no-personalized-legal-advice",
  area: "Trust",
  severity: "critical",
  pass:
    files.data.includes("no brinda asesoramiento legal personalizado") &&
    files.js.includes("LexMapa no brinda asesoramiento legal personalizado") &&
    !/en tu caso|debes hacer|tenes que hacer/i.test(files.html + files.js + files.data),
  evidence: "The interface warns that it is not personalized legal advice.",
  recommendation: "Avoid imperative advice for individual legal situations."
});

addCheck({
  id: "accessibility-basics",
  area: "Accessibility",
  severity: "major",
  pass:
    files.html.includes('<html lang="es">') &&
    files.html.includes('aria-label="Navegacion principal"') &&
    files.html.includes('class="sr-only"') &&
    files.html.includes('tabindex="-1"') &&
    files.js.includes("aria-selected"),
  evidence: "The shell has language, landmarks, hidden labels, focus target and tab states.",
  recommendation: "Keep accessible labels and focus management explicit as views grow."
});

addCheck({
  id: "brief-how-to-read",
  area: "Comprehension",
  severity: "major",
  pass:
    files.js.includes("Texto vigente") &&
    files.js.includes("Texto propuesto") &&
    files.js.includes("Comparacion") &&
    files.js.includes("Estado del dato") &&
    files.js.includes("renderHowToReadPage"),
  evidence: "How-to-read is a brief visual guide rather than a dense explanation.",
  recommendation: "Keep the guide short and focused on reading the interface."
});

addCheck({
  id: "responsive-layout",
  area: "Responsive",
  severity: "major",
  pass:
    countMatches(files.css, /@media/g) >= 2 &&
    files.css.includes(".legal-compare") &&
    files.css.includes("grid-template-columns: 1fr") &&
    files.css.includes(".header-search"),
  evidence: "CSS defines responsive breakpoints, collapses dense grids and accounts for the global search.",
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
  evidence: "The operational page remains separate from the public legal-diff UX.",
  recommendation: "Keep protected actions token-gated and outside the public reading flow."
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
