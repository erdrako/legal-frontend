# LexMapa Frontend

Repositorio publico para la experiencia visual de LexMapa.

## Responsabilidad

`legal-frontend` muestra cambios legales de forma clara, navegable y trazable.

Puede:

- Buscar preguntas legales en lenguaje simple.
- Mostrar propuestas o reformas relevantes.
- Comparar texto actual vs texto propuesto.
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

La pantalla inicial esta orientada al caso:

```text
Que cambia con la reforma laboral
```

Incluye busqueda, resumen simple, temas afectados, grupos impactados, diff
texto actual vs texto propuesto, explicacion practica y trazabilidad visible.
El fixture embebido es manual y acotado; no representa asesoramiento legal.

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
UX audit/ux-audit-screenshots
```
