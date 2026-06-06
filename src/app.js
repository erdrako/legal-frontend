import {
  PENDING_SOURCE_TEXT,
  fallbackProposal,
  fallbackProposals,
  pendingOriginalSource
} from "./senate-agenda-fixtures.js";

const ALLOWED_VIEWS = new Set(["home", "resultados", "cambios", "cambio", "temas", "tema", "como-leer", "fuentes"]);
const DETAIL_TABS = new Set(["resumen", "comparacion", "fuentes", "estado"]);
const MAX_QUERY_LENGTH = 180;

const captureTarget = new URLSearchParams(window.location.search).get("capture");
if (captureTarget === "diff" || captureTarget === "search") {
  document.documentElement.classList.add(`capture-${captureTarget}`);
}

const recentChanges = [];

const topicCatalog = [
  {
    slug: "trabajo",
    label: "Trabajo",
    description: "Reformas laborales, despidos, indemnizaciones, periodo de prueba y registracion laboral."
  },
  {
    slug: "consumidores",
    label: "Consumidores",
    description: "Derechos al comprar, reclamos, garantias, informacion clara y trato digno."
  },
  {
    slug: "alquileres",
    label: "Alquileres",
    description: "Contratos, plazos, actualizaciones, garantias y reglas de vivienda."
  },
  {
    slug: "impuestos-y-monotributo",
    label: "Impuestos y monotributo",
    description: "Cambios tributarios, categorias, obligaciones y regimenes simplificados."
  },
  {
    slug: "jubilaciones",
    label: "Jubilaciones",
    description: "Movilidad, aportes, edad jubilatoria, beneficios y tramites previsionales."
  },
  {
    slug: "empresas-e-inversiones",
    label: "Empresas e inversiones",
    description: "Reglas para sociedades, incentivos, contratacion, inversiones y actividad economica."
  },
  {
    slug: "ambiente",
    label: "Ambiente",
    description: "Areas protegidas, recursos naturales, energia, pesca y politicas ambientales."
  },
  {
    slug: "energia",
    label: "Energia",
    description: "Combustibles, biocombustibles, tarifas, abastecimiento y regulacion sectorial."
  },
  {
    slug: "administracion-publica",
    label: "Administracion publica",
    description: "Organismos publicos, simplificacion normativa, transparencia y gestion estatal."
  }
];

const benefits = [
  {
    title: "Resumen simple",
    description: "Entende de que trata un cambio sin leer documentos extensos."
  },
  {
    title: "Antes vs despues",
    description: "Cuando los textos estan disponibles, compara que se modifica."
  },
  {
    title: "Fuente oficial",
    description: "Verifica de donde sale la informacion y cual es su estado de revision."
  }
];

const state = {
  apiBase: apiBaseFromRuntime(),
  proposals: fallbackProposals.map(toOverview),
  proposal: null,
  dataset: null,
  search: null,
  error: null,
  route: currentRoute()
};

const appRoot = document.getElementById("app-root");

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-search-form]");
  if (!form) {
    return;
  }

  event.preventDefault();
  const query = normalizeUserQuery(new FormData(form).get("q"));
  navigateTo("resultados", query ? { q: query } : {});
});

document.addEventListener("click", (event) => {
  const proposalButton = event.target.closest("[data-open-proposal]");
  if (proposalButton) {
    navigateTo("cambio", { id: proposalButton.dataset.openProposal, tab: "resumen" });
    return;
  }

  const viewLink = event.target.closest("[data-view]");
  if (viewLink) {
    event.preventDefault();
    navigateTo(viewLink.dataset.view);
    return;
  }

  const topicLink = event.target.closest("[data-topic-slug]");
  if (topicLink) {
    navigateTo("tema", { tema: topicLink.dataset.topicSlug });
    return;
  }

  const tabButton = event.target.closest("[data-tab]");
  if (tabButton) {
    navigateTo("cambio", { id: state.proposal?.id ?? state.route.params.id, tab: tabButton.dataset.tab });
  }
});

window.addEventListener("popstate", () => {
  state.route = currentRoute();
  renderRoute();
});

loadInitialData()
  .then(renderRoute)
  .catch((error) => {
    console.warn(error);
    state.error = "No se pudo conectar con la API. Se muestra informacion local de respaldo.";
    renderRoute();
  });

async function loadInitialData() {
  if (!state.apiBase) {
    state.proposals = fallbackProposals.map(toOverview);
    return;
  }

  const apiBase = state.apiBase.replace(/\/$/, "");
  const [proposalListResponse, datasetResponse] = await Promise.allSettled([
    fetch(`${apiBase}/change-proposals`),
    fetch(`${apiBase}/dataset/status`)
  ]);

  if (datasetResponse.status === "fulfilled" && datasetResponse.value.ok) {
    state.dataset = await datasetResponse.value.json();
  }

  if (proposalListResponse.status !== "fulfilled" || !proposalListResponse.value.ok) {
    throw new Error("Backend API did not return change proposals");
  }

  const listPayload = await proposalListResponse.value.json();
  state.proposals = listPayload.proposals.length > 0 ? listPayload.proposals : state.proposals;
}

async function renderRoute() {
  const { view, params } = state.route;
  document.body.dataset.view = view;
  document.getElementById("global-search-input").value = params.q ?? "";
  setActiveNav(view);

  if (view === "resultados") {
    await loadSearch(params.q ?? "");
  }

  if (view === "cambio") {
    await ensureProposal(params.id ?? state.proposals[0]?.id ?? fallbackProposal.id);
  }

  render();
  maybeScrollForCapture();
  appRoot.focus({ preventScroll: true });
}

