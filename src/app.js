const PENDING_SOURCE_TEXT = "Fuente original pendiente de carga";

if (new URLSearchParams(window.location.search).get("capture") === "diff") {
  document.documentElement.classList.add("capture-diff");
}

const fixtureSource = {
  id: "fixture-reforma-laboral-mvp",
  name: "Fixture manual LexMapa",
  sourceUrl: "https://lexmapa.linqorait.com",
  retrievedAt: "2026-05-31T00:00:00.000Z",
  official: false
};

function pendingOriginalSource(label) {
  return {
    status: "PENDING",
    label,
    note: PENDING_SOURCE_TEXT
  };
}

function version(id, label, legalItemTitle, provisionLabel, text, status, originalLabel) {
  return {
    id,
    label,
    legalItemTitle,
    provisionLabel,
    text,
    status,
    source: fixtureSource,
    sourceStatus: "PENDING",
    originalSource: pendingOriginalSource(originalLabel)
  };
}

function diff(id, title, changeType, topicIds, groupIds, currentText, proposedText, explanation, impact, impactLevel) {
  return {
    id,
    proposalId: "reforma-laboral-mvp-2026",
    title,
    changeType,
    affectedTopicIds: topicIds,
    affectedGroupIds: groupIds,
    currentVersion: version(
      `${id}-actual`,
      "Texto vigente",
      "Regimen laboral vigente - ejemplo",
      "Regla actual de ejemplo",
      currentText,
      "VIGENTE",
      "Texto vigente original"
    ),
    proposedVersion: version(
      `${id}-propuesto`,
      "Texto propuesto",
      "Reforma laboral - ejemplo",
      "Regla propuesta de ejemplo",
      proposedText,
      "PROPOSED",
      "Texto propuesto original"
    ),
    explanationPlainLanguage: explanation,
    practicalImpact: impact,
    impactLevel,
    source: fixtureSource,
    dataStatus: "MANUAL_FIXTURE",
    traceability: {
      notes: "Texto ficticio/acotado para validar la experiencia de comparacion."
    }
  };
}

