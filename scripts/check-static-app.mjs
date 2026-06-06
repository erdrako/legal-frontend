import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const opsHtml = readFileSync("ops.html", "utf8");
const js = readFileSync("src/app.js", "utf8");
const opsJs = readFileSync("src/ops.js", "utf8");
const data = readFileSync("src/senate-agenda-fixtures.js", "utf8");
const css = readFileSync("src/styles.css", "utf8");
const config = readFileSync("config.js", "utf8");

assert(html.includes("LexMapa"), "index.html must include product name");
assert(html.includes("global-search-form"), "index.html must include global search form");
assert(html.includes("app-root"), "index.html must expose the SPA mount point");
assert(html.includes("config.js"), "index.html must load runtime config");
assert(html.includes('data-view="home"'), "index.html must expose home navigation");
assert(html.includes('data-view="cambios"'), "index.html must expose laws-in-treatment navigation");
assert(html.includes('data-view="temas"'), "index.html must expose topic navigation");
assert(html.includes('data-view="como-leer"'), "index.html must expose how-to-read navigation");
assert(html.includes('data-view="fuentes"'), "index.html must expose source/trust navigation");
assert(!html.includes("query-examples"), "index.html must not include quick-access query chips");
assert(!html.includes("Normas importantes"), "index.html must not expose arbitrary important-norms section");

assert(js.includes("ALLOWED_VIEWS"), "app.js must whitelist simulated views");
assert(js.includes("DETAIL_TABS"), "app.js must whitelist detail tabs");
assert(js.includes("MAX_QUERY_LENGTH"), "app.js must limit user query length");
assert(js.includes("normalizeUserQuery"), "app.js must normalize search params");
assert(js.includes("loadInitialData"), "app.js must support API-backed data loading");
assert(js.includes("change-proposals"), "app.js must load change proposals from API");
assert(js.includes("/search?q="), "app.js must call backend search endpoint");
assert(js.includes("resultKind"), "app.js must use backend search classification");
assert(js.includes("senate-agenda-fixtures"), "app.js must keep public seed data out of UI logic");
assert(js.includes("renderHomePage"), "app.js must render the new public home");
assert(js.includes("renderSearchResults"), "app.js must render search results as a separate view");
assert(js.includes("renderChangesPage"), "app.js must render laws in treatment as a separate view");
assert(js.includes("renderTopicsPage"), "app.js must render topics as a separate view");
assert(js.includes("renderProposalDetail"), "app.js must render proposal detail as a separate view");
assert(js.includes("renderHowToReadPage"), "app.js must render how-to-read as a separate view");
assert(js.includes("renderSourcesAndTrustPage"), "app.js must render source/trust guidance");
assert(js.includes("renderTabButton"), "app.js must use tabs for detail sections");
assert(js.includes("renderDiffAccordion"), "app.js must use accordions for individual diffs");
assert(js.includes("legal-text-body"), "app.js must wrap legal text in scrollable bodies");
assert(js.includes("matchedDiffIds"), "app.js must preserve query-aware local matching");
assert(js.includes('timeZone: "UTC"'), "app.js must avoid timezone drift for legal update dates");
assert(js.includes("legalAdviceWarning"), "app.js must show legal advice warning");
assert(data.includes("Fuente original pendiente de carga") && js.includes("PENDING_SOURCE_TEXT"), "app.js must show missing original source state");
assert(js.includes("originalSource"), "app.js must render original sources");
assert(js.includes("Comparacion articulo por articulo pendiente de carga"), "app.js must show pending diff state");
assert(js.includes("LexMapa no inventa diffs legales"), "app.js must be transparent when diffs are pending");
assert(js.includes("diffStatusSummary"), "app.js must show diff status summary for staging proposals");
assert(js.includes("formatDiffPublicStatus"), "app.js must render visible diff trust states");
assert(js.includes("Fuente pendiente de carga o verificacion"), "app.js must expose missing source states");
assert(!js.includes("reforma-laboral-mvp-2026"), "app.js must not expose the old test proposal");
assert(!js.includes("Normas importantes"), "app.js must not expose arbitrary important-norms section");

