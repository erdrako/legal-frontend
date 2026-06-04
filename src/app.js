import {
  PENDING_SOURCE_TEXT,
  fallbackProposal,
  fallbackProposals,
  pendingOriginalSource
} from "./senate-agenda-fixtures.js";

const captureTarget = new URLSearchParams(window.location.search).get("capture");

if (captureTarget === "diff" || captureTarget === "search") {
  document.documentElement.classList.add(`capture-${captureTarget}`);
}

const recentChanges = [];

const topicCatalog = [
  {
    label: "Trabajo",
    description: "Reformas laborales, despidos, indemnizaciones, periodo de prueba y registracion laboral."
  },
  {
    label: "Consumidores",
    description: "Derechos al comprar, reclamos, garantias, informacion clara y trato digno."
  },
  {
    label: "Alquileres",
    description: "Contratos, plazos, actualizaciones, garantias y reglas de vivienda."
  },
  {
    label: "Impuestos y monotributo",
    description: "Cambios tributarios, categorias, obligaciones y regimenes simplificados."
  },
  {
    label: "Jubilaciones",
    description: "Movilidad, aportes, edad jubilatoria, beneficios y tramites previsionales."
  },
  {
    label: "Empresas e inversiones",
    description: "Reglas para sociedades, incentivos, contratacion, inversiones y actividad economica."
  }
];

const importantNorms = [
  {
    title: "Constitucion Nacional",
    description: "Derechos, garantias y organizacion del Estado.",
    topics: ["Derechos", "Poderes del Estado", "Garantias"]
  },
  {
    title: "Ley de Contrato de Trabajo",
    description: "Reglas base para relaciones laborales, derechos y obligaciones.",
    topics: ["Trabajo", "Despidos", "Registracion"]
  },
  {
    title: "Ley de Defensa del Consumidor",
    description: "Proteccion para personas que compran bienes o contratan servicios.",
    topics: ["Consumidores", "Garantias", "Reclamos"]
  },
  {
    title: "Codigo Civil y Comercial",
    description: "Reglas centrales sobre contratos, familia, bienes, responsabilidad y derechos civiles.",
    topics: ["Contratos", "Familia", "Propiedad"]
  }
];

const state = {
  apiBase: apiBaseFromRuntime(),
  proposals: fallbackProposals.map(toOverview),
  proposal: fallbackProposal,
  dataset: null,
  error: null,
  searchContext: null
};

document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = new FormData(event.currentTarget).get("q").toString().trim();
  runSearch(query);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-proposal]");

  if (!button) {
    return;
  }

  openProposal(button.dataset.openProposal);
});

const initialQuery = initialQueryFromUrl();

if (initialQuery) {
  document.getElementById("search-input").value = initialQuery;
}

loadInitialData()
  .then(() => {
    if (initialQuery) {
      return runSearch(initialQuery);
    }

    render();
  })
  .catch((error) => {
    console.warn(error);
    state.error = "No se pudo conectar con la API. Se muestra el fixture local.";
    render();
  });

