const state = {
  apiBase: apiBaseFromRuntime(),
  processors: [],
  queue: null,
  error: null,
  generatedAt: null
};

document.getElementById("refresh-status").addEventListener("click", () => {
  loadStatus();
});

loadStatus();
window.setInterval(loadStatus, 30_000);

async function loadStatus() {
  if (!state.apiBase) {
    state.error = "No hay API configurada para consultar el estado operativo.";
    render();
    return;
  }

  try {
    const apiBase = state.apiBase.replace(/\/$/, "");
    const [processorsResponse, queueResponse] = await Promise.all([
      fetch(`${apiBase}/processors/status`),
      fetch(`${apiBase}/processing-queue?limit=25`)
    ]);

    if (!processorsResponse.ok || !queueResponse.ok) {
      throw new Error("Operational status API failed");
    }

    const processorsPayload = await processorsResponse.json();
    const queuePayload = await queueResponse.json();

    state.processors = processorsPayload.processors ?? [];
    state.queue = queuePayload;
    state.generatedAt = queuePayload.generatedAt ?? processorsPayload.generatedAt ?? new Date().toISOString();
    state.error = null;
  } catch (error) {
    console.warn(error);
    state.error = "No se pudo cargar el estado operativo desde la API.";
  }

  render();
}

function render() {
  setText("status-updated", state.error ? state.error : `Actualizado: ${formatDateTime(state.generatedAt)}`);
  renderProcessors();
  renderQueue();
}

function renderProcessors() {
  const processors = state.queue?.processors ?? state.processors;
  setText("processor-count", `${processors.length} registrado${processors.length === 1 ? "" : "s"}`);

  if (processors.length === 0) {
    document.getElementById("processor-list").innerHTML = `
      <div class="empty-state">
        <strong>No hay procesadores remotos registrados</strong>
        <p>Cuando un procesador Docker se enrole y envie heartbeats, aparecera aca con su tier, modelo y job actual.</p>
      </div>
    `;
    return;
  }

  document.getElementById("processor-list").innerHTML = processors
    .map(
      (processor) => `
        <article class="processor-card">
          <div class="card-topline">
            <span class="status-dot ${statusClass(processor.status)}"></span>
            <span class="status-pill">${formatStatus(processor.status)}</span>
            <span class="status-pill muted">Tier ${escapeHtml(processor.tier ?? "pendiente")}</span>
          </div>
          <h3>${escapeHtml(processor.displayName)}</h3>
          <div class="mini-list">
            <strong>Modelo</strong>
            <span>${escapeHtml(processor.modelName ?? "Modelo pendiente")}</span>
          </div>
          <div class="mini-list">
            <strong>Capacidades</strong>
            <span>${processor.capabilities?.length ? escapeHtml(processor.capabilities.join(", ")) : "Sin capacidades declaradas"}</span>
          </div>
          <div class="mini-list">
            <strong>Job actual</strong>
            <span class="mono-text">${escapeHtml(processor.currentJobId ?? "Sin job en proceso")}</span>
          </div>
          <div class="mini-list">
            <strong>Ultimo heartbeat</strong>
            <span>${formatDateTime(processor.lastSeenAt)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderQueue() {
  const counts = state.queue?.counts ?? emptyCounts();
  const jobs = state.queue?.jobs ?? [];

  document.getElementById("queue-metrics").innerHTML = [
    ["PENDING", "Pendientes"],
    ["PROCESSING", "En proceso"],
    ["FAILED", "Fallidos"],
    ["NEEDS_REVIEW", "Necesitan revision"],
    ["COMPLETED", "Completados"],
    ["NOT_COMPARABLE", "No comparables"]
  ]
    .map(
      ([key, label]) => `
        <article class="metric-card">
          <span>${label}</span>
          <strong>${Number(counts[key] ?? 0)}</strong>
        </article>
      `
    )
    .join("");

  if (jobs.length === 0) {
    document.getElementById("job-list").innerHTML = `
      <div class="empty-state">
        <strong>No hay jobs cargados en la cola</strong>
        <p>Los jobs de extraccion, OCR y candidatos de diff apareceran aca cuando se creen desde el backend.</p>
      </div>
    `;
    return;
  }

  document.getElementById("job-list").innerHTML = jobs
    .map(
      (job) => `
        <article class="job-card">
          <div>
            <div class="card-topline">
              <span class="status-pill">${formatStatus(job.status)}</span>
              <span class="status-pill muted">${escapeHtml(job.jobType)}</span>
              <span class="status-pill muted">Prioridad ${Number(job.priority ?? 0)}</span>
            </div>
            <h3>${escapeHtml(job.sourceLabel ?? job.id)}</h3>
            <p class="small-muted mono-text">${escapeHtml(job.id)}</p>
          </div>
          <div class="ops-job-meta">
            <span>Intentos: ${Number(job.attempts ?? 0)}</span>
            <span>Creado: ${formatDateTime(job.createdAt)}</span>
            <span>Actualizado: ${formatDateTime(job.updatedAt)}</span>
            ${job.leaseUntil ? `<span>Lease: ${formatDateTime(job.leaseUntil)}</span>` : ""}
          </div>
          <div class="mini-list">
            <strong>Capacidades requeridas</strong>
            <span>${job.requiredCapabilities?.length ? escapeHtml(job.requiredCapabilities.join(", ")) : "Sin capacidades especiales"}</span>
          </div>
          ${job.sourceUrl ? `<a class="secondary-action ops-source-link" href="${escapeHtml(job.sourceUrl)}" target="_blank" rel="noreferrer">Abrir fuente del job</a>` : ""}
        </article>
      `
    )
    .join("");
}

function emptyCounts() {
  return {
    PENDING: 0,
    LEASED: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    FAILED: 0,
    NEEDS_REVIEW: 0,
    NOT_COMPARABLE: 0
  };
}

function statusClass(status) {
  return status === "ONLINE" ? "online" : status === "PROCESSING" ? "busy" : "offline";
}

function apiBaseFromRuntime() {
  return new URLSearchParams(window.location.search).get("api") || window.LEXMAPA_CONFIG?.apiBaseUrl || "";
}

function formatStatus(value) {
  return String(value ?? "UNKNOWN")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
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
