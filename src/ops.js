const state = {
  apiBase: apiBaseFromRuntime(),
  processors: [],
  queue: null,
  detectedProjects: null,
  review: null,
  adminToken: window.sessionStorage.getItem("lexmapa.ops.adminToken") ?? "",
  actionMessage: "",
  error: null,
  generatedAt: null
};

document.getElementById("refresh-status").addEventListener("click", () => {
  loadStatus();
});

document.getElementById("save-admin-token").addEventListener("click", () => {
  state.adminToken = document.getElementById("admin-token").value.trim();
  if (state.adminToken) {
    window.sessionStorage.setItem("lexmapa.ops.adminToken", state.adminToken);
    state.actionMessage = "Token cargado para acciones protegidas";
  } else {
    window.sessionStorage.removeItem("lexmapa.ops.adminToken");
    state.actionMessage = "Modo lectura";
  }
  render();
});

document.getElementById("clear-admin-token").addEventListener("click", () => {
  state.adminToken = "";
  document.getElementById("admin-token").value = "";
  window.sessionStorage.removeItem("lexmapa.ops.adminToken");
  state.actionMessage = "Token eliminado. Modo lectura";
  render();
});

document.getElementById("resolve-current-sources").addEventListener("click", () => {
  resolveCurrentSources();
});

document.getElementById("resolve-diff-candidates").addEventListener("click", () => {
  resolveDiffCandidates();
});

document.addEventListener("click", (event) => {
  const retryButton = event.target.closest("[data-retry-job]");
  if (retryButton) {
    retryJob(retryButton.dataset.retryJob);
  }

  const resolveButton = event.target.closest("[data-resolve-current-source]");
  if (resolveButton) {
    resolveCurrentSources([resolveButton.dataset.resolveCurrentSource]);
  }
});