assert(data.includes("REAL_AGENDA_ITEM"), "fixture data must use real agenda item state");
assert(data.includes("ley-hojarasca"), "fixture data must include imported Ley Hojarasca agenda item");
assert(data.includes("biocombustibles"), "fixture data must include imported biocombustibles agenda item");
assert(data.includes("parque-marino-monte-leon"), "fixture data must include imported Parque Marino Monte Leon agenda item");
assert(data.includes("proposedTextOriginalUrls"), "fixture data must expose all linked proposed texts when grouped");
assert(data.includes("officialAgendaSourceUrl"), "fixture data must expose official agenda source URLs");
assert(!data.includes("super-rigi"), "fixture data must not expose Diputados items during Senate vertical slice");
assert(!data.includes("diputados.gob.ar"), "fixture data must not depend on Diputados during Senate vertical slice");

assert(config.includes("LEXMAPA_CONFIG"), "config.js must define runtime config");
assert(css.includes(".workspace"), "styles.css must include workspace styles");
assert(css.includes(".tabs") && css.includes(".tab-button"), "styles.css must style detail tabs");
assert(css.includes(".diff-accordion"), "styles.css must style diff accordions");
assert(css.includes(".legal-compare"), "styles.css must include side-by-side diff styles");
assert(css.includes(".legal-text-body") && css.includes("overflow: auto"), "styles.css must constrain long legal text blocks with internal scrolling");
assert(css.includes(".benefit-grid") && css.includes(".trust-grid"), "styles.css must style the lighter public views");
assert(css.includes(".agenda-meta"), "styles.css must style agenda metadata");
assert(css.includes(".diff-warning-panel"), "styles.css must style visible diff warnings");
assert(css.includes("@media"), "styles.css must include responsive rules");

assert(opsHtml.includes("Estado operativo"), "ops.html must expose operational status page");
assert(opsHtml.includes("processor-list") && opsHtml.includes("job-list"), "ops.html must include processor and queue containers");
assert(opsHtml.includes("proyectos-detectados") && opsHtml.includes("review-list"), "ops.html must include detected projects and review sections");
assert(opsHtml.includes("admin-token"), "ops.html must include local admin token input for protected actions");
assert(opsHtml.includes("resolve-current-sources"), "ops.html must expose protected current source resolution action");
assert(opsHtml.includes("resolve-diff-candidates"), "ops.html must expose protected diff resolution action");
assert(opsHtml.includes("config.js"), "ops.html must load runtime config");
assert(opsJs.includes("/processors/status"), "ops.js must load processor status from API");
assert(opsJs.includes("/processing-queue"), "ops.js must load processing queue from API");
assert(opsJs.includes("/detected-projects"), "ops.js must load detected projects from API");
assert(opsJs.includes("/processing-review"), "ops.js must load review state from API");
assert(opsJs.includes("/retry"), "ops.js must support protected job retry action");
assert(opsJs.includes("/processing-review/affected-items/resolve-current-sources"), "ops.js must support protected current source resolution");
assert(opsJs.includes("/processing-review/diffs/resolve"), "ops.js must support protected diff resolution");
assert(opsJs.includes("detectionEvidence"), "ops.js must render affected legal item evidence");
assert(opsJs.includes("resolvedDiffs"), "ops.js must render resolved diff cases");
assert(opsJs.includes("No hay procesadores remotos registrados"), "ops.js must show empty processor state");
assert(css.includes(".processor-card") && css.includes(".job-card"), "styles.css must style operational status cards");

console.log("Static app checks passed.");

function assert(condition, message) {
  if (!condition) {
    console.error(`Static app check failed: ${message}`);
    process.exit(1);
  }
}