function render() {
  const { view, params } = state.route;

  if (view === "resultados") {
    appRoot.innerHTML = renderSearchResults(params.q ?? "");
    return;
  }

  if (view === "cambios") {
    appRoot.innerHTML = renderChangesPage();
    return;
  }

  if (view === "cambio") {
    appRoot.innerHTML = state.proposal ? renderProposalDetail(state.proposal, activeTab()) : renderMissingProposal();
    return;
  }

  if (view === "temas") {
    appRoot.innerHTML = renderTopicsPage();
    return;
  }

  if (view === "tema") {
    appRoot.innerHTML = renderTopicDetail(params.tema);
    return;
  }

  if (view === "como-leer") {
    appRoot.innerHTML = renderHowToReadPage();
    return;
  }

  if (view === "fuentes") {
    appRoot.innerHTML = renderSourcesAndTrustPage();
    return;
  }

  appRoot.innerHTML = renderHomePage();
}

async function loadSearch(query) {
  const cleanQuery = normalizeUserQuery(query);
  if (!cleanQuery) {
    state.search = { query: "", proposals: [], items: [] };
    return;
  }

  if (!state.apiBase) {
    state.search = {
      query: cleanQuery,
      proposals: searchLocalProposals(cleanQuery),
      items: []
    };
    return;
  }

  try {
    const response = await fetch(`${state.apiBase.replace(/\/$/, "")}/search?q=${encodeURIComponent(cleanQuery)}`);
    if (!response.ok) {
      throw new Error(`Search API failed with HTTP ${response.status}`);
    }
    state.search = await response.json();
    state.error = state.search.itemsUnavailable?.error
      ? "La busqueda normativa esta limitada por el estado del dataset, pero los cambios en debate siguen disponibles."
      : null;
  } catch (error) {
    console.warn(error);
    state.error = "No se pudo completar la busqueda remota. Se muestra informacion local de respaldo.";
    state.search = {
      query: cleanQuery,
      proposals: searchLocalProposals(cleanQuery),
      items: []
    };
  }
}

async function ensureProposal(id) {
  const proposalId = String(id ?? "").trim();
  if (state.proposal?.id === proposalId) {
    return;
  }

  if (!state.apiBase) {
    state.proposal = findLocalProposal(proposalId) ?? fallbackProposal;
    return;
  }

  try {
    const response = await fetch(`${state.apiBase.replace(/\/$/, "")}/change-proposals/${encodeURIComponent(proposalId)}`);
    if (!response.ok) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }
    state.proposal = await response.json();
  } catch (error) {
    console.warn(error);
    state.proposal = findLocalProposal(proposalId) ?? null;
  }
}

function renderHomePage() {
  const featured = state.proposals.slice(0, 3);
  return `
    <section class="hero-section">
      <div class="hero-copy">
        <p class="eyebrow">Comprension legal simple</p>
        <h1>Entende que cambios legales se estan discutiendo, sin leer expedientes enteros.</h1>
        <p>LexMapa resume proyectos y modificaciones en lenguaje simple, muestra a quien podrian afectar y permite verificar la fuente oficial.</p>
        <p>El objetivo es reducir la distancia entre la informacion legal publica y las personas que necesitan entenderla, sin tener que conocer lenguaje juridico.</p>
      </div>
      ${renderSearchBox("Buscar ley, tema o proyecto... Ej: Ley Hojarasca, alquileres, biocombustibles", "Buscar cambios", "home-search-form")}
      <p class="search-note">No necesitas saber el numero de ley, expediente ni articulo.</p>
    </section>

    <section class="home-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Como ayuda</p>
          <h2>Informacion legal en capas</h2>
        </div>
      </div>
      <div class="benefit-grid">
        ${benefits.map(renderBenefitCard).join("")}
      </div>
    </section>

    <section class="home-section priority-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Agenda legislativa</p>
          <h2>Leyes en tratamiento</h2>
        </div>
        <a class="text-action" href="?view=cambios" data-view="cambios">Ver todas</a>
      </div>
      <div class="proposal-grid">
        ${featured.map((proposal) => renderProposalCard(proposal, "compact")).join("")}
      </div>
    </section>

    <section class="home-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Uso basico</p>
          <h2>Como usar LexMapa</h2>
        </div>
      </div>
      <div class="how-grid">
        ${renderStep("1", "Busca en simple", "Escribi una ley, un tema o una pregunta cotidiana.")}
        ${renderStep("2", "Lee el resumen", "Primero ves de que trata y a quien podria alcanzar.")}
        ${renderStep("3", "Verifica fuentes", "Despues podes revisar comparacion, fuentes y estado del dato.")}
      </div>
    </section>

    <section class="home-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Exploracion</p>
          <h2>Explorar por tema</h2>
        </div>
        <a class="text-action" href="?view=temas" data-view="temas">Ver temas</a>
      </div>
      <div class="topic-catalog">
        ${topicCatalog.slice(0, 6).map(renderTopicCard).join("")}
      </div>
    </section>

    ${renderDisclaimer()}
  `;
}

function renderSearchResults(query) {
  const cleanQuery = normalizeUserQuery(query);
  const results = state.search?.proposals ?? [];
  const direct = results.filter((proposal) => proposal.resultKind === "direct");
  const topic = results.filter((proposal) => proposal.resultKind === "topic");
  const related = results.filter((proposal) => !["direct", "topic"].includes(proposal.resultKind));
  const primary = direct[0];

  return `
    <section class="page-heading">
      <p class="eyebrow">Busqueda</p>
      <h1>${cleanQuery ? `Resultados para "${escapeHtml(cleanQuery)}"` : "Buscar en LexMapa"}</h1>
      <p>${searchIntroText(cleanQuery, primary, results)}</p>
      ${renderSearchBox("Buscar ley, tema o proyecto...", "Buscar", "results-search-form", cleanQuery)}
      ${state.error ? `<p class="warning-text">${escapeHtml(state.error)}</p>` : ""}
    </section>

    ${
      !cleanQuery
        ? renderSearchSuggestions()
        : results.length === 0
          ? renderNoSearchResults(cleanQuery)
          : `
            ${primary ? renderResultSection("Resultado principal", [primary], "primary") : ""}
            ${topic.length ? renderResultSection("Temas relacionados", topic, "topic") : ""}
            ${related.length ? renderResultSection(primary ? "Tambien puede interesarte" : "Resultados relacionados", related, "related") : ""}
          `
    }
  `;
}