document.getElementById("admin-token").value = state.adminToken;
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
    const [processorsResponse, queueResponse, detectedResponse, reviewResponse] = await Promise.all([
      fetch(`${apiBase}/processors/status`),
      fetch(`${apiBase}/processing-queue?limit=25`),
      fetch(`${apiBase}/detected-projects?limit=50`),
      fetch(`${apiBase}/processing-review?limit=50`)
    ]);

    if (!processorsResponse.ok || !queueResponse.ok || !detectedResponse.ok || !reviewResponse.ok) {
      throw new Error("Operational status API failed");
    }

    const processorsPayload = await processorsResponse.json();
    const queuePayload = await queueResponse.json();
    const detectedPayload = await detectedResponse.json();
    const reviewPayload = await reviewResponse.json();

    state.processors = processorsPayload.processors ?? [];
    state.queue = queuePayload;
    state.detectedProjects = detectedPayload;
    state.review = reviewPayload;
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
  setText("action-status", state.actionMessage || (state.adminToken ? "Token cargado en esta sesion" : "Modo lectura"));
  renderProcessors();
  renderQueue();
  renderDetectedProjects();
  renderReview();
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
          ${["FAILED", "NEEDS_REVIEW", "NOT_COMPARABLE"].includes(job.status) ? `<button class="secondary-action ops-source-link" type="button" data-retry-job="${escapeHtml(job.id)}">Reintentar job</button>` : ""}
        </article>
      `
    )
    .join("");
}

function renderDetectedProjects() {
  const payload = state.detectedProjects;
  const projects = payload?.projects ?? [];
  const counts = payload?.counts ?? {};
  setText("detected-project-count", `${projects.length} detectado${projects.length === 1 ? "" : "s"}`);

  document.getElementById("detected-project-metrics").innerHTML = [
    ["total", "Total"],
    ["needsReview", "Necesitan revision"],
    ["readyForValidation", "Listos validacion"],
    ["duplicates", "Duplicados"],
    ["proposedTextLoaded", "Texto propuesto"],
    ["currentTextLoaded", "Texto vigente"]
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

  if (projects.length === 0) {
    document.getElementById("detected-project-list").innerHTML = `
      <div class="empty-state">
        <strong>No hay proyectos detectados en staging</strong>
        <p>Cuando el collector detecte items de agenda, apareceran aca antes de cualquier publicacion.</p>
      </div>
    `;
    return;
  }

  document.getElementById("detected-project-list").innerHTML = projects
    .map((project) => {
      const sources = project.sources ?? [];
      return `
        <article class="job-card">
          <div>
            <div class="card-topline">
              <span class="status-pill">${formatStatus(project.status)}</span>
              <span class="status-pill muted">${escapeHtml(project.chamber ?? "Camara pendiente")}</span>
              ${project.duplicateWarning ? `<span class="status-pill warning">Duplicado</span>` : ""}
            </div>
            <h3>${escapeHtml(project.title ?? project.expedientNumber ?? project.id)}</h3>
            <p class="small-muted mono-text">${escapeHtml(project.expedientNumber ?? project.id)}</p>
          </div>
          <div class="ops-job-meta">
            <span>Tratamiento: ${formatDateTime(project.scheduledAt)}</span>
            <span>Creado: ${formatDateTime(project.createdAt)}</span>
            <span>Actualizado: ${formatDateTime(project.updatedAt)}</span>
            ${project.processingJob ? `<span>Job: ${formatStatus(project.processingJob.status)}</span>` : "<span>Job: pendiente de crear</span>"}
          </div>
          ${project.duplicateWarning ? `<p class="warning-text">${escapeHtml(project.duplicateWarning)}</p>` : ""}
          <div class="mini-list">
            <strong>Fuentes</strong>
            <span>${sources.length ? sources.map((source) => `${escapeHtml(source.role)}: ${escapeHtml(source.status)}`).join(" | ") : "Sin fuentes asociadas"}</span>
          </div>
          <div class="source-list">
            ${sources
              .filter((source) => source.url)
              .slice(0, 5)
              .map((source) => `<a class="secondary-action ops-source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.role)}</a>`)
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderReview() {
  const review = state.review?.review ?? {};
  const cards = [
    ["Pendientes", review.pendingJobs?.length ?? 0],
    ["Fallidos", review.failedJobs?.length ?? 0],
    ["Needs review", review.needsReviewJobs?.length ?? 0],
    ["No comparables", review.notComparableJobs?.length ?? 0],
    ["Duplicados", review.duplicateProjects?.length ?? 0],
    ["Candidatos", review.candidates?.length ?? 0],
    ["Diffs visibles", review.resolvedDiffs?.length ?? 0]
  ];

  document.getElementById("review-metrics").innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="metric-card">
          <span>${label}</span>
          <strong>${Number(value)}</strong>
        </article>
      `
    )
    .join("");

  const reviewItems = [
    ...(review.failedJobs ?? []).map((job) => ({ type: "Job fallido", title: job.sourceLabel ?? job.id, status: job.status, id: job.id, retry: true })),
    ...(review.needsReviewJobs ?? []).map((job) => ({ type: "Job necesita revision", title: job.sourceLabel ?? job.id, status: job.status, id: job.id, retry: true })),
    ...(review.duplicateProjects ?? []).map((project) => ({
      type: "Proyecto duplicado",
      title: project.title ?? project.expedientNumber,
      status: project.status,
      id: project.id,
      note: project.duplicateWarning
    })),
    ...(review.affectedLegalItems ?? []).map((item) => ({
      type: "Texto vigente pendiente",
      title: item.canonicalReferenceText ?? item.title,
      status: item.sourceStatus,
      id: item.id,
      note: item.reviewReason ?? item.notes,
      canonical: item.canonicalReferenceText,
      evidence: item.detectionEvidence,
      currentSource: item.currentSource,
      resolveSource: true
    })),
    ...(review.candidates ?? []).map((candidate) => ({
      type: "Candidato de diff",
      title: candidate.title,
      status: candidate.reviewStatus,
      id: candidate.id,
      note: candidate.validationWarnings?.join(", ")
    })),
    ...(review.resolvedDiffs ?? []).map((diff) => ({
      type: "Diff visible",
      title: diff.title,
      status: diff.publicStatus,
      id: diff.id,
      note: diff.validationWarnings?.join(", ") || "Sin warnings criticos",
      evidence: {
        detectedVerb: diff.operationType,
        confidence: diff.confidence,
        evidenceText: diff.traceability?.notes
      }
    }))
  ];

  if (reviewItems.length === 0) {
    document.getElementById("review-list").innerHTML = `
      <div class="empty-state">
        <strong>No hay casos de revision cargados</strong>
        <p>Los casos pendientes, fallidos o no comparables apareceran aca con su motivo operativo.</p>
      </div>
    `;
    return;
  }

  document.getElementById("review-list").innerHTML = reviewItems
    .slice(0, 80)
    .map(
      (item) => `
        <article class="job-card">
          <div class="card-topline">
            <span class="status-pill">${escapeHtml(item.type)}</span>
            <span class="status-pill muted">${formatStatus(item.status)}</span>
          </div>
          <h3>${escapeHtml(item.title ?? item.id)}</h3>
          <p class="small-muted mono-text">${escapeHtml(item.id)}</p>
          ${item.canonical ? `<p class="small-muted">Referencia canonica: ${escapeHtml(item.canonical)}</p>` : ""}
          ${item.note ? `<p class="warning-text">${escapeHtml(item.note)}</p>` : ""}
          ${renderEvidence(item.evidence)}
          ${renderCurrentSource(item.currentSource)}
          ${item.retry ? `<button class="secondary-action ops-source-link" type="button" data-retry-job="${escapeHtml(item.id)}">Reintentar job</button>` : ""}
          ${item.resolveSource ? `<button class="secondary-action ops-source-link" type="button" data-resolve-current-source="${escapeHtml(item.id)}">Resolver fuente vigente</button>` : ""}
        </article>
      `
    )
    .join("");
}

async function retryJob(jobId) {
  if (!state.adminToken) {
    state.actionMessage = "Para reintentar un job, carga primero el token operativo.";
    render();
    return;
  }

  try {
    const response = await fetch(`${state.apiBase.replace(/\/$/, "")}/processing-queue/jobs/${encodeURIComponent(jobId)}/retry`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${state.adminToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Retry failed with HTTP ${response.status}`);
    }

    state.actionMessage = `Job ${jobId} reencolado`;
    await loadStatus();
  } catch (error) {
    console.warn(error);
    state.actionMessage = "No se pudo reencolar el job. Revisar token o API.";
    render();
  }
}

