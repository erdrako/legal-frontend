# Pantallas iniciales

## Pantalla principal MVP

Caso guia:

```text
Que cambia con la reforma laboral
```

La primera pantalla no debe depender de numeros de ley, articulos o jerga
juridica. Debe iniciar desde una pregunta simple y llevar a una comparacion
legal clara.

Secciones implementadas:

- hero con buscador en lenguaje simple;
- cambios en debate;
- cambios recientes;
- explorar por tema;
- normas importantes;
- como leer LexMapa;
- detalle de propuesta/reforma;
- comparacion texto vigente vs texto propuesto;
- fuentes originales de la propuesta y de cada diff.

## Reglas UX

- El texto legal original debe estar siempre disponible.
- La explicacion simple no reemplaza la fuente legal.
- Fuente vigente, fuente propuesta, estado y alcance se muestran en pantalla.
- Si falta una fuente original, se muestra `Fuente original pendiente de carga`.
- La herramienta no se presenta como asesoramiento legal personalizado.
- El usuario no juridico debe entender el cambio sin navegar primero por una
  ficha tecnica.
- No hay accesos rapidos/chips destacados debajo del buscador en esta etapa.

## Busqueda

Preguntas esperadas para el MVP:

- `que cambia con la reforma laboral`
- `que cambia para los trabajadores`
- `que pasa con las indemnizaciones`
- `que cambia en el periodo de prueba`

## Vista diff

Cada cambio muestra:

- titulo;
- tipo de cambio: agregado, eliminado o modificado;
- tema afectado;
- grupo impactado;
- texto actual;
- texto propuesto;
- explicacion simple;
- impacto practico;
- fuente y estado del dato.
- fuente vigente original;
- fuente propuesta original;
- estado de fuente: `LOADED` o `PENDING`.

## Ejecucion local

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

Puede consumir un backend local pasando `api` en la URL:

```text
http://localhost:4173?api=http://localhost:3000
```

Para produccion se puede generar o reemplazar:

```text
config.js
```

con:

```js
window.LEXMAPA_CONFIG = {
  apiBaseUrl: "https://lexmapa-api.linqorait.com"
};
```