const fallbackProposal = {
  id: "reforma-laboral-mvp-2026",
  title: "Reforma laboral - ejemplo acotado para MVP",
  status: "IN_DEBATE",
  typeOfChange: "Reforma propuesta",
  summary: {
    headline: "Que cambia con la reforma laboral",
    short: "Comparacion manual y acotada para probar LexMapa como un Git diff de leyes explicado en lenguaje simple.",
    keyPoints: [
      "Extiende el periodo inicial de prueba.",
      "Permite discutir un sistema alternativo para indemnizaciones.",
      "Cambia el tratamiento de multas por registracion laboral.",
      "Agrega un esquema de banco de horas.",
      "Incorpora una figura de colaboradores independientes para casos pequenos."
    ],
    whatItMeans: [
      "La pantalla muestra texto vigente y texto propuesto lado a lado.",
      "Cada cambio explica que cambia y que significa en la practica.",
      "La fuente original de cada version queda visible o marcada como pendiente."
    ],
    limitations: [
      "Fixture manual de desarrollo.",
      "No cubre una reforma real completa.",
      "Debe revisarse juridicamente antes de usarse como dato productivo."
    ],
    legalAdviceWarning:
      "LexMapa explica cambios legales en lenguaje simple, pero no brinda asesoramiento legal personalizado."
  },
  topics: [
    {
      id: "periodo-de-prueba",
      label: "Periodo de prueba",
      summaryPlainLanguage: "Tiempo inicial de una relacion laboral con reglas de salida mas flexibles."
    },
    {
      id: "indemnizaciones",
      label: "Indemnizaciones",
      summaryPlainLanguage: "Forma de calcular o reemplazar el pago ante un despido sin causa."
    },
    {
      id: "registracion-laboral",
      label: "Registracion laboral",
      summaryPlainLanguage: "Reglas y consecuencias cuando una relacion laboral no esta registrada correctamente."
    },
    {
      id: "jornada-y-horas",
      label: "Jornada y horas",
      summaryPlainLanguage: "Organizacion del tiempo de trabajo y compensacion de horas."
    },
    {
      id: "colaboradores-independientes",
      label: "Colaboradores independientes",
      summaryPlainLanguage: "Supuestos en los que una persona trabaja como independiente y no como empleado."
    }
  ],
  affectedGroups: [
    {
      id: "trabajadores",
      label: "Trabajadores",
      impactSummary: "Podrian ver cambios en estabilidad inicial, indemnizacion y organizacion de horas."
    },
    {
      id: "empleadores",
      label: "Empleadores",
      impactSummary: "Podrian tener mas opciones de contratacion, salida y organizacion del trabajo."
    },
    {
      id: "pymes",
      label: "PyMEs",
      impactSummary: "Podrian usar reglas simplificadas, aunque con alcance sujeto a regulacion."
    },
    {
      id: "trabajadores-independientes",
      label: "Trabajadores independientes",
      impactSummary: "Podrian quedar alcanzados por nuevas figuras contractuales si se cumplen ciertos requisitos."
    }
  ],
  diffs: [
    diff(
      "rl-mvp-periodo-prueba",
      "Periodo de prueba mas largo",
      "MODIFIED",
      ["periodo-de-prueba"],
      ["trabajadores", "empleadores", "pymes"],
      "El contrato por tiempo indeterminado se entiende celebrado a prueba durante los primeros tres meses. Durante ese plazo cualquiera de las partes puede extinguir la relacion sin expresar causa.",
      "El contrato por tiempo indeterminado se entiende celebrado a prueba durante los primeros seis meses. Por convenio colectivo podra ampliarse para ciertos empleadores dentro de los limites que fije la reglamentacion.",
      "El tiempo inicial de prueba pasaria de tres a seis meses y podria ampliarse en algunos casos definidos por convenio.",
      "Para un trabajador, significa mas tiempo antes de llegar a una estabilidad plena. Para un empleador, significa mas margen para evaluar la relacion laboral.",
      "HIGH"
    ),
    diff(
      "rl-mvp-indemnizacion",
      "Sistema alternativo para indemnizaciones",
      "MODIFIED",
      ["indemnizaciones"],
      ["trabajadores", "empleadores"],
      "Ante un despido sin causa, el empleador debe abonar una indemnizacion calculada sobre la mejor remuneracion mensual y la antiguedad del trabajador.",
      "Mediante convenio colectivo podra sustituirse el regimen indemnizatorio por un fondo o sistema de cese laboral, con aportes y condiciones definidos para la actividad.",
      "La reforma abre la puerta a reemplazar la indemnizacion tradicional por un sistema acordado por actividad.",
      "El impacto real dependeria del convenio y de como se financie el fondo. Puede cambiar cuanto se cobra, cuando se cobra y quien aporta.",
      "HIGH"
    ),
    diff(
      "rl-mvp-registracion",
      "Cambio en multas por registracion",
      "MODIFIED",
      ["registracion-laboral"],
      ["trabajadores", "empleadores", "pymes"],
      "La falta de registracion o la registracion deficiente genera multas a favor del trabajador, sin perjuicio de otros creditos laborales.",
      "La autoridad podra establecer un plazo de regularizacion. Cumplido ese plazo, las sanciones se aplicaran conforme al nuevo regimen simplificado.",
      "Se reemplaza un esquema centrado en multas por otro que prioriza regularizar primero y sancionar despues bajo reglas nuevas.",
      "Puede facilitar la regularizacion para empleadores, pero tambien modificar los incentivos y reclamos disponibles para trabajadores.",
      "MEDIUM"
    ),
    diff(
      "rl-mvp-banco-horas",
      "Banco de horas",
      "ADDED",
      ["jornada-y-horas"],
      ["trabajadores", "empleadores"],
      "No hay una regla general equivalente en este fixture para compensar horas bajo un banco de horas.",
      "Los convenios colectivos podran prever bancos de horas para compensar excesos o reducciones de jornada dentro de un periodo determinado.",
      "Se agrega una herramienta para mover horas entre dias o semanas, siempre que exista una regla colectiva que lo permita.",
      "Puede dar flexibilidad operativa, pero hace mas importante mirar el convenio aplicable y el periodo de compensacion.",
      "MEDIUM"
    ),
    diff(
      "rl-mvp-colaboradores",
      "Colaboradores independientes",
      "ADDED",
      ["colaboradores-independientes"],
      ["pymes", "trabajadores-independientes"],
      "Este fixture no contiene una figura general de colaboradores independientes para pequenos emprendimientos.",
      "Los pequenos emprendimientos podran contratar hasta un numero limitado de colaboradores independientes, siempre que no exista relacion de dependencia encubierta.",
      "Se crea una categoria nueva para ciertos trabajos independientes en emprendimientos chicos.",
      "Puede abrir una via de contratacion mas simple, pero tambien requiere controlar que no se use para ocultar una relacion laboral real.",
      "MEDIUM"
    )
  ],
  queryExamples: [
    "que cambia con la reforma laboral",
    "que cambia para los trabajadores",
    "que pasa con las indemnizaciones",
    "que cambia en el periodo de prueba"
  ],
  source: fixtureSource,
  originalSources: {
    current: pendingOriginalSource("Texto vigente original"),
    proposed: pendingOriginalSource("Texto propuesto original")
  },
  dataStatus: "MANUAL_FIXTURE",
  updatedAt: "2026-05-31T00:00:00.000Z",
  scopeNote: "MVP de experiencia. Usa textos ficticios/acotados para demostrar comparacion legal y trazabilidad.",
  legalAdviceWarning: "LexMapa no brinda asesoramiento legal personalizado. Verifique siempre la fuente legal aplicable."
};

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
  proposals: [toOverview(fallbackProposal)],
  proposal: fallbackProposal,
  dataset: null,
  error: null
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