async function resolveCurrentSources(affectedLegalItemIds = []) {
  if (!state.adminToken) {
    state.actionMessage = "Para resolver fuentes vigentes, carga primero el token operativo.";
    render();
    return;
  }

  try {
    const response = await fetch(`${state.apiBase.replace(/\/$/, "")}/processing-review/affected-items/resolve-current-sources`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${state.adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        affectedLegalItemIds,
        limit: affectedLegalItemIds.length ? affectedLegalItemIds.length : 8
      })
    });

    if (!response.ok) {
      throw new Error(`Current source resolution failed with HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.actionMessage = `Fuentes vigentes: ${payload.counters?.resolved ?? 0} resueltas, ${payload.counters?.pending ?? 0} pendientes`;
    await loadStatus();
  } catch (error) {
    console.warn(error);
    state.actionMessage = "No se pudo resolver fuentes vigentes. Revisar token, API o fuente oficial.";
    render();
  }
}

async function resolveDiffCandidates(candidateIds = []) {
  if (!state.adminToken) {
    state.actionMessage = "Para generar diffs visibles, carga primero el token operativo.";
    render();
    return;
  }

  try {
    const response = await fetch(`${state.apiBase.replace(/\/$/, "")}/processing-review/diffs/resolve`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${state.adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        candidateIds,
        limit: candidateIds.length ? candidateIds.length : 25,
        enqueueFallback: true
      })
    });

    if (!response.ok) {
      throw new Error(`Diff resolution failed with HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.actionMessage = `Diffs: ${payload.counters?.validated ?? 0} validados, ${payload.counters?.partial ?? 0} parciales, ${payload.counters?.assisted ?? 0} asistidos, ${payload.counters?.fallbackQueued ?? 0} fallback`;
    await loadStatus();
  } catch (error) {
    console.warn(error);
    state.actionMessage = "No se pudo generar diffs visibles. Revisar token, API o migracion D1.";
    render();
  }
}

function renderEvidence(evidence) {
  if (!evidence || Object.keys(evidence).length === 0) {
    return "";
  }

  const parts = [
    evidence.detectedVerb ? `Verbo: ${evidence.detectedVerb}` : null,
    evidence.confidence ? `Confianza: ${evidence.confidence}` : null,
    evidence.sourceProvisionId ? `Provision: ${evidence.sourceProvisionId}` : null
  ].filter(Boolean);

  return `
    <div class="mini-list">
      <strong>Evidencia</strong>
      <span>${escapeHtml(parts.join(" | ") || "Referencia detectada")}</span>
      ${evidence.evidenceText ? `<span>${escapeHtml(evidence.evidenceText)}</span>` : ""}
    </div>
  `;
}

function renderCurrentSource(source) {
  if (!source || Object.keys(source).length === 0) {
    return "";
  }

  return `
    <div class="mini-list">
      <strong>Fuente vigente</strong>
      <span>${escapeHtml(source.status ?? "PENDING")}${source.lawNumber ? ` | Ley ${escapeHtml(source.lawNumber)}` : ""}</span>
      ${source.sourceUrl ? `<a class="secondary-action ops-source-link" href="${escapeHtml(source.sourceUrl)}" target="_blank" rel="noreferrer">Abrir fuente vigente</a>` : ""}
    </div>
  `;
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