async function loadInitialData() {
  if (!state.apiBase) {
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
  await loadProposalDetail(state.proposals[0]?.id ?? fallbackProposal.id);
}

async function runSearch(query) {
  if (!query) {
    state.proposal = fallbackProposal;
    state.proposals = fallbackProposals.map(toOverview);
    state.searchContext = null;
    render();
    scrollToDetail();
    return;
  }

  if (!state.apiBase) {
    const localResults = searchLocalProposals(query);
    const localSearchResult = localResults[0];
    const proposal = localSearchResult ? findLocalProposal(localSearchResult.id) : null;
    state.proposals = localResults;
    state.proposal = proposal;
    state.searchContext = localSearchResult && proposal ? buildSearchContext(query, localSearchResult, proposal) : null;
    render();
    scrollToRelevantResult();
    return;
  }

  try {
    const apiBase = state.apiBase.replace(/\/$/, "");
    const response = await fetch(`${apiBase}/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error("Search API failed");
    }

    const payload = await response.json();
    state.proposals = payload.proposals.length > 0 ? payload.proposals : fallbackProposals.map(toOverview);

    if (payload.proposals.length === 0) {
      state.proposal = null;
      state.searchContext = null;
      render();
      scrollToDetail();
      return;
    }

    const firstResult = payload.proposals[0];
    await loadProposalDetail(firstResult.id);
    state.searchContext = buildSearchContext(query, firstResult, state.proposal);
    state.error = payload.itemsUnavailable?.error
      ? "La busqueda normativa esta limitada por el estado del dataset, pero la comparacion MVP esta disponible."
      : null;
  } catch (error) {
    console.warn(error);
    state.error = "No se pudo completar la busqueda remota. Se muestra el fixture local.";
    const localResults = searchLocalProposals(query);
    const localSearchResult = localResults[0];
    const proposal = localSearchResult ? findLocalProposal(localSearchResult.id) : null;
    state.proposals = localResults;
    state.proposal = proposal;
    state.searchContext = localSearchResult && proposal ? buildSearchContext(query, localSearchResult, proposal) : null;
  }

  render();
  scrollToRelevantResult();
}

async function openProposal(id) {
  await loadProposalDetail(id);
  state.searchContext = null;
  render();
  scrollToDetail();
}

async function loadProposalDetail(id) {
  if (!state.apiBase) {
    state.proposal = findLocalProposal(id);
    return;
  }

  const response = await fetch(`${state.apiBase.replace(/\/$/, "")}/change-proposals/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error(`Proposal not found: ${id}`);
  }

  state.proposal = await response.json();
}

function render() {
  renderDebateSection();
  renderRecentSection();
  renderTopicCatalog();
  renderImportantNorms();

  if (!state.proposal) {
    renderEmptyDetail();
    maybeScrollForCapture();
    return;
  }

  renderDetail(state.proposal);
  maybeScrollForCapture();
}

function renderDebateSection() {
  const proposals = state.proposals.length > 0 ? state.proposals : fallbackProposals.map(toOverview);
  setText("debate-count", `${proposals.length} cargado${proposals.length === 1 ? "" : "s"}`);

  document.getElementById("debate-list").innerHTML = proposals
    .map((proposal) => {
      const topics = proposal.affectedTopics ?? [];
      const groups = proposal.affectedGroups ?? [];
      const sourceName = proposal.source?.name ?? "Fuente no cargada";

      return `
        <article class="proposal-card">
          <div class="card-topline">
            <span class="status-pill">${escapeHtml(proposal.statusLabelForUsers ?? formatStatus(proposal.status))}</span>
            <span class="status-pill muted">${formatChamber(proposal.chamber)}</span>
            <span class="small-muted">${escapeHtml(sourceName)}</span>
          </div>
          <h3>${escapeHtml(proposal.title)}</h3>
          <p>${escapeHtml(proposal.summaryPlainLanguage)}</p>
          <div class="mini-list">
            <strong>Tratamiento previsto</strong>
            <span>${formatDateTime(proposal.scheduledTreatmentDate)} - ${escapeHtml((proposal.committees ?? []).join(" + "))}</span>
          </div>
          <div class="mini-list">
            <strong>Temas afectados</strong>
            <span>${topics.length > 0 ? escapeHtml(topics.join(", ")) : "Sin temas cargados"}</span>
          </div>
          <div class="mini-list">
            <strong>Grupos afectados</strong>
            <span>${groups.length > 0 ? escapeHtml(groups.join(", ")) : "Sin grupos cargados"}</span>
          </div>
          ${renderProposalProgress(proposal)}
          <button class="primary-action" type="button" data-open-proposal="${escapeHtml(proposal.id)}">Entender cambios</button>
        </article>
      `;
    })
    .join("");
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

function renderRecentSection() {
  const container = document.getElementById("recent-list");

  if (recentChanges.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No hay cambios recientes cargados todavia</strong>
        <p>Cuando haya normas aprobadas o publicadas, apareceran aca con acceso a la comparacion antes/despues.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = recentChanges
    .map(
      (change) => `
        <article class="recent-card">
          <h3>${escapeHtml(change.title)}</h3>
          <p>${escapeHtml(change.summary)}</p>
          <button class="secondary-action" type="button" data-open-proposal="${escapeHtml(change.proposalId)}">Ver antes y despues</button>
        </article>
      `
    )
    .join("");
}

function renderTopicCatalog() {
  document.getElementById("topic-catalog").innerHTML = topicCatalog
    .map(
      (topic) => `
        <article class="topic-card">
          <h3>${escapeHtml(topic.label)}</h3>
          <p>${escapeHtml(topic.description)}</p>
          <span>Explorar tema</span>
        </article>
      `
    )
    .join("");
}

function renderImportantNorms() {
  document.getElementById("norm-list").innerHTML = importantNorms
    .map(
      (norm) => `
        <article class="norm-item">
          <div>
            <h3>${escapeHtml(norm.title)}</h3>
            <p>${escapeHtml(norm.description)}</p>
          </div>
          <span>${escapeHtml(norm.topics.join(" / "))}</span>
        </article>
      `
    )
    .join("");
}

function renderDetail(proposal) {
  setText("detail-title", proposal.title);
  setText("detail-summary", proposal.plainLanguageSummary ?? proposal.summary.short);
  setText("detail-status", `Estado: ${proposal.statusLabelForUsers ?? formatStatus(proposal.status)}`);
  setText("detail-type", `Camara: ${formatChamber(proposal.chamber)}`);
  setText("detail-updated", `Actualizado: ${formatDate(proposal.updatedAt)}`);
  setText("topic-count", `${proposal.topics.length} temas`);
  setText("group-count", `${proposal.affectedGroups.length} grupos`);
  setText("diff-count", `${proposal.diffs.length} cambios`);

  renderSearchAnswer(proposal);
  renderAgendaMeta(proposal);
  renderList("detail-key-points", proposal.summary.keyPoints);
  renderProposalSources(proposal);
  renderTopics(proposal.topics);
  renderGroups(proposal.affectedGroups);
  renderList("main-changes", proposal.summary.keyPoints);
  renderDiffs(proposal);
}

function renderSearchAnswer(proposal) {
  const panel = document.getElementById("search-answer-panel");
  const context = state.searchContext;

  if (!context || context.proposalId !== proposal.id) {
    panel.hidden = true;
    setText("search-answer-query", "");
    setText("search-answer-text", "");
    return;
  }

  panel.hidden = false;
  setText("search-answer-query", context.query);
  setText("search-answer-text", context.matchSummary);
}

function renderAgendaMeta(proposal) {
  document.getElementById("agenda-meta").innerHTML = `
    <div>
      <span>Camara</span>
      <strong>${formatChamber(proposal.chamber)}</strong>
    </div>
    <div>
      <span>Fecha de tratamiento</span>
      <strong>${formatDateTime(proposal.scheduledTreatmentDate)}</strong>
    </div>
    <div>
      <span>Comisiones</span>
      <strong>${escapeHtml((proposal.committees ?? []).join(" + "))}</strong>
    </div>
    <div>
      <span>Descripcion oficial</span>
      <strong>${escapeHtml(proposal.officialDescription ?? "Descripcion oficial pendiente")}</strong>
    </div>
  `;
}

function renderProposalSources(proposal) {
  const sources = proposal.originalSources ?? {
    current: pendingOriginalSource("Texto vigente original"),
    proposed: pendingOriginalSource("Texto propuesto original")
  };
  const sourceLinks = proposal.sourceLinks ?? {};

  document.getElementById("proposal-sources").innerHTML = `
    ${renderSourceUrl(sourceLinks.officialAgendaSourceUrl, "Ver agenda oficial")}
    ${renderSourceUrl(sourceLinks.officialCitationUrl, "Ver expediente oficial")}
    ${sourceLinks.currentLawOriginalUrl ? renderSourceUrl(sourceLinks.currentLawOriginalUrl, "Ver texto vigente original") : renderOriginalSource(sources.current, "Ver texto vigente original")}
    ${sourceLinks.proposedTextOriginalUrl ? renderSourceUrl(sourceLinks.proposedTextOriginalUrl, "Ver texto propuesto original") : renderOriginalSource(sources.proposed, "Ver texto propuesto original")}
    ${renderAdditionalSourceUrls(sourceLinks.proposedTextOriginalUrls, sourceLinks.proposedTextOriginalUrl)}
    <div class="source-context">
      <span>Fuente principal</span>
      <strong>${escapeHtml(proposal.source?.name ?? "Sin fuente principal")}</strong>
    </div>
    <div class="source-context">
      <span>Estado de fuentes</span>
      <strong>${escapeHtml(formatSourceStatus(proposal.sourceStatus))}</strong>
    </div>
    <div class="source-context">
      <span>Estado del dato</span>
      <strong>${escapeHtml(formatDataStatus(proposal.dataStatus))}</strong>
    </div>
    <div class="source-context">
      <span>Alcance</span>
      <strong>${escapeHtml(proposal.scopeNote ?? "Alcance pendiente de carga")}</strong>
    </div>
    <div class="source-context">
      <span>Advertencia</span>
      <strong>${escapeHtml(proposal.legalAdviceWarning ?? "LexMapa no brinda asesoramiento legal personalizado.")}</strong>
    </div>
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

function renderTopics(topics) {
  document.getElementById("topics-list").innerHTML = topics
    .map(
      (topic) => `
        <article class="impact-item">
          <strong>${escapeHtml(topic.label)}</strong>
          <p>${escapeHtml(topic.summaryPlainLanguage)}</p>
        </article>
      `
    )
    .join("");
}

function renderGroups(groups) {
  document.getElementById("groups-list").innerHTML = groups
    .map(
      (group) => `
        <article class="impact-item">
          <strong>${escapeHtml(group.label)}</strong>
          <p>${escapeHtml(group.impactSummary)}</p>
        </article>
      `
    )
    .join("");
}

function renderList(id, values) {
  document.getElementById(id).innerHTML = values.map((value) => `<li>${escapeHtml(value)}</li>`).join("");
}

function renderDiffs(proposal) {
  if (proposal.diffs.length === 0) {
    document.getElementById("diff-list").innerHTML = `
      <div class="empty-state diff-pending-state">
        <strong>Comparacion articulo por articulo pendiente de carga</strong>
        <p>LexMapa no inventa diffs legales. Cuando se carguen los textos vigente y propuesto originales, esta seccion mostrara el antes y despues con fuente.</p>
      </div>
    `;
    return;
  }

  const topicById = new Map(proposal.topics.map((topic) => [topic.id, topic.label]));
  const groupById = new Map(proposal.affectedGroups.map((group) => [group.id, group.label]));
  const matchedDiffIds = new Set(
    state.searchContext?.proposalId === proposal.id ? state.searchContext.matchedDiffIds : []
  );

  document.getElementById("diff-list").innerHTML = proposal.diffs
    .map((item, index) => {
      const topics = item.affectedTopicIds.map((id) => topicById.get(id) ?? id);
      const groups = item.affectedGroupIds.map((id) => groupById.get(id) ?? id);
      const isMatched = matchedDiffIds.has(item.id);

      return `
        <article class="diff-card${isMatched ? " matched-diff" : ""}" id="diff-${escapeHtml(item.id)}">
          <div class="diff-heading">
            <div>
              <span class="diff-index">Cambio ${index + 1}</span>
              <h3>${escapeHtml(item.title)}</h3>
            </div>
            <div class="badge-row">
              ${isMatched ? '<span class="match-pill">Coincide con tu busqueda</span>' : ""}
              ${item.publicStatus ? `<span class="status-pill warning">${escapeHtml(formatDiffPublicStatus(item.publicStatus))}</span>` : ""}
              ${item.remoteAssisted ? '<span class="status-pill warning">Asistido por procesador remoto</span>' : ""}
              <span class="change-badge ${item.changeType.toLowerCase()}">${formatChangeType(item.changeType)}</span>
            </div>
          </div>

          <div class="meta-row">
            <span>${escapeHtml(item.currentVersion.legalItemTitle ?? "Norma afectada pendiente")}</span>
            <span>${escapeHtml(item.currentVersion.provisionLabel ?? "Articulo pendiente")}</span>
            ${topics.map((topic) => `<span>${escapeHtml(topic)}</span>`).join("")}
            ${groups.map((group) => `<span>${escapeHtml(group)}</span>`).join("")}
          </div>

          <div class="legal-compare">
            <section class="legal-text current">
              <div class="legal-text-header">
                <strong>${escapeHtml(item.currentVersion.label)}</strong>
                <span>${escapeHtml(item.currentVersion.provisionLabel ?? "")}</span>
              </div>
              <div class="legal-text-body" tabindex="0" aria-label="Texto vigente completo">
                <p>${escapeHtml(item.currentVersion.text)}</p>
              </div>
            </section>

            <section class="legal-text proposed">
              <div class="legal-text-header">
                <strong>${escapeHtml(item.proposedVersion.label)}</strong>
                <span>${escapeHtml(item.proposedVersion.provisionLabel ?? "")}</span>
              </div>
              <div class="legal-text-body" tabindex="0" aria-label="Texto propuesto completo">
                <p>${escapeHtml(item.proposedVersion.text)}</p>
              </div>
            </section>
          </div>

          <div class="trust-split">
            <div>
              <span>Explicacion simple</span>
              <p>${escapeHtml(item.explanationPlainLanguage)}</p>
            </div>
            <div>
              <span>Interpretacion orientativa</span>
              <p>${escapeHtml(item.practicalImpact)}</p>
            </div>
          </div>

          ${renderDiffWarnings(item)}

          <div class="diff-sources">
            <strong>Fuentes de este cambio</strong>
            <div class="source-links">
              ${renderOriginalSource(item.currentVersion.originalSource, "Ver texto vigente original")}
              ${renderOriginalSource(item.proposedVersion.originalSource, "Ver texto propuesto original")}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
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
        <strong>${PENDING_SOURCE_TEXT}</strong>
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

function renderEmptyDetail() {
  setText("detail-title", "Sin resultados");
  setText("detail-summary", "No encontramos un cambio legal cargado para esa busqueda.");
  setText("detail-status", "Estado: sin dato");
  setText("detail-type", "Tipo: sin dato");
  setText("detail-updated", "Actualizado: sin dato");
  document.getElementById("search-answer-panel").hidden = true;
  setText("search-answer-query", "");
  setText("search-answer-text", "");
  document.getElementById("agenda-meta").innerHTML = "";
  setText("topic-count", "0 temas");
  setText("group-count", "0 grupos");
  setText("diff-count", "0 cambios");
  document.getElementById("detail-key-points").innerHTML = "";
  document.getElementById("proposal-sources").innerHTML = `<div class="source-link pending"><strong>${PENDING_SOURCE_TEXT}</strong></div>`;
  document.getElementById("topics-list").innerHTML = "";
  document.getElementById("groups-list").innerHTML = "";
  document.getElementById("main-changes").innerHTML = "";
  document.getElementById("diff-list").innerHTML = "";
}

function searchableText(proposal) {
  return [
    proposal.title,
    proposal.chamber,
    proposal.statusLabelForUsers,
    proposal.officialDescription,
    proposal.plainLanguageSummary,
    ...(proposal.committees ?? []),
    proposal.summary.headline,
    proposal.summary.short,
    ...proposal.summary.keyPoints,
    ...proposal.summary.whatItMeans,
    ...proposal.queryExamples,
    ...proposal.topics.flatMap((topic) => [topic.label, topic.summaryPlainLanguage]),
    ...proposal.affectedGroups.flatMap((group) => [group.label, group.impactSummary]),
    ...proposal.diffs.flatMap((item) => [
      item.title,
      item.changeType,
      item.explanationPlainLanguage,
      item.practicalImpact,
      item.currentVersion.text,
      item.proposedVersion.text
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
  const matchedTopicIds = proposal.topics
    .filter((topic) => textMatchesTerms([topic.label, topic.summaryPlainLanguage].join(" "), focusedTerms))
    .map((topic) => topic.id);
  const matchedGroupIds = proposal.affectedGroups
    .filter((group) => textMatchesTerms(group.label, focusedTerms))
    .map((group) => group.id);
  const directDiffIds = proposal.diffs
    .filter((item) =>
      textMatchesTerms(
        [
          item.title,
          item.changeType,
          item.explanationPlainLanguage,
          item.practicalImpact,
          item.currentVersion.text,
          item.proposedVersion.text
        ].join(" "),
        focusedTerms
      )
    )
    .map((item) => item.id);
  const matchedDiffIds = unique([
    ...directDiffIds,
    ...proposal.diffs
      .filter((item) => item.affectedTopicIds.some((id) => matchedTopicIds.includes(id)))
      .map((item) => item.id),
    ...proposal.diffs
      .filter((item) => item.affectedGroupIds.some((id) => matchedGroupIds.includes(id)))
      .map((item) => item.id)
  ]);
  const score =
    (normalizedQuery && proposalText.includes(normalizedQuery) ? 4 : 0) +
    terms.filter((term) => textIncludesTerm(proposalText, term)).length +
    matchedDiffIds.length * 3 +
    matchedTopicIds.length * 2 +
    matchedGroupIds.length * 2;

  return {
    ...toOverview(proposal),
    matchedDiffIds,
    matchedTopicIds,
    matchedGroupIds,
    matchSummary: searchMatchSummary({
      matchedDiffCount: matchedDiffIds.length,
      topicLabels: proposal.topics.filter((topic) => matchedTopicIds.includes(topic.id)).map((topic) => topic.label),
      groupLabels: proposal.affectedGroups.filter((group) => matchedGroupIds.includes(group.id)).map((group) => group.label)
    }),
    score
  };
}

function searchLocalProposals(query) {
  return fallbackProposals
    .map((proposal) => buildLocalSearchResult(query, proposal))
    .filter(Boolean)
    .sort((left, right) => right.score - left.score)
    .map(({ score, ...result }) => result);
}

function findLocalProposal(id) {
  return fallbackProposals.find((proposal) => proposal.id === id) ?? null;
}

function buildSearchContext(query, result, proposal) {
  const fallbackResult = result.matchedDiffIds ? result : buildLocalSearchResult(query, proposal);

  return {
    proposalId: proposal.id,
    query,
    matchedDiffIds: fallbackResult?.matchedDiffIds ?? [],
    matchedTopicIds: fallbackResult?.matchedTopicIds ?? [],
    matchedGroupIds: fallbackResult?.matchedGroupIds ?? [],
    matchSummary:
      fallbackResult?.matchSummary ??
      "Encontramos una propuesta relacionada con tu busqueda. Revisa el resumen y las fuentes originales."
  };
}

function searchMatchSummary({ matchedDiffCount, topicLabels, groupLabels }) {
  if (matchedDiffCount === 0 && topicLabels.length > 0 && groupLabels.length > 0) {
    return `Encontramos un proyecto en debate sobre ${joinLabels(topicLabels)} que puede impactar a ${joinLabels(groupLabels)}.`;
  }

  if (matchedDiffCount === 0 && topicLabels.length > 0) {
    return `Encontramos un proyecto en debate sobre ${joinLabels(topicLabels)}.`;
  }

  if (matchedDiffCount === 0 && groupLabels.length > 0) {
    return `Encontramos un proyecto en debate que puede impactar a ${joinLabels(groupLabels)}.`;
  }

  if (topicLabels.length > 0 && groupLabels.length > 0) {
    return `Encontramos ${formatCount(matchedDiffCount, "cambio")} ${matchedDiffCount === 1 ? "relacionado" : "relacionados"} con ${joinLabels(topicLabels)} y con ${joinLabels(groupLabels)}.`;
  }

  if (topicLabels.length > 0) {
    return `Encontramos ${formatCount(matchedDiffCount, "cambio")} sobre ${joinLabels(topicLabels)}.`;
  }

  if (groupLabels.length > 0) {
    return `Encontramos ${formatCount(matchedDiffCount, "cambio")} que ${matchedDiffCount === 1 ? "impacta" : "impactan"} a ${joinLabels(groupLabels)}.`;
  }

  if (matchedDiffCount > 0) {
    return `Encontramos ${formatCount(matchedDiffCount, "cambio")} directamente relacionado con tu busqueda.`;
  }

  return "Encontramos una propuesta relacionada con tu busqueda. Revisa el resumen y las fuentes originales.";
}

function formatCount(count, singular) {
  return count === 1 ? `1 ${singular}` : `${count} ${singular}s`;
}

function joinLabels(labels) {
  if (labels.length <= 1) {
    return labels[0] ?? "";
  }

  return `${labels.slice(0, -1).join(", ")} y ${labels.at(-1)}`;
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

function scrollToDetail() {
  document.getElementById("detalle").scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToRelevantResult() {
  const firstMatchedDiffId = state.searchContext?.matchedDiffIds?.[0];

  if (!firstMatchedDiffId) {
    scrollToDetail();
    return;
  }

  const target = document.getElementById(`diff-${firstMatchedDiffId}`);
  (target ?? document.getElementById("detalle")).scrollIntoView({ behavior: "smooth", block: "start" });
}

function maybeScrollForCapture() {
  const target = new URLSearchParams(window.location.search).get("capture");

  if (target !== "diff") {
    return;
  }

  window.setTimeout(() => {
    document.getElementById("diffs")?.scrollIntoView({ block: "start" });
  }, 100);
}

function apiBaseFromRuntime() {
  return new URLSearchParams(window.location.search).get("api") || window.LEXMAPA_CONFIG?.apiBaseUrl || "";
}

function initialQueryFromUrl() {
  return new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
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
    LOADED: "Fuente de agenda cargada",
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

const STOP_WORDS = new Set([
  "con",
  "del",
  "las",
  "los",
  "pasa",
  "para",
  "por",
  "que",
  "una",
  "uno"
]);

const GENERIC_PROPOSAL_TERMS = new Set(["cambia", "cambio", "cambios", "legal", "laboral", "ley", "reforma"]);

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