function renderChangesPage() {
  return `
    <section class="page-heading">
      <p class="eyebrow">Agenda legislativa</p>
      <h1>Leyes en tratamiento</h1>
      <p>Proyectos detectados en fuentes oficiales. Algunos tienen comparacion disponible y otros muestran pendientes de forma explicita.</p>
    </section>

    <section class="home-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Listado</p>
          <h2>${state.proposals.length} cambios cargados</h2>
        </div>
      </div>
      <div class="proposal-grid">
        ${state.proposals.map((proposal) => renderProposalCard(proposal, "standard")).join("")}
      </div>
    </section>

    ${renderRecentChangesSection()}
  `;
}

function renderTopicsPage() {
  return `
    <section class="page-heading">
      <p class="eyebrow">Explorar</p>
      <h1>Temas</h1>
      <p>Usa temas cuando no sabes que ley buscar. Cada tema muestra cambios relacionados si estan cargados.</p>
    </section>

    <section class="home-section">
      <div class="topic-catalog">
        ${topicCatalog.map(renderTopicCard).join("")}
      </div>
    </section>
  `;
}

function renderTopicDetail(topicSlug) {
  const topic = topicBySlug(topicSlug) ?? topicCatalog[0];
  const proposals = state.proposals.filter((proposal) =>
    (proposal.affectedTopics ?? []).some((label) => normalize(label).includes(normalize(topic.label)) || normalize(topic.label).includes(normalize(label)))
  );

  return `
    <section class="page-heading">
      <p class="eyebrow">Tema</p>
      <h1>${escapeHtml(topic.label)}</h1>
      <p>${escapeHtml(topic.description)}</p>
    </section>

    <section class="home-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cambios relacionados</p>
          <h2>${proposals.length ? `${proposals.length} cargados` : "Sin cambios cargados"}</h2>
        </div>
      </div>
      ${
        proposals.length
          ? `<div class="proposal-grid">${proposals.map((proposal) => renderProposalCard(proposal, "standard")).join("")}</div>`
          : `<div class="empty-state"><strong>Todavia no hay cambios cargados para este tema.</strong><p>Podes explorar otros temas o buscar por palabra clave.</p></div>`
      }
    </section>
  `;
}

function renderProposalDetail(proposal, tab) {
  return `
    <section class="detail-shell">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Detalle de cambio legal</p>
          <h1>${escapeHtml(proposal.title)}</h1>
          <p>${escapeHtml(proposal.plainLanguageSummary ?? proposal.summary.short)}</p>
        </div>
        <div class="status-stack">
          <span class="status-pill">${escapeHtml(proposal.statusLabelForUsers ?? formatStatus(proposal.status))}</span>
          <span class="status-pill muted">${formatChamber(proposal.chamber)}</span>
          <span class="status-pill muted">${formatDate(proposal.updatedAt)}</span>
        </div>
      </div>

      <nav class="tabs" aria-label="Secciones del cambio">
        ${renderTabButton("resumen", "Resumen", tab)}
        ${renderTabButton("comparacion", "Comparacion", tab)}
        ${renderTabButton("fuentes", "Fuentes", tab)}
        ${renderTabButton("estado", "Estado del dato", tab)}
      </nav>

      <section class="tab-panel">
        ${renderDetailTab(proposal, tab)}
      </section>
    </section>
  `;
}

function renderDetailTab(proposal, tab) {
  if (tab === "comparacion") {
    return renderComparisonTab(proposal);
  }
  if (tab === "fuentes") {
    return renderSourcesTab(proposal);
  }
  if (tab === "estado") {
    return renderDataStatusTab(proposal);
  }
  return renderSummaryTab(proposal);
}

function renderSummaryTab(proposal) {
  return `
    <div class="summary-layout">
      <section class="panel highlight-panel">
        <div class="panel-header">
          <h2>En simple</h2>
          <span class="panel-note">No tecnico</span>
        </div>
        <p>${escapeHtml(proposal.plainLanguageSummary ?? proposal.summary.short)}</p>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Que cambiaria</h2>
        </div>
        <ul class="plain-list">
          ${(proposal.summary.keyPoints ?? []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Quienes podrian verse alcanzados</h2>
        </div>
        <div class="impact-list">
          ${(proposal.affectedGroups ?? []).map(renderGroupImpact).join("")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Estado actual</h2>
        </div>
        <div class="agenda-meta">
          ${renderMetaItem("Camara", formatChamber(proposal.chamber))}
          ${renderMetaItem("Fecha de tratamiento", formatDateTime(proposal.scheduledTreatmentDate))}
          ${renderMetaItem("Comisiones", (proposal.committees ?? []).join(" + ") || "Sin comisiones cargadas")}
          ${renderMetaItem("Estado", proposal.statusLabelForUsers ?? formatStatus(proposal.status))}
        </div>
      </section>

      <div class="action-row">
        <button class="primary-action" type="button" data-tab="comparacion">Ver comparacion</button>
        <button class="secondary-action" type="button" data-tab="fuentes">Ver fuentes</button>
      </div>
    </div>
  `;
}