loadInitialData().then(render).catch((error) => {
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
    render();
    scrollToDetail();
    return;
  }

  if (!state.apiBase) {
    state.proposal = localProposalMatches(query) ? fallbackProposal : null;
    render();
    scrollToDetail();
    return;
  }

  try {
    const apiBase = state.apiBase.replace(/\/$/, "");
    const response = await fetch(`${apiBase}/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error("Search API failed");
    }

    const payload = await response.json();
    state.proposals = payload.proposals.length > 0 ? payload.proposals : [toOverview(fallbackProposal)];

    if (payload.proposals.length === 0) {
      state.proposal = null;
      render();
      scrollToDetail();
      return;
    }

    await loadProposalDetail(payload.proposals[0].id);
    state.error = payload.itemsUnavailable?.error
      ? "La busqueda normativa esta limitada por el estado del dataset, pero la comparacion MVP esta disponible."
      : null;
  } catch (error) {
    console.warn(error);
    state.error = "No se pudo completar la busqueda remota. Se muestra el fixture local.";
    state.proposal = localProposalMatches(query) ? fallbackProposal : null;
  }

  render();
  scrollToDetail();
}

async function openProposal(id) {
  await loadProposalDetail(id);
  render();
  scrollToDetail();
}

async function loadProposalDetail(id) {
  if (!state.apiBase) {
    state.proposal = id === fallbackProposal.id ? fallbackProposal : null;
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
  const proposals = state.proposals.length > 0 ? state.proposals : [toOverview(fallbackProposal)];
  setText("debate-count", `${proposals.length} cargado${proposals.length === 1 ? "" : "s"}`);

  document.getElementById("debate-list").innerHTML = proposals
    .map((proposal) => {
      const topics = proposal.affectedTopics ?? [];
      const groups = proposal.affectedGroups ?? [];
      const sourceName = proposal.source?.name ?? "Fuente no cargada";

      return `
        <article class="proposal-card">
          <div class="card-topline">
            <span class="status-pill">${formatStatus(proposal.status)}</span>
            <span class="small-muted">${escapeHtml(sourceName)}</span>
          </div>
          <h3>${escapeHtml(proposal.title)}</h3>
          <p>${escapeHtml(proposal.summaryPlainLanguage)}</p>
          <div class="mini-list">
            <strong>Temas afectados</strong>
            <span>${topics.length > 0 ? escapeHtml(topics.join(", ")) : "Sin temas cargados"}</span>
          </div>
          <div class="mini-list">
            <strong>Grupos afectados</strong>
            <span>${groups.length > 0 ? escapeHtml(groups.join(", ")) : "Sin grupos cargados"}</span>
          </div>
          <button class="primary-action" type="button" data-open-proposal="${escapeHtml(proposal.id)}">Entender cambios</button>
        </article>
      `;
    })
    .join("");
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
  setText("detail-summary", proposal.summary.short);
  setText("detail-status", `Estado: ${formatStatus(proposal.status)}`);
  setText("detail-type", `Tipo: ${proposal.typeOfChange ?? "Cambio legal"}`);
  setText("detail-updated", `Actualizado: ${formatDate(proposal.updatedAt)}`);
  setText("topic-count", `${proposal.topics.length} temas`);
  setText("group-count", `${proposal.affectedGroups.length} grupos`);
  setText("diff-count", `${proposal.diffs.length} cambios`);

  renderList("detail-key-points", proposal.summary.keyPoints);
  renderProposalSources(proposal);
  renderTopics(proposal.topics);
  renderGroups(proposal.affectedGroups);
  renderList("main-changes", proposal.summary.keyPoints);
  renderDiffs(proposal);
}

function renderProposalSources(proposal) {
  const sources = proposal.originalSources ?? {
    current: pendingOriginalSource("Texto vigente original"),
    proposed: pendingOriginalSource("Texto propuesto original")
  };

  document.getElementById("proposal-sources").innerHTML = `
    ${renderOriginalSource(sources.current, "Ver texto vigente original")}
    ${renderOriginalSource(sources.proposed, "Ver texto propuesto original")}
    <div class="source-context">
      <span>Fuente principal</span>
      <strong>${escapeHtml(proposal.source?.name ?? "Sin fuente principal")}</strong>
    </div>
  `;
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
  const topicById = new Map(proposal.topics.map((topic) => [topic.id, topic.label]));
  const groupById = new Map(proposal.affectedGroups.map((group) => [group.id, group.label]));

  document.getElementById("diff-list").innerHTML = proposal.diffs
    .map((item, index) => {
      const topics = item.affectedTopicIds.map((id) => topicById.get(id) ?? id);
      const groups = item.affectedGroupIds.map((id) => groupById.get(id) ?? id);

      return `
        <article class="diff-card">
          <div class="diff-heading">
            <div>
              <span class="diff-index">Cambio ${index + 1}</span>
              <h3>${escapeHtml(item.title)}</h3>
            </div>
            <span class="change-badge ${item.changeType.toLowerCase()}">${formatChangeType(item.changeType)}</span>
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
              <p>${escapeHtml(item.currentVersion.text)}</p>
            </section>

            <section class="legal-text proposed">
              <div class="legal-text-header">
                <strong>${escapeHtml(item.proposedVersion.label)}</strong>
                <span>${escapeHtml(item.proposedVersion.provisionLabel ?? "")}</span>
              </div>
              <p>${escapeHtml(item.proposedVersion.text)}</p>
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

function renderEmptyDetail() {
  setText("detail-title", "Sin resultados");
  setText("detail-summary", "No encontramos un cambio legal cargado para esa busqueda.");
  setText("detail-status", "Estado: sin dato");
  setText("detail-type", "Tipo: sin dato");
  setText("detail-updated", "Actualizado: sin dato");
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

function localProposalMatches(query) {
  return normalize(searchableText(fallbackProposal)).includes(normalize(query));
}

function searchableText(proposal) {
  return [
    proposal.title,
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

function toOverview(proposal) {
  return {
    id: proposal.id,
    title: proposal.title,
    status: proposal.status,
    summaryPlainLanguage: proposal.summary.short,
    affectedTopics: proposal.topics.map((topic) => topic.label),
    affectedGroups: proposal.affectedGroups.map((group) => group.label),
    diffCount: proposal.diffs.length,
    dataStatus: proposal.dataStatus,
    source: proposal.source
  };
}

function scrollToDetail() {
  document.getElementById("detalle").scrollIntoView({ behavior: "smooth", block: "start" });
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

function formatDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium"
  }).format(new Date(value));
}

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
