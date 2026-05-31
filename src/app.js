const fixtureSource = {
  id: "fixture-reforma-laboral-mvp",
  name: "Fixture manual LexMapa",
  sourceUrl: "https://lexmapa.linqorait.com",
  retrievedAt: "2026-05-31T00:00:00.000Z",
  official: false
};

function version(id, label, legalItemTitle, provisionLabel, text, status) {
  return {
    id,
    label,
    legalItemTitle,
    provisionLabel,
    text,
    status,
    source: fixtureSource
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
      "Texto actual",
      "Regimen laboral vigente - ejemplo",
      "Regla actual de ejemplo",
      currentText,
      "VIGENTE"
    ),
    proposedVersion: version(
      `${id}-propuesto`,
      "Texto propuesto",
      "Reforma laboral - ejemplo",
      "Regla propuesta de ejemplo",
      proposedText,
      "PROPOSED"
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
      "La pantalla muestra texto actual y texto propuesto lado a lado.",
      "Cada cambio explica que cambia y que significa en la practica.",
      "La fuente, el estado y el alcance del dato quedan visibles."
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
  dataStatus: "MANUAL_FIXTURE",
  scopeNote: "MVP de experiencia. Usa textos ficticios/acotados para demostrar comparacion legal y trazabilidad.",
  legalAdviceWarning: "LexMapa no brinda asesoramiento legal personalizado. Verifique siempre la fuente legal aplicable."
};

const state = {
  apiBase: apiBaseFromRuntime(),
  proposals: [toOverview(fallbackProposal)],
  proposal: fallbackProposal,
  query: "que cambia con la reforma laboral",
  dataset: null,
  error: null
};

document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = new FormData(event.currentTarget).get("q").toString().trim();
  runSearch(query);
});

document.getElementById("query-examples").addEventListener("click", (event) => {
  const button = event.target.closest("[data-query]");

  if (!button) {
    return;
  }

  const query = button.dataset.query;
  document.getElementById("search-input").value = query;
  runSearch(query);
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
  state.query = query;

  if (!query) {
    state.proposal = fallbackProposal;
    render();
    return;
  }

  if (!state.apiBase) {
    state.proposal = localProposalMatches(query) ? fallbackProposal : null;
    render();
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
  renderQueryExamples();

  if (!state.proposal) {
    renderEmpty();
    return;
  }

  const proposal = state.proposal;

  setText("proposal-short", proposal.summary.short);
  setText("proposal-title", proposal.title);
  setText("proposal-headline", proposal.summary.headline);
  setText("proposal-status", `Estado: ${formatStatus(proposal.status)}`);
  setText("data-status", `Dato: ${formatStatus(proposal.dataStatus)}`);
  setText("topic-count", `${proposal.topics.length} temas`);
  setText("group-count", `${proposal.affectedGroups.length} grupos`);
  setText("diff-count", `${proposal.diffs.length} cambios`);

  renderTopics(proposal.topics);
  renderGroups(proposal.affectedGroups);
  renderList("key-points", proposal.summary.keyPoints);
  renderList("what-it-means", proposal.summary.whatItMeans);
  renderDiffs(proposal);
  renderSource(proposal);
  renderScope(proposal);
}

function renderQueryExamples() {
  const examples = state.proposal?.queryExamples ?? fallbackProposal.queryExamples;
  document.getElementById("query-examples").innerHTML = examples
    .map((query) => `<button class="query-chip" type="button" data-query="${escapeHtml(query)}">${escapeHtml(query)}</button>`)
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

          <div class="explanation-grid">
            <div>
              <span>Que cambia</span>
              <p>${escapeHtml(item.explanationPlainLanguage)}</p>
            </div>
            <div>
              <span>Que significa</span>
              <p>${escapeHtml(item.practicalImpact)}</p>
            </div>
          </div>

          <footer class="diff-source">
            <span>Fuente: ${escapeHtml(item.source.name)}</span>
            <span>Estado: ${formatStatus(item.dataStatus)}</span>
            <span>Impacto: ${formatStatus(item.impactLevel)}</span>
          </footer>
        </article>
      `;
    })
    .join("");
}

function renderSource(proposal) {
  const source = proposal.source;
  const url = source.sourceUrl ?? "#";
  document.getElementById("source-box").innerHTML = `
    <div class="source-line">
      <span>Fuente</span>
      <strong>${escapeHtml(source.name)}</strong>
    </div>
    <div class="source-line">
      <span>Oficial</span>
      <strong>${source.official ? "Si" : "No"}</strong>
    </div>
    <div class="source-line">
      <span>Recuperado</span>
      <strong>${formatDate(source.retrievedAt)}</strong>
    </div>
    <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>
  `;
}

function renderScope(proposal) {
  const dataset = state.dataset?.mode ? `Dataset: ${state.dataset.mode}.` : "Dataset: fixture local.";
  document.getElementById("scope-box").innerHTML = `
    <p>${escapeHtml(proposal.scopeNote ?? "Comparacion acotada para MVP.")}</p>
    <p>${escapeHtml(proposal.legalAdviceWarning)}</p>
    <p>${escapeHtml(dataset)} ${state.error ? escapeHtml(state.error) : ""}</p>
  `;
}

function renderEmpty() {
  setText("proposal-short", "No encontramos una comparacion para esa pregunta en el fixture actual.");
  setText("proposal-title", "Sin resultados");
  setText("proposal-headline", "Proba con reforma laboral, trabajadores, indemnizaciones o periodo de prueba.");
  setText("proposal-status", "Estado: sin dato");
  setText("data-status", "Dato: sin dato");
  setText("topic-count", "0 temas");
  setText("group-count", "0 grupos");
  setText("diff-count", "0 cambios");

  document.getElementById("topics-list").innerHTML = "";
  document.getElementById("groups-list").innerHTML = "";
  document.getElementById("key-points").innerHTML = "";
  document.getElementById("what-it-means").innerHTML = "";
  document.getElementById("diff-list").innerHTML = "";
  document.getElementById("source-box").innerHTML = "";
  document.getElementById("scope-box").innerHTML = state.error ? `<p>${escapeHtml(state.error)}</p>` : "";
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