function renderComparisonTab(proposal) {
  if (!proposal.diffs?.length) {
    return `
      <div class="empty-state diff-pending-state">
        <strong>Comparacion articulo por articulo pendiente de carga</strong>
        <p>LexMapa no inventa diffs legales. Necesita confirmar el texto vigente y el texto propuesto antes de mostrar un antes/despues confiable.</p>
        <ul class="plain-list">
          <li>Falta confirmar texto vigente original.</li>
          <li>Falta confirmar texto propuesto completo.</li>
          <li>Falta relacion articulo por articulo.</li>
        </ul>
        <div class="action-row">
          <button class="secondary-action" type="button" data-tab="fuentes">Ver fuentes disponibles</button>
          <button class="secondary-action" type="button" data-tab="resumen">Volver al resumen</button>
        </div>
      </div>
    `;
  }

  const summary = summarizeDiffs(proposal.diffs);
  return `
    <section class="panel">
      <div class="panel-header">
        <h2>Comparacion</h2>
        <span class="panel-note">${proposal.diffs.length} cambios detectados</span>
      </div>
      <div class="metric-row compact-metrics">
        ${renderMetric("Validados", summary.validated)}
        ${renderMetric("Parciales", summary.partial)}
        ${renderMetric("Asistidos", summary.assisted)}
        ${renderMetric("No resueltos", summary.unresolved)}
      </div>
    </section>
    <div class="diff-list">
      ${proposal.diffs.map((diff, index) => renderDiffAccordion(proposal, diff, index)).join("")}
    </div>
  `;
}

function renderDiffAccordion(proposal, item, index) {
  const topicById = new Map((proposal.topics ?? []).map((topic) => [topic.id, topic.label]));
  const groupById = new Map((proposal.affectedGroups ?? []).map((group) => [group.id, group.label]));
  const topics = (item.affectedTopicIds ?? []).map((id) => topicById.get(id) ?? id);
  const groups = (item.affectedGroupIds ?? []).map((id) => groupById.get(id) ?? id);
  const open = index === 0 ? " open" : "";

  return `
    <details class="diff-accordion"${open} id="diff-${escapeHtml(item.id)}">
      <summary>
        <span>Cambio ${index + 1}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <em>${escapeHtml(formatChangeType(item.changeType))}</em>
      </summary>
      <article class="diff-card">
        <div class="badge-row left">
          ${item.publicStatus ? `<span class="status-pill warning">${escapeHtml(formatDiffPublicStatus(item.publicStatus))}</span>` : ""}
          ${item.remoteAssisted ? '<span class="status-pill warning">Asistido por procesador remoto</span>' : ""}
          <span class="change-badge ${String(item.changeType ?? "MODIFIED").toLowerCase()}">${formatChangeType(item.changeType)}</span>
        </div>

        <div class="meta-row">
          <span>${escapeHtml(item.currentVersion?.legalItemTitle ?? "Norma afectada pendiente")}</span>
          <span>${escapeHtml(item.currentVersion?.provisionLabel ?? "Articulo pendiente")}</span>
          ${topics.map((topic) => `<span>${escapeHtml(topic)}</span>`).join("")}
          ${groups.map((group) => `<span>${escapeHtml(group)}</span>`).join("")}
        </div>

        <div class="legal-compare">
          ${renderLegalTextPanel("current", item.currentVersion, "Texto vigente completo")}
          ${renderLegalTextPanel("proposed", item.proposedVersion, "Texto propuesto completo")}
        </div>

        <div class="trust-split">
          <div>
            <span>Explicacion simple</span>
            <p>${escapeHtml(item.explanationPlainLanguage)}</p>
          </div>
          <div>
            <span>Impacto orientativo</span>
            <p>${escapeHtml(item.practicalImpact)}</p>
          </div>
        </div>

        ${renderDiffWarnings(item)}

        <div class="diff-sources">
          <strong>Fuentes de este cambio</strong>
          <div class="source-links">
            ${renderOriginalSource(item.currentVersion?.originalSource, "Ver texto vigente original")}
            ${renderOriginalSource(item.proposedVersion?.originalSource, "Ver texto propuesto original")}
          </div>
        </div>
      </article>
    </details>
  `;
}

function renderSourcesTab(proposal) {
  const sources = proposal.originalSources ?? {
    current: pendingOriginalSource("Texto vigente original"),
    proposed: pendingOriginalSource("Texto propuesto original")
  };
  const sourceLinks = proposal.sourceLinks ?? {};

  return `
    <section class="panel">
      <div class="panel-header">
        <h2>Fuentes oficiales</h2>
        <span class="panel-note">Trazabilidad</span>
      </div>
      <div class="source-links">
        ${renderSourceUrl(sourceLinks.officialAgendaSourceUrl, "Ver agenda oficial")}
        ${renderSourceUrl(sourceLinks.officialCitationUrl, "Ver expediente oficial")}
        ${sourceLinks.currentLawOriginalUrl ? renderSourceUrl(sourceLinks.currentLawOriginalUrl, "Ver texto vigente original") : renderOriginalSource(sources.current, "Ver texto vigente original")}
        ${sourceLinks.proposedTextOriginalUrl ? renderSourceUrl(sourceLinks.proposedTextOriginalUrl, "Ver texto propuesto original") : renderOriginalSource(sources.proposed, "Ver texto propuesto original")}
        ${renderAdditionalSourceUrls(sourceLinks.proposedTextOriginalUrls, sourceLinks.proposedTextOriginalUrl)}
      </div>
    </section>
  `;
}

function renderDataStatusTab(proposal) {
  const warnings = unique((proposal.diffs ?? []).flatMap((diff) => diff.validationWarnings ?? []));
  const summary = summarizeDiffs(proposal.diffs ?? []);
  return `
    <section class="panel">
      <div class="panel-header">
        <h2>Estado del dato</h2>
        <span class="panel-note">Transparencia</span>
      </div>
      <div class="agenda-meta">
        ${renderMetaItem("Estado del dato", formatDataStatus(proposal.dataStatus))}
        ${renderMetaItem("Estado de fuentes", formatSourceStatus(proposal.sourceStatus))}
        ${renderMetaItem("Ultima actualizacion", formatDate(proposal.updatedAt))}
        ${renderMetaItem("Alcance", proposal.scopeNote ?? "Alcance pendiente")}
      </div>
    </section>
    <section class="panel">
      <div class="panel-header">
        <h2>Confianza de comparacion</h2>
      </div>
      <div class="metric-row compact-metrics">
        ${renderMetric("Validados", summary.validated)}
        ${renderMetric("Parciales", summary.partial)}
        ${renderMetric("Asistidos", summary.assisted)}
        ${renderMetric("No resueltos", summary.unresolved)}
      </div>
      <div class="diff-warning-panel">
        <strong>Advertencias</strong>
        <p>${warnings.length ? escapeHtml(warnings.join(", ")) : "Sin advertencias criticas cargadas."}</p>
      </div>
      <p class="disclaimer">${escapeHtml(proposal.legalAdviceWarning ?? "LexMapa no brinda asesoramiento legal personalizado.")}</p>
    </section>
  `;
}

