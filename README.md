# LexMapa Frontend

Repositorio publico para la experiencia visual de LexMapa.

## Responsabilidad

`legal-frontend` muestra cambios legales de forma clara, navegable y trazable.

Puede:

- Buscar preguntas legales en lenguaje simple.
- Mostrar propuestas o reformas relevantes.
- Comparar texto actual vs texto propuesto cuando esa comparacion esta cargada.
- Explicar que cambia y que significa.
- Mostrar temas afectados y grupos impactados.
- Mostrar fuente, estado del dato y alcance.
- Buscar items legales como soporte.
- Mostrar fichas simples.
- Mostrar vistas tecnicas.
- Mostrar disposiciones.
- Mostrar relaciones.
- Mostrar timeline.
- Mostrar comparaciones de versiones.
- Mostrar fuentes, citas, confianza y estado de revision.

No puede:

- Consumir fuentes legales externas directamente.
- Hacer scraping.
- Aprobar datos.
- Ocultar que un dato esta pendiente de revision.
- Presentar explicaciones como asesoramiento legal personalizado.

## Documentacion

- [Principios UX](./docs/UX_PRINCIPLES.md)
- [Auditoria UX](./docs/UX_AUDIT.md)
- [Pantallas iniciales](./docs/SCREENS.md)
- [Estados visibles](./docs/VISIBLE_STATES.md)
- [Integracion con contratos](./docs/CONTRACT_INTEGRATION.md)

## Principio de interfaz

La UI debe ayudar a personas no especialistas a entender que cambia con una reforma, pero siempre debe permitir volver al texto legal original y a la fuente.

## MVP actual

La pantalla inicial esta orientada al vertical slice de Senado con items reales
proximos a tratarse:

```text
hojarasca
biocombustibles
parque marino
Monte Leon
Santa Cruz
```

Incluye busqueda, resumen simple, camara, fecha de tratamiento, comisiones,
temas afectados, grupos impactados, fuentes oficiales y trazabilidad visible.
El fixture embebido se deriva de la importacion deterministica del Worker sobre
agendas oficiales del Senado; no representa asesoramiento legal.

Si una propuesta todavia no tiene textos vigente/propuesto cargados, la vista
muestra `Comparacion articulo por articulo pendiente de carga` y mantiene
visibles las fuentes originales pendientes.

Cuando la busqueda coincide con un tema, grupo o cambio concreto, la pantalla
muestra una respuesta breve y orienta hacia la propuesta correspondiente.

La home esta organizada por secciones:

- Hero con buscador en lenguaje simple.
- Cambios en debate.
- Cambios recientes.
- Explorar por tema.
- Normas importantes.
- Como leer LexMapa.

Por ahora no usa accesos rapidos/chips debajo del buscador.

## Estado operativo

La pagina separada `ops.html` muestra una vista de lectura para el procesador
remoto. En Cloudflare Pages queda disponible como:

```text
https://lexmapa.linqorait.com/ops
```

```text
procesadores registrados
ultimo heartbeat
tier y modelo
job actual
conteos de cola
jobs recientes
```

No permite enrolar procesadores ni crear jobs desde el navegador. Es una vista
de monitoreo para el vertical slice tecnico del procesador remoto.

## Auditoria UX

```bash
npm run audit:ux
npm run audit:ux:check
npm run audit:ux:full
```

El check general tambien ejecuta la auditoria:

```bash
npm run check
```

La auditoria completa deja evidencia en:

```text
../UX audit/ux-audit-screenshots
```
