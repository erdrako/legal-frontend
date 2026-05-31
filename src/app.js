const PENDING_SOURCE_TEXT = "Fuente original pendiente de carga";
const captureTarget = new URLSearchParams(window.location.search).get("capture");

if (captureTarget === "diff" || captureTarget === "search") {
  document.documentElement.classList.add(`capture-${captureTarget}`);
}

const importedAt = "2026-05-31T13:00:00.000Z";
const sources = {
  senateConstitutional: {
    id: "senado-asuntos-constitucionales-agenda-2026-06",
    name: "Agenda oficial Senado - Asuntos Constitucionales",
    sourceUrl: "https://www.senado.gob.ar/parlamentario/comisiones/verAgenda/50",
    retrievedAt: importedAt,
    official: true
  },
  senateBudget: {
    id: "senado-presupuesto-agenda-2026-06",
    name: "Agenda oficial Senado - Presupuesto y Hacienda",
    sourceUrl: "https://www.senado.gob.ar/parlamentario/comisiones/verAgenda/54",
    retrievedAt: importedAt,
    official: true
  },
  deputiesAgenda: {
    id: "diputados-agenda-2026-06-03",
    name: "Agenda oficial Diputados",
    sourceUrl: "https://www.diputados.gob.ar/comisiones/agenda/",
    retrievedAt: importedAt,
    official: true
  }
};

function pendingOriginalSource(label) {
  return {
    status: "PENDING",
    label,
    note: PENDING_SOURCE_TEXT
  };
}

function topic(id, label, summaryPlainLanguage) {
  return { id, label, summaryPlainLanguage };
}

function group(id, label, impactSummary) {
  return { id, label, impactSummary };
}

function agendaItem({
  id,
  title,
  chamber,
  statusLabelForUsers,
  scheduledTreatmentDate,
  committees,
  officialDescription,
  plainLanguageSummary,
  topics,
  affectedGroups,
  source,
  sourceLinks,
  priority,
  queryExamples
}) {
  return {
    id,
    title,
    status: "IN_DEBATE",
    chamber,
    statusLabelForUsers,
    scheduledTreatmentDate,
    committees,
    officialDescription,
    plainLanguageSummary,
    typeOfChange: "Proyecto en agenda oficial",
    summary: {
      headline: title,
      short: plainLanguageSummary,
      keyPoints: [
        "Figura en una agenda oficial de comisiones del Congreso argentino.",
        "LexMapa muestra este item como cambio en debate con fuente trazable.",
        "La comparacion articulo por articulo todavia no esta cargada."
      ],
      whatItMeans: [
        "El tema esta proximo a tratarse o revisarse en comision.",
        "Hasta cargar los textos originales, no se muestran diffs legales inventados."
      ],
      limitations: [
        "Dato importado manualmente desde agenda oficial.",
        "Texto propuesto original pendiente de carga.",
        "No hay diff legal articulo por articulo cargado."
      ],
      legalAdviceWarning:
        "LexMapa explica cambios legales en lenguaje simple, pero no brinda asesoramiento legal personalizado."
    },
    topics,
    affectedGroups,
    diffs: [],
    queryExamples,
    source,
    sourceLinks,
    sourceStatus: "LOADED",
    priority,
    dataKind: "REAL_AGENDA_ITEM",
    importedFrom: sourceLinks.officialAgendaSourceUrl,
    importedAt,
    lastCheckedAt: importedAt,
    originalSources: {
      current: pendingOriginalSource("Texto vigente original"),
      proposed: pendingOriginalSource("Texto propuesto original")
    },
    dataStatus: "REAL_AGENDA_ITEM",
    updatedAt: importedAt,
    scopeNote: "Dato real de agenda oficial. No incluye todavia texto del proyecto ni comparacion juridica.",
    legalAdviceWarning: "LexMapa no brinda asesoramiento legal personalizado. Verifique siempre la fuente legal aplicable."
  };
}