function renderHowToReadPage() {
  return `
    <section class="page-heading">
      <p class="eyebrow">Guia</p>
      <h1>Como leer LexMapa</h1>
      <p>LexMapa muestra informacion legal en capas. Primero ves un resumen simple. Despues podes revisar fuentes, estado del dato y comparacion articulo por articulo cuando este disponible.</p>
    </section>
    <section class="home-section">
      <div class="how-grid">
        ${renderStep("1", "Texto vigente", "Lo que dice una norma actualmente.")}
        ${renderStep("2", "Texto propuesto", "Lo que un proyecto intenta agregar, cambiar o eliminar.")}
        ${renderStep("3", "Comparacion", "Vista que muestra el antes y despues entre el texto vigente y el propuesto.")}
        ${renderStep("4", "Estado del dato", "Indica si la informacion esta validada, parcial, pendiente o necesita revision.")}
      </div>
    </section>
    ${renderDisclaimer()}
  `;
}

function renderSourcesAndTrustPage() {
  return `
    <section class="page-heading">
      <p class="eyebrow">Trazabilidad</p>
      <h1>Fuentes y confianza</h1>
      <p>LexMapa prioriza la trazabilidad. Cuando una fuente no esta disponible o no fue validada, la interfaz debe mostrarlo explicitamente.</p>
    </section>
    <section class="home-section">
      <div class="trust-grid">
        ${renderTrustCard("Fuente oficial", "Documento, expediente, agenda o publicacion de un organismo oficial.")}
        ${renderTrustCard("Fuente pendiente", "LexMapa todavia no tiene cargada o verificada esa fuente.")}
        ${renderTrustCard("Validado", "Comparacion resuelta contra fuente oficial, todavia sujeta a revision legal del producto.")}
        ${renderTrustCard("Asistido", "Procesado automaticamente o con ayuda remota; requiere revision adicional.")}
      </div>
    </section>
    ${renderDisclaimer()}
  `;
}

function renderRecentChangesSection() {
  return `
    <section class="home-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Aprobadas o publicadas</p>
          <h2>Leyes tratadas</h2>
        </div>
      </div>
      ${
        recentChanges.length
          ? `<div class="recent-list">${recentChanges.map((change) => `<article class="recent-card"><h3>${escapeHtml(change.title)}</h3><p>${escapeHtml(change.summary)}</p></article>`).join("")}</div>`
          : `<div class="empty-state"><strong>Todavia no hay cambios recientes cargados.</strong><p>Cuando haya normas aprobadas o publicadas, apareceran aca con acceso a su explicacion y comparacion, si esta disponible.</p></div>`
      }
    </section>
  `;
}

function renderResultSection(title, proposals, variant) {
  return `
    <section class="home-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${variant === "primary" ? "Coincidencia fuerte" : "Orientacion"}</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
      </div>
      <div class="proposal-grid">
        ${proposals.map((proposal) => renderProposalCard(proposal, variant)).join("")}
      </div>
    </section>
  `;
}

function renderProposalCard(proposal, variant = "standard") {
  const topics = proposal.affectedTopics ?? [];
  const groups = proposal.affectedGroups ?? [];
  const label = searchKindLabel(proposal.resultKind, variant);
  return `
    <article class="proposal-card ${variant === "primary" ? "primary-result" : ""}">
      <div class="card-topline">
        ${label ? `<span class="status-pill">${escapeHtml(label)}</span>` : ""}
        <span class="status-pill muted">${escapeHtml(proposal.statusLabelForUsers ?? formatStatus(proposal.status))}</span>
        <span class="status-pill muted">${formatChamber(proposal.chamber)}</span>
      </div>
      <h3>${escapeHtml(proposal.title)}</h3>
      <p>${escapeHtml(proposal.summaryPlainLanguage)}</p>
      ${proposal.resultKind && proposal.resultKind !== "direct" ? `<p class="small-muted">Este resultado puede estar relacionado por tema, grupo afectado o palabras clave. No se presenta como coincidencia exacta.</p>` : ""}
      <div class="mini-list">
        <strong>Podria afectar a</strong>
        <span>${groups.length ? escapeHtml(groups.slice(0, 4).join(" / ")) : "Grupos pendientes de clasificacion"}</span>
      </div>
      <div class="mini-list">
        <strong>Temas</strong>
        <span>${topics.length ? escapeHtml(topics.slice(0, 4).join(" / ")) : "Temas pendientes de clasificacion"}</span>
      </div>
      ${renderProposalProgress(proposal)}
      <button class="primary-action" type="button" data-open-proposal="${escapeHtml(proposal.id)}">Ver explicacion simple</button>
    </article>
  `;
}

function renderProposalProgress(proposal) {
  const summary = proposal.diffStatusSummary;
  if (!summary) {
    return `
      <div class="mini-list">
        <strong>Comparacion</strong>
        <span>${Number(proposal.diffCount ?? 0)} cambios cargados. Estado: ${escapeHtml(formatSourceStatus(proposal.sourceStatus))}</span>
      </div>
    `;
  }

  return `
    <div class="mini-list">
      <strong>Comparacion</strong>
      <span>${Number(summary.validated ?? 0)} validados | ${Number(summary.partial ?? 0)} parciales | ${Number(summary.assisted ?? 0)} asistidos | ${Number(summary.unresolved ?? 0)} no resueltos</span>
    </div>
  `;
}

