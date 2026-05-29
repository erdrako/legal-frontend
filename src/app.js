const approvedOverview = {
  id: "ar-law-example-001",
  title: "Norma argentina de ejemplo",
  type: "LAW",
  status: "DESCONOCIDO",
  summaryPlainLanguage: "Item legal de ejemplo aprobado para validar la primera experiencia visual de LexMapa.",
  affectedSubjects: [],
  currentEffects: {
    obligations: 0,
    prohibitions: 0,
    rights: 0,
    sanctions: 0
  },
  relationshipsSummary: {
    modifications: 0,
    regulations: 0,
    caseLaw: 0,
    doctrine: 0,
    administrativeCriteria: 0,
    pendingBills: 0
  },
  freshness: {
    status: "UPDATED",
    lastValidatedAt: "2026-05-29T00:00:00.000Z",
    lastSourceCheckedAt: "2026-05-29T00:00:00.000Z",
    pendingValidationCount: 0
  },
  source: {
    name: "InfoLEG",
    url: "https://www.argentina.gob.ar/normativa",
    retrievedAt: "2026-05-29T00:00:00.000Z"
  }
};

const state = {
  overviews: [approvedOverview],
  overview: approvedOverview,
  dataset: {
    mode: "DEV_STRUCTURAL",
    disposable: true,
    warning: "Dataset de desarrollo embebido. No usar como dato legal aprobado."
  }
};

document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = new FormData(event.currentTarget).get("q").toString().trim().toLowerCase();
  const found = state.overviews.find((overview) =>
    [overview.title, overview.summaryPlainLanguage, overview.type, overview.status]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );

  state.overview = found || (query.length === 0 ? state.overviews[0] : null);
  render();
});

loadInitialData().then(render).catch((error) => {
  console.warn(error);
  render();
});

async function loadInitialData() {
  const apiBase = new URLSearchParams(window.location.search).get("api");

  if (!apiBase) {
    return;
  }

  const [itemsResponse, datasetResponse] = await Promise.all([
    fetch(`${apiBase.replace(/\/$/, "")}/legal-items`),
    fetch(`${apiBase.replace(/\/$/, "")}/dataset/status`)
  ]);

  if (!itemsResponse.ok || !datasetResponse.ok) {
    throw new Error("Backend API did not return usable data");
  }

  const itemsPayload = await itemsResponse.json();
  const datasetPayload = await datasetResponse.json();

  state.overviews = itemsPayload.items.map((item) => ({
    ...item,
    source: approvedOverview.source
  }));
  state.overview = state.overviews[0] ?? null;
  state.dataset = datasetPayload;
}

function render() {
  if (!state.overview) {
    renderEmpty();
    return;
  }

  renderOverview(state.overview);
  renderEffects(state.overview.currentEffects);
  renderSubjects(state.overview.affectedSubjects);
  renderRelationships(state.overview.relationshipsSummary);
  renderTimeline(state.overview);
  renderSource(state.overview);
}

function renderOverview(overview) {
  setText("item-title", overview.title);
  setText("item-summary", overview.summaryPlainLanguage);
  setText("legal-status", `Estado: ${overview.status}`);
  setText("freshness-status", `Freshness: ${overview.freshness.status}`);
  setText("sync-state", `Validado: ${formatDate(overview.freshness.lastValidatedAt)}`);
  setText("pending-count", String(overview.freshness.pendingValidationCount));
  setText("dataset-warning", datasetWarningText());
}

function datasetWarningText() {
  if (!state.dataset) {
    return "";
  }

  if (state.dataset.mode === "DEV_STRUCTURAL") {
    return state.dataset.warning ?? "Dataset de desarrollo descartable. No usar como aprobacion legal.";
  }

  return "";
}

function renderEffects(effects) {
  const rows = [
    ["Obligaciones", effects.obligations],
    ["Prohibiciones", effects.prohibitions],
    ["Derechos", effects.rights],
    ["Sanciones", effects.sanctions]
  ];

  document.getElementById("effects-grid").innerHTML = rows
    .map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

function renderSubjects(subjects) {
  const container = document.getElementById("affected-subjects");
  setText("affected-count", `${subjects.length} sujetos`);

  if (subjects.length === 0) {
    container.innerHTML = `<p class="empty-state">Sin sujetos extraidos en este bundle inicial.</p>`;
    return;
  }

  container.innerHTML = subjects.map((subject) => `<span class="tag">${escapeHtml(subject)}</span>`).join("");
}

function renderRelationships(summary) {
  const rows = [
    ["Modificaciones", summary.modifications],
    ["Reglamentaciones", summary.regulations],
    ["Jurisprudencia", summary.caseLaw],
    ["Doctrina", summary.doctrine],
    ["Criterios admin.", summary.administrativeCriteria],
    ["Proyectos", summary.pendingBills]
  ];

  document.getElementById("relationship-map").innerHTML = rows
    .map(([label, value]) => `<div class="relation-node"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

function renderTimeline(overview) {
  const events = [
    ["Fuente revisada", overview.freshness.lastSourceCheckedAt],
    ["Dato aprobado", overview.freshness.lastValidatedAt],
    ["Pendientes", `${overview.freshness.pendingValidationCount} cambios`]
  ];

  document.getElementById("timeline-list").innerHTML = events
    .map(([label, value]) => `<li><strong>${label}</strong><br>${formatTimelineValue(value)}</li>`)
    .join("");
}

function renderSource(overview) {
  const source = overview.source;
  document.getElementById("source-box").innerHTML = `
    <span>Fuente primaria</span>
    <strong>${escapeHtml(source.name)}</strong>
    <a href="${source.url}" target="_blank" rel="noreferrer">${source.url}</a>
    <span>Recuperado: ${formatDate(source.retrievedAt)}</span>
  `;
}

function renderEmpty() {
  setText("item-title", "Sin resultados");
  setText("item-summary", "No hay items aprobados que coincidan con la busqueda actual.");
  setText("legal-status", "Estado: sin dato");
  setText("freshness-status", "Freshness: sin dato");
  setText("sync-state", "Sin resultados");
  setText("dataset-warning", datasetWarningText());
  setText("affected-count", "0 sujetos");
  setText("pending-count", "0");
  document.getElementById("effects-grid").innerHTML = "";
  document.getElementById("affected-subjects").innerHTML = `<p class="empty-state">Sin datos para mostrar.</p>`;
  document.getElementById("relationship-map").innerHTML = "";
  document.getElementById("timeline-list").innerHTML = "";
  document.getElementById("source-box").innerHTML = "";
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function formatTimelineValue(value) {
  if (typeof value === "string" && value.endsWith("cambios")) {
    return value;
  }

  return formatDate(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