const fallbackProposals = [
  agendaItem({
    id: "ley-hojarasca",
    title: "Ley Hojarasca",
    chamber: "SENATE",
    statusLabelForUsers: "En tratamiento en comision",
    scheduledTreatmentDate: "2026-06-03T12:30:00-03:00",
    committees: ["Asuntos Constitucionales", "Legislacion General"],
    officialDescription: "Proyecto de ley en revision que deroga legislacion obsoleta \"Ley de Hojarasca\".",
    plainLanguageSummary: "Proyecto que propone derogar leyes consideradas obsoletas o sin aplicacion actual.",
    topics: [
      topic("legislacion-obsoleta", "Legislacion obsoleta", "Normas que podrian dejar de tener utilidad practica o vigencia material."),
      topic("derogaciones", "Derogaciones", "Cambios que eliminan normas anteriores."),
      topic("administracion-publica", "Administracion publica", "Organismos estatales que aplican o dejan de aplicar reglas."),
      topic("simplificacion-normativa", "Simplificacion normativa", "Intentos de ordenar o reducir reglas legales acumuladas.")
    ],
    affectedGroups: [
      group("ciudadanos", "Ciudadanos", "Podrian verse alcanzados si alguna norma derogada regulaba tramites, derechos u obligaciones."),
      group("administracion-publica", "Administracion publica", "Podria tener menos normas formales que revisar o aplicar."),
      group("sectores-regulados", "Sectores regulados", "Sectores alcanzados por normas derogadas podrian necesitar revisar el alcance real del cambio.")
    ],
    source: sources.senateConstitutional,
    sourceLinks: { officialAgendaSourceUrl: "https://www.senado.gob.ar/parlamentario/comisiones/verAgenda/50" },
    priority: "HIGH",
    queryExamples: ["hojarasca", "ley hojarasca", "legislacion obsoleta", "derogaciones"]
  }),
  agendaItem({
    id: "super-rigi",
    title: "Super RIGI",
    chamber: "DEPUTIES",
    statusLabelForUsers: "En tratamiento en comision",
    scheduledTreatmentDate: "2026-06-03T15:00:00-03:00",
    committees: ["Presupuesto y Hacienda", "Industria", "Ciencia, Tecnologia e Innovacion Productiva"],
    officialDescription: "Mensaje nro. 181/2026 y proyecto de ley por el cual se establece un regimen de incentivo para grandes inversiones en nuevas industrias (\"SUPER RIGI\").",
    plainLanguageSummary: "Proyecto que propone beneficios e incentivos para grandes inversiones en nuevas industrias.",
    topics: [
      topic("inversiones", "Inversiones", "Reglas que buscan atraer o regular inversiones de gran escala."),
      topic("industria", "Industria", "Actividades productivas y nuevas industrias."),
      topic("tecnologia", "Tecnologia", "Sectores tecnologicos o de innovacion productiva."),
      topic("beneficios-fiscales", "Beneficios fiscales", "Posibles ventajas tributarias o economicas previstas por el regimen."),
      topic("estabilidad-normativa", "Estabilidad normativa", "Reglas que podrian mantener condiciones legales durante cierto plazo.")
    ],
    affectedGroups: [
      group("empresas", "Empresas", "Podrian evaluar nuevos incentivos para proyectos de inversion."),
      group("inversores", "Inversores", "Podrian recibir condiciones especiales si el proyecto avanza."),
      group("estado", "Estado", "Podria asumir compromisos fiscales o regulatorios vinculados a inversiones."),
      group("trabajadores", "Trabajadores", "Podrian verse afectados indirectamente por proyectos industriales o tecnologicos."),
      group("provincias", "Provincias", "Podrian intervenir segun la localizacion de proyectos.")
    ],
    source: sources.deputiesAgenda,
    sourceLinks: {
      officialAgendaSourceUrl: "https://www.diputados.gob.ar/comisiones/agenda/",
      officialCitationUrl: "https://parlamentaria.hcdn.gob.ar/comisiones/reuniones/1219/archivo/SXDQ9KZANPP5QTHY.pdf"
    },
    priority: "HIGH",
    queryExamples: ["super rigi", "rigi", "grandes inversiones", "incentivos industriales"]
  }),
  agendaItem({
    id: "transparencia-gestion-intereses",
    title: "Regimen de transparencia y publicidad de la gestion de intereses",
    chamber: "DEPUTIES",
    statusLabelForUsers: "En tratamiento en comision / reunion informativa",
    scheduledTreatmentDate: "2026-06-03T14:00:00-03:00",
    committees: ["Asuntos Constitucionales", "Legislacion General"],
    officialDescription: "Regimen de transparencia y publicidad de la gestion de intereses.",
    plainLanguageSummary: "Proyecto para regular y transparentar la gestion de intereses ante funcionarios o autoridades publicas.",
    topics: [
      topic("transparencia", "Transparencia", "Reglas para hacer visible informacion de interes publico."),
      topic("lobby", "Lobby", "Gestiones de intereses ante funcionarios o autoridades."),
      topic("etica-publica", "Etica publica", "Estandares de conducta y publicidad en la funcion publica."),
      topic("acceso-informacion", "Acceso a informacion", "Disponibilidad de datos sobre gestiones o decisiones publicas.")
    ],
    affectedGroups: [
      group("ciudadanos", "Ciudadanos", "Podrian acceder a mas informacion sobre gestiones ante autoridades."),
      group("funcionarios", "Funcionarios", "Podrian tener nuevas obligaciones de registro o publicidad."),
      group("empresas", "Empresas", "Podrian tener reglas mas claras para gestiones de interes."),
      group("organizaciones-civiles", "Organizaciones civiles", "Podrian quedar comprendidas si realizan gestiones ante autoridades.")
    ],
    source: sources.deputiesAgenda,
    sourceLinks: {
      officialAgendaSourceUrl: "https://www.diputados.gob.ar/comisiones/agenda/",
      officialCitationUrl: "https://parlamentaria.hcdn.gob.ar/comisiones/reuniones/1218/archivo/NXJK7ZVD9M8CC6PJ.pdf"
    },
    priority: "HIGH",
    queryExamples: ["lobby", "transparencia", "gestion de intereses", "etica publica"]
  }),
  agendaItem({
    id: "biocombustibles",
    title: "Biocombustibles",
    chamber: "SENATE",
    statusLabelForUsers: "En tratamiento en comision",
    scheduledTreatmentDate: "2026-06-03T14:00:00-03:00",
    committees: ["Mineria, Energia y Combustibles", "Presupuesto y Hacienda"],
    officialDescription: "Proyectos S-1271/25, S-1861/25, S-3/26, S-809/26 y S-916/26 sobre modificacion o regulacion del regimen de biocombustibles.",
    plainLanguageSummary: "Distintos proyectos proponen modificar o reemplazar reglas sobre biocombustibles, porcentajes de mezcla y marco regulatorio.",
    topics: [
      topic("energia", "Energia", "Reglas vinculadas al abastecimiento y uso energetico."),
      topic("combustibles", "Combustibles", "Mezcla, produccion o comercializacion de combustibles."),
      topic("biodiesel", "Biodiesel", "Biocombustible que puede mezclarse con gasoil."),
      topic("bioetanol", "Bioetanol", "Biocombustible que puede mezclarse con nafta."),
      topic("agroindustria", "Agroindustria", "Sectores productivos vinculados a insumos y produccion de biocombustibles."),
      topic("transporte", "Transporte", "Actividad que usa combustibles y podria verse afectada por mezclas obligatorias.")
    ],
    affectedGroups: [
      group("productores", "Productores", "Podrian tener nuevas reglas de produccion, cuotas o comercializacion."),
      group("consumidores", "Consumidores", "Podrian verse afectados indirectamente en precios o disponibilidad de combustibles."),
      group("estaciones-servicio", "Estaciones de servicio", "Podrian tener cambios en reglas de venta o mezcla."),
      group("transporte", "Transporte", "Podria verse impactado por cambios en combustibles disponibles."),
      group("estado", "Estado", "Podria regular cortes, cronogramas y condiciones del mercado.")
    ],
    source: sources.senateBudget,
    sourceLinks: { officialAgendaSourceUrl: "https://www.senado.gob.ar/parlamentario/comisiones/verAgenda/54" },
    priority: "MEDIUM_HIGH",
    queryExamples: ["biocombustibles", "biodiesel", "bioetanol", "combustibles", "corte obligatorio"]
  }),
  agendaItem({
    id: "convenios-seguridad-social-suiza-san-marino",
    title: "Convenios de Seguridad Social con Suiza y San Marino",
    chamber: "DEPUTIES",
    statusLabelForUsers: "En tratamiento en comision",
    scheduledTreatmentDate: "2026-06-03T12:00:00-03:00",
    committees: ["Relaciones Exteriores y Culto", "Prevision y Seguridad Social"],
    officialDescription: "Proyectos que aprueban convenios de Seguridad Social entre Argentina y Suiza, y entre Argentina y San Marino, junto con sus acuerdos administrativos.",
    plainLanguageSummary: "Proyectos para coordinar reglas de seguridad social, aportes y beneficios entre Argentina y esos paises.",
    topics: [
      topic("jubilaciones", "Jubilaciones", "Beneficios previsionales y reglas para acceder a ellos."),
      topic("aportes", "Aportes", "Contribuciones o periodos que pueden computarse para seguridad social."),
      topic("seguridad-social", "Seguridad social", "Sistema de beneficios, aportes y cobertura social."),
      topic("trabajadores-migrantes", "Trabajadores migrantes", "Personas que trabajan o trabajaron en mas de un pais.")
    ],
    affectedGroups: [
      group("trabajadores-argentinos-exterior", "Trabajadores argentinos en el exterior", "Podrian necesitar coordinar aportes o beneficios con Argentina."),
      group("extranjeros-en-argentina", "Extranjeros en Argentina", "Podrian quedar alcanzados por reglas de coordinacion previsional."),
      group("jubilados", "Jubilados", "Podrian verse afectados por reconocimiento o coordinacion de beneficios."),
      group("aportantes", "Aportantes", "Podrian requerir informacion sobre periodos aportados en distintos paises.")
    ],
    source: sources.deputiesAgenda,
    sourceLinks: {
      officialAgendaSourceUrl: "https://www.diputados.gob.ar/comisiones/agenda/",
      officialCitationUrl: "https://parlamentaria.hcdn.gob.ar/comisiones/reuniones/1216/archivo/VXHSC47J9SJQDPRF.pdf"
    },
    priority: "MEDIUM",
    queryExamples: ["seguridad social", "Suiza", "San Marino", "jubilaciones", "aportes"]
  }),
  agendaItem({
    id: "convenio-argentina-francia-doble-imposicion",
    title: "Convenio Argentina-Francia sobre doble imposicion",
    chamber: "DEPUTIES",
    statusLabelForUsers: "En tratamiento en comision",
    scheduledTreatmentDate: "2026-06-03T10:00:00-03:00",
    committees: ["Relaciones Exteriores y Culto", "Presupuesto y Hacienda"],
    officialDescription: "Proyecto de ley por el cual se aprueba el Protocolo de enmienda al Convenio entre Argentina y Francia para evitar la doble imposicion y prevenir la evasion fiscal en materia de impuestos sobre la renta y el patrimonio.",
    plainLanguageSummary: "Proyecto para actualizar reglas tributarias entre Argentina y Francia y evitar que ciertos ingresos o patrimonios tributen dos veces.",
    topics: [
      topic("impuestos", "Impuestos", "Reglas sobre tributos aplicables a renta o patrimonio."),
      topic("inversiones", "Inversiones", "Operaciones economicas entre Argentina y Francia."),
      topic("tratados-internacionales", "Tratados internacionales", "Acuerdos entre Estados que requieren aprobacion legislativa."),
      topic("evasion-fiscal", "Evasion fiscal", "Reglas para prevenir incumplimientos tributarios.")
    ],
    affectedGroups: [
      group("empresas", "Empresas", "Podrian revisar reglas fiscales para operaciones entre ambos paises."),
      group("inversores", "Inversores", "Podrian verse alcanzados por reglas para evitar doble tributacion."),
      group("personas-actividad-argentina-francia", "Personas con actividad economica entre Argentina y Francia", "Podrian necesitar revisar si el convenio modifica su situacion fiscal.")
    ],
    source: sources.deputiesAgenda,
    sourceLinks: {
      officialAgendaSourceUrl: "https://www.diputados.gob.ar/comisiones/agenda/",
      officialCitationUrl: "https://parlamentaria.hcdn.gob.ar/comisiones/reuniones/1215/archivo/PVN7M7QAVY7MX067.pdf"
    },
    priority: "MEDIUM",
    queryExamples: ["doble imposicion", "Francia", "impuestos", "tratado tributario"]
  }),
  agendaItem({
    id: "acuerdo-pesca-ilegal",
    title: "Acuerdo contra pesca ilegal",
    chamber: "DEPUTIES",
    statusLabelForUsers: "En tratamiento en comision",
    scheduledTreatmentDate: "2026-06-03T11:00:00-03:00",
    committees: ["Relaciones Exteriores y Culto", "Intereses Maritimos, Fluviales, Pesqueros y Portuarios"],
    officialDescription: "Proyecto de ley por el cual se aprueba el Acuerdo sobre medidas del Estado Rector del Puerto destinadas a prevenir, desalentar y eliminar la pesca ilegal, no declarada y no reglamentada, celebrado en Roma el 22 de noviembre de 2009 en el marco de la FAO.",
    plainLanguageSummary: "Proyecto para aprobar un acuerdo internacional orientado a combatir la pesca ilegal.",
    topics: [
      topic("pesca", "Pesca", "Actividad pesquera y control de recursos maritimos."),
      topic("ambiente", "Ambiente", "Proteccion de recursos naturales y ecosistemas."),
      topic("comercio-exterior", "Comercio exterior", "Reglas sobre ingreso, salida o control de productos."),
      topic("puertos", "Puertos", "Controles y medidas vinculadas al Estado rector del puerto.")
    ],
    affectedGroups: [
      group("sector-pesquero", "Sector pesquero", "Podria quedar alcanzado por controles o medidas portuarias."),
      group("puertos", "Puertos", "Podrian tener nuevas responsabilidades de control."),
      group("estado", "Estado", "Podria asumir obligaciones de control internacional."),
      group("ambiente", "Ambiente", "Podria verse protegido frente a practicas ilegales de pesca.")
    ],
    source: sources.deputiesAgenda,
    sourceLinks: {
      officialAgendaSourceUrl: "https://www.diputados.gob.ar/comisiones/agenda/",
      officialCitationUrl: "https://parlamentaria.hcdn.gob.ar/comisiones/reuniones/1214/archivo/MQEWR88X1SV5XNWQ.pdf"
    },
    priority: "MEDIUM_LOW",
    queryExamples: ["pesca ilegal", "pesca", "FAO", "puertos"]
  }),
  agendaItem({
    id: "parque-marino-monte-leon",
    title: "Parque Interjurisdiccional Marino Monte Leon",
    chamber: "SENATE",
    statusLabelForUsers: "En reunion de asesores",
    scheduledTreatmentDate: "2026-06-02T12:30:00-03:00",
    committees: ["Asuntos Constitucionales", "Ambiente y Desarrollo Sustentable"],
    officialDescription: "Proyecto de ley que aprueba el convenio de creacion del Parque Interjurisdiccional Marino Monte Leon entre el Estado Nacional y la Provincia de Santa Cruz.",
    plainLanguageSummary: "Proyecto para aprobar la creacion de un parque marino interjurisdiccional.",
    topics: [
      topic("ambiente", "Ambiente", "Proteccion ambiental y conservacion."),
      topic("areas-protegidas", "Areas protegidas", "Espacios con reglas especiales de conservacion."),
      topic("santa-cruz", "Santa Cruz", "Provincia vinculada al convenio de creacion."),
      topic("conservacion-marina", "Conservacion marina", "Proteccion de ecosistemas y biodiversidad marina.")
    ],
    affectedGroups: [
      group("ciudadanos", "Ciudadanos", "Podrian tener nuevos espacios de proteccion o uso regulado."),
      group("estado-nacional", "Estado nacional", "Podria compartir gestion o responsabilidades sobre el parque."),
      group("provincia-santa-cruz", "Provincia de Santa Cruz", "Podria intervenir en la administracion del area."),
      group("sectores-ambientales", "Sectores ambientales", "Podrian participar o monitorear la conservacion del area.")
    ],
    source: sources.senateConstitutional,
    sourceLinks: { officialAgendaSourceUrl: "https://www.senado.gob.ar/parlamentario/comisiones/verAgenda/50" },
    priority: "MEDIUM_LOW",
    queryExamples: ["Monte Leon", "parque marino", "Santa Cruz", "areas protegidas"]
  })
];

const fallbackProposal = fallbackProposals[0];

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
    ${renderSourceUrl(sourceLinks.officialCitationUrl, "Ver citacion oficial")}
    ${sourceLinks.currentLawOriginalUrl ? renderSourceUrl(sourceLinks.currentLawOriginalUrl, "Ver texto vigente original") : renderOriginalSource(sources.current, "Ver texto vigente original")}
    ${sourceLinks.proposedTextOriginalUrl ? renderSourceUrl(sourceLinks.proposedTextOriginalUrl, "Ver texto propuesto original") : renderOriginalSource(sources.proposed, "Ver texto propuesto original")}
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