function renderBenefitCard(item) {
  return `
    <article class="benefit-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </article>
  `;
}

function renderTopicCard(topic) {
  const count = state.proposals.filter((proposal) =>
    (proposal.affectedTopics ?? []).some((label) => normalize(label).includes(normalize(topic.label)) || normalize(topic.label).includes(normalize(label)))
  ).length;
  return `
    <article class="topic-card">
      <h3>${escapeHtml(topic.label)}</h3>
      <p>${escapeHtml(topic.description)}</p>
      <button class="secondary-action" type="button" data-topic-slug="${escapeHtml(topic.slug)}">Explorar tema${count ? ` (${count})` : ""}</button>
    </article>
  `;
}

function renderStep(number, title, text) {
  return `
    <article>
      <span>${escapeHtml(number)}</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(text)}</p>
    </article>
  `;
}

function renderTrustCard(title, text) {
  return `
    <article class="benefit-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(text)}</p>
    </article>
  `;
}

function renderSearchBox(placeholder, buttonLabel, id, value = "") {
  return `
    <form class="search-form" id="${escapeHtml(id)}" data-search-form>
      <label class="sr-only" for="${escapeHtml(id)}-input">Buscar ley, tema o proyecto</label>
      <input id="${escapeHtml(id)}-input" name="q" autocomplete="off" maxlength="180" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}">
      <button type="submit">${escapeHtml(buttonLabel)}</button>
    </form>
  `;
}

function renderSearchSuggestions() {
  return `
    <section class="home-section">
      <div class="empty-state">
        <strong>Busca una ley, tema o proyecto.</strong>
        <p>Tambien podes explorar leyes en tratamiento o temas disponibles.</p>
        <div class="action-row">
          <a class="secondary-action link-action" href="?view=cambios" data-view="cambios">Explorar leyes en tratamiento</a>
          <a class="secondary-action link-action" href="?view=temas" data-view="temas">Explorar por tema</a>
        </div>
      </div>
    </section>
  `;
}

function renderNoSearchResults(query) {
  return `
    <section class="home-section">
      <div class="empty-state">
        <strong>No encontramos resultados para "${escapeHtml(query)}".</strong>
        <p>Proba con una palabra mas general, un tema relacionado o el nombre comun del proyecto.</p>
        <div class="action-row">
          <a class="secondary-action link-action" href="?view=cambios" data-view="cambios">Explorar leyes en tratamiento</a>
          <a class="secondary-action link-action" href="?view=temas" data-view="temas">Explorar por tema</a>
          <a class="secondary-action link-action" href="?view=como-leer" data-view="como-leer">Ver como buscar</a>
        </div>
      </div>
    </section>
  `;
}

function renderMissingProposal() {
  return `
    <section class="page-heading">
      <p class="eyebrow">Detalle</p>
      <h1>No encontramos este cambio</h1>
      <p>El identificador no coincide con un cambio cargado.</p>
      <a class="secondary-action link-action" href="?view=cambios" data-view="cambios">Volver a leyes en tratamiento</a>
    </section>
  `;
}

function renderLegalTextPanel(kind, version, ariaLabel) {
  return `
    <section class="legal-text ${escapeHtml(kind)}">
      <div class="legal-text-header">
        <strong>${escapeHtml(version?.label ?? "Texto pendiente")}</strong>
        <span>${escapeHtml(version?.provisionLabel ?? "")}</span>
      </div>
      <div class="legal-text-body" tabindex="0" aria-label="${escapeHtml(ariaLabel)}">
        <p>${escapeHtml(version?.text ?? "Texto pendiente de carga.")}</p>
      </div>
    </section>
  `;
}

function renderDiffWarnings(item) {
  const warnings = item.validationWarnings ?? [];
  if (!item.publicStatus && warnings.length === 0 && !item.confidence) {
    return "";
  }

  return `
    <div class="diff-warning-panel">
      <strong>Estado de confianza</strong>
      <p>${escapeHtml(formatDiffPublicStatus(item.publicStatus))}${item.confidence ? ` | Confianza: ${escapeHtml(item.confidence)}` : ""}</p>
      ${warnings.length ? `<p>Advertencias: ${escapeHtml(warnings.join(", "))}</p>` : "<p>Sin advertencias criticas cargadas.</p>"}
    </div>
  `;
}

function renderOriginalSource(source, label) {
  if (source?.status === "LOADED" && source.sourceUrl) {
    return `
      <a class="source-link loaded" href="${escapeHtml(source.sourceUrl)}" target="_blank" rel="noreferrer">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(source.name ?? source.label ?? "Fuente original")}</strong>
      </a>
    `;
  }

  return `
    <div class="source-link pending">
      <span>${escapeHtml(label)}</span>
      <strong>${PENDING_SOURCE_TEXT}</strong>
    </div>
  `;
}

function renderSourceUrl(url, label) {
  if (!url) {
    return `
      <div class="source-link pending">
        <span>${escapeHtml(label)}</span>
        <strong>Fuente pendiente de carga o verificacion</strong>
      </div>
    `;
  }

  return `
    <a class="source-link loaded" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">
      <span>${escapeHtml(label)}</span>
      <strong>Fuente oficial</strong>
    </a>
  `;
}

function renderAdditionalSourceUrls(sourceList, primaryUrl) {
  if (!Array.isArray(sourceList)) {
    return "";
  }

  return sourceList
    .filter((source) => source?.url && source.url !== primaryUrl)
    .map((source) => renderSourceUrl(source.url, source.label ?? "Ver texto propuesto original adicional"))
    .join("");
}

function renderGroupImpact(group) {
  return `
    <article class="impact-item">
      <strong>${escapeHtml(group.label)}</strong>
      <p>${escapeHtml(group.impactSummary)}</p>
    </article>
  `;
}

