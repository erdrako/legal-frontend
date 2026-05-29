# Pantallas iniciales

## Busqueda

Permite buscar por:

- Titulo de norma.
- Numero.
- Concepto.
- Tema.
- Sujeto afectado.

## Ficha simple

Debe mostrar:

- Estado actual.
- Resumen en lenguaje claro.
- Sujetos afectados.
- Obligaciones.
- Prohibiciones.
- Derechos.
- Sanciones.
- Relaciones principales.
- Freshness.

## Vista tecnica

Debe mostrar:

- Texto legal completo.
- Articulos.
- Incisos.
- Fuentes.
- Citas.
- Relaciones.
- Historial normativo.
- Estado de revision.

## Timeline

Debe mostrar:

- Fecha de sancion.
- Publicacion.
- Entrada en vigencia.
- Modificaciones.
- Derogaciones.
- Reglamentaciones.
- Proyectos pendientes.

## Relaciones

Debe mostrar:

- Normas modificatorias.
- Reglamentaciones.
- Jurisprudencia seleccionada.
- Criterios administrativos.
- Doctrina vinculada.
- Proyectos pendientes.

## Pantalla inicial implementada

El repositorio incluye una primera app estatica:

```bash
npm start
```

Por defecto se sirve en:

```text
http://localhost:4173
```

Checks locales:

```bash
npm run check
```

Esta version usa un approved overview embebido para validar estructura visual. La siguiente iteracion debe conectarla con `legal-backend`.

