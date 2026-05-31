# UX Audit

LexMapa incluye una auditoria UX reproducible para cuidar que el MVP siga
orientado a personas no juridicas.

La auditoria revisa heuristicas estaticas sobre:

- busqueda en lenguaje simple;
- resumen antes del texto legal;
- temas afectados;
- grupos impactados;
- diff texto actual vs texto propuesto;
- explicacion `que cambia` y `que significa`;
- fuente, estado, alcance y advertencia legal;
- accesibilidad basica;
- layout responsive;
- estabilidad tipografica.

## Uso

Generar reporte:

```bash
npm run audit:ux
```

Validar sin escribir archivos:

```bash
npm run audit:ux:check
```

El reporte se escribe en:

```text
reports/ux-audit.latest.md
reports/ux-audit.latest.json
```

## Regla de uso

Ejecutar la auditoria despues de cambios significativos de frontend y antes de
deployar una nueva experiencia publica.

Esta auditoria no reemplaza pruebas con usuarios. Es una red de seguridad para
evitar que la UI vuelva a depender de terminologia juridica, numeros de ley o
texto legal denso como primera puerta de entrada.