function renderMetaItem(label, value) {
  return `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderMetric(label, value) {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${Number(value ?? 0)}</strong>
    </article>
  `;
}

function renderTabButton(id, label, active) {
  return `
    <button class="tab-button" type="button" data-tab="${escapeHtml(id)}" aria-selected="${active === id ? "true" : "false"}">
      ${escapeHtml(label)}
    </button>
  `;
}

function renderDisclaimer() {
  return `
    <section class="home-section quiet-section">
      <p class="disclaimer">LexMapa no brinda asesoramiento legal personalizado. La informacion es orientativa y debe verificarse contra las fuentes oficiales.</p>
    </section>
  `;
}

function searchIntroText(query, primary, results) {
  if (!query) {
    return "Escribi una busqueda para encontrar leyes en tratamiento, temas o proyectos.";
  }
  if (primary) {
    return `Encontramos un resultado principal para "${query}".`;
  }
  if (results.length) {
    return `No encontramos un resultado exacto para "${query}", pero hay temas o cambios que podrian estar relacionados.`;
  }
  return `No encontramos resultados para "${query}".`;
}

function searchKindLabel(kind, variant) {
  if (variant === "primary" || kind === "direct") {
    return "Resultado principal";
  }
  if (kind === "topic") {
    return "Tema relacionado";
  }
  if (kind === "source") {
    return "Fuente relacionada";
  }
  if (kind === "related") {
    return "Relacionado";
  }
  return "";
}

function summarizeDiffs(diffs) {
  return {
    validated: diffs.filter((diff) => diff.publicStatus === "DIFF_VALIDATED").length,
    partial: diffs.filter((diff) => diff.publicStatus === "DIFF_PARTIAL").length,
    assisted: diffs.filter((diff) => diff.publicStatus === "DIFF_AI_ASSISTED").length,
    unresolved: diffs.filter((diff) => diff.publicStatus === "DIFF_UNRESOLVED").length
  };
}

function currentRoute() {
  const params = new URLSearchParams(window.location.search);
  let view = params.get("view") ?? "home";
  if (captureTarget === "diff" && !params.get("view")) {
    view = "cambio";
  }
  if (!ALLOWED_VIEWS.has(view)) {
    view = "home";
  }
  return {
    view,
    params: {
      q: normalizeUserQuery(params.get("q")),
      id: params.get("id")?.slice(0, 220) ?? "",
      tema: params.get("tema")?.slice(0, 80) ?? "",
      tab: params.get("tab")?.slice(0, 40) ?? "",
      api: params.get("api") ?? "",
      capture: params.get("capture") ?? ""
    }
  };
}

function navigateTo(view, params = {}) {
  if (!ALLOWED_VIEWS.has(view)) {
    view = "home";
  }
  const next = new URLSearchParams();
  next.set("view", view);
  const current = new URLSearchParams(window.location.search);
  if (current.get("api")) {
    next.set("api", current.get("api"));
  }
  if (current.get("capture")) {
    next.set("capture", current.get("capture"));
  }
  for (const [key, value] of Object.entries(params)) {
    const clean = String(value ?? "").trim();
    if (clean) {
      next.set(key, clean);
    }
  }
  history.pushState({}, "", `${window.location.pathname}?${next.toString()}`);
  state.route = currentRoute();
  renderRoute();
}

function activeTab() {
  const tab = state.route.params.tab || "resumen";
  return DETAIL_TABS.has(tab) ? tab : "resumen";
}

function setActiveNav(view) {
  document.querySelectorAll("[data-view]").forEach((link) => {
    link.toggleAttribute("aria-current", link.dataset.view === view);
  });
}

function topicBySlug(slug) {
  const normalized = String(slug ?? "").trim();
  return topicCatalog.find((topic) => topic.slug === normalized);
}

function searchableText(proposal) {
  return [
    proposal.title,
    proposal.chamber,
    proposal.statusLabelForUsers,
    proposal.officialDescription,
    proposal.plainLanguageSummary,
    ...(proposal.committees ?? []),
    proposal.summary?.headline,
    proposal.summary?.short,
    ...(proposal.summary?.keyPoints ?? []),
    ...(proposal.summary?.whatItMeans ?? []),
    ...(proposal.queryExamples ?? []),
    ...(proposal.topics ?? []).flatMap((topic) => [topic.label, topic.summaryPlainLanguage]),
    ...(proposal.affectedGroups ?? []).flatMap((group) => [group.label, group.impactSummary]),
    ...(proposal.diffs ?? []).flatMap((item) => [
      item.title,
      item.changeType,
      item.explanationPlainLanguage,
      item.practicalImpact,
      item.currentVersion?.text,
      item.proposedVersion?.text
    ])
  ].join(" ");
}

function buildLocalSearchResult(query, proposal) {
  const normalizedQuery = normalize(query);
  const terms = queryTerms(query);
  const proposalText = normalize(searchableText(proposal));
  const matchesProposal =
    (normalizedQuery && proposalText.includes(normalizedQuery)) ||
    terms.some((term) => textIncludesTerm(proposalText, term));

  if (!matchesProposal) {
    return null;
  }

  const focusedTerms = terms.filter((term) => !GENERIC_PROPOSAL_TERMS.has(term));
  const matchedTopicIds = (proposal.topics ?? [])
    .filter((topic) => textMatchesTerms([topic.label, topic.summaryPlainLanguage].join(" "), focusedTerms))
    .map((topic) => topic.id);
  const matchedGroupIds = (proposal.affectedGroups ?? [])
    .filter((group) => textMatchesTerms(group.label, focusedTerms))
    .map((group) => group.id);
  const directDiffIds = (proposal.diffs ?? [])
    .filter((item) =>
      textMatchesTerms(
        [
          item.title,
          item.changeType,
          item.explanationPlainLanguage,
          item.practicalImpact,
          item.currentVersion?.text,
          item.proposedVersion?.text
        ].join(" "),
        focusedTerms
      )
    )
    .map((item) => item.id);
  const matchedDiffIds = unique([
    ...directDiffIds,
    ...(proposal.diffs ?? [])
      .filter((item) => (item.affectedTopicIds ?? []).some((id) => matchedTopicIds.includes(id)))
      .map((item) => item.id),
    ...(proposal.diffs ?? [])
      .filter((item) => (item.affectedGroupIds ?? []).some((id) => matchedGroupIds.includes(id)))
      .map((item) => item.id)
  ]);

  return {
    ...toOverview(proposal),
    resultKind: localResultKind(proposal, normalizedQuery, matchedDiffIds, matchedTopicIds, matchedGroupIds),
    matchedDiffIds,
    matchedTopicIds,
    matchedGroupIds,
    matchSummary: "Encontramos una propuesta relacionada con tu busqueda. Revisa el resumen y las fuentes originales."
  };
}

function localResultKind(proposal, normalizedQuery, matchedDiffIds, matchedTopicIds, matchedGroupIds) {
  const title = normalize(proposal.title);
  if (normalizedQuery && title.includes(normalizedQuery)) {
    return "direct";
  }
  if (matchedTopicIds.length > 0 && matchedDiffIds.length === 0 && matchedGroupIds.length === 0) {
    return "topic";
  }
  return "related";
}

function searchLocalProposals(query) {
  return fallbackProposals
    .map((proposal) => buildLocalSearchResult(query, proposal))
    .filter(Boolean);
}

function findLocalProposal(id) {
  return fallbackProposals.find((proposal) => proposal.id === id) ?? null;
}

function textMatchesTerms(text, terms) {
  const normalizedText = normalize(text);
  return terms.some((term) => textIncludesTerm(normalizedText, term));
}

function textIncludesTerm(normalizedText, term) {
  return termVariants(term).some((variant) => normalizedText.includes(variant));
}

function queryTerms(query) {
  return unique(
    normalize(query)
      .split(/[^a-z0-9]+/g)
      .map((term) => term.trim())
      .filter((term) => term.length > 2 && !STOP_WORDS.has(term))
  );
}

function termVariants(term) {
  const variants = [term];
  if (term.endsWith("ciones") && term.length > 8) {
    variants.push(`${term.slice(0, -6)}cion`);
  }
  if (term.endsWith("es") && term.length > 5) {
    variants.push(term.slice(0, -2));
  }
  if (term.endsWith("s") && term.length > 4) {
    variants.push(term.slice(0, -1));
  }
  return unique(variants);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function toOverview(proposal) {
  return {
    id: proposal.id,
    title: proposal.title,
    status: proposal.status,
    chamber: proposal.chamber,
    statusLabelForUsers: proposal.statusLabelForUsers,
    scheduledTreatmentDate: proposal.scheduledTreatmentDate,
    committees: proposal.committees,
    summaryPlainLanguage: proposal.plainLanguageSummary ?? proposal.summary.short,
    affectedTopics: proposal.topics.map((topic) => topic.label),
    affectedGroups: proposal.affectedGroups.map((group) => group.label),
    diffCount: proposal.diffs.length,
    dataStatus: proposal.dataStatus,
    dataKind: proposal.dataKind,
    priority: proposal.priority,
    sourceStatus: proposal.sourceStatus,
    sourceLinks: proposal.sourceLinks,
    source: proposal.source
  };
}

function maybeScrollForCapture() {
  if (captureTarget !== "diff") {
    return;
  }

  window.setTimeout(() => {
    document.querySelector(".diff-list")?.scrollIntoView({ block: "start" });
  }, 100);
}

function apiBaseFromRuntime() {
  return new URLSearchParams(window.location.search).get("api") || window.LEXMAPA_CONFIG?.apiBaseUrl || "";
}

function normalizeUserQuery(value) {
  return String(value ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

function formatStatus(value) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatChangeType(value) {
  const labels = {
    ADDED: "Agregado",
    REMOVED: "Eliminado",
    MODIFIED: "Modificado"
  };
  return labels[value] ?? formatStatus(value);
}

function formatChamber(value) {
  const labels = {
    SENATE: "Senado",
    DEPUTIES: "Diputados"
  };
  return labels[value] ?? "Camara pendiente";
}

function formatDateTime(value) {
  if (!value) {
    return "Sin fecha";
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires"
  }).format(new Date(value));
}

function formatSourceStatus(value) {
  const labels = {
    LOADED: "Fuente cargada",
    PENDING: "Fuente pendiente",
    NEEDS_REVIEW: "Fuente pendiente de revision"
  };
  return labels[value] ?? "Estado pendiente";
}

function formatDataStatus(value) {
  const labels = {
    REAL_AGENDA_ITEM: "Dato real de agenda oficial",
    MANUAL_FIXTURE: "Fixture manual",
    TRUSTED_SOURCE: "Fuente confiable",
    NEEDS_LEGAL_REVIEW: "Pendiente de revision legal",
    HUMAN_REVIEWED: "Revisado por persona",
    PRODUCTION_APPROVED: "Aprobado para produccion"
  };
  return labels[value] ?? "Estado pendiente";
}

function formatDiffPublicStatus(value) {
  const labels = {
    DIFF_VALIDATED: "Comparacion validada",
    DIFF_PARTIAL: "Comparacion parcial",
    DIFF_AI_ASSISTED: "Comparacion asistida",
    DIFF_UNRESOLVED: "Comparacion no resuelta"
  };
  return labels[value] ?? "Comparacion pendiente";
}

function formatDate(value) {
  if (!value) {
    return "Sin fecha";
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(new Date(value));
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const STOP_WORDS = new Set(["con", "del", "las", "los", "pasa", "para", "por", "que", "una", "uno"]);
const GENERIC_PROPOSAL_TERMS = new Set(["cambia", "cambio", "cambios", "legal", "laboral", "ley", "reforma"]);
