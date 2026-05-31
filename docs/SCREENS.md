# Pantallas iniciales

## Pantalla principal MVP

Caso guia:

```text
Que se trata sobre Ley Hojarasca
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
- datos de agenda: camara, fecha de tratamiento y comisiones;
- comparacion texto vigente vs texto propuesto cuando esta cargada;
- fuentes originales de la propuesta y de cada diff;
- respuesta contextual cuando la busqueda coincide con temas, grupos o diffs
  concretos.

## Reglas UX

- El texto legal original debe estar siempre disponible.
- La explicacion simple no reemplaza la fuente legal.
- Fuente vigente, fuente propuesta, estado y alcance se muestran en pantalla.
- Si falta una fuente original, se muestra `Fuente original pendiente de carga`.
- Si falta texto vigente/propuesto, se muestra
  `Comparacion articulo por articulo pendiente de carga`.
- La herramienta no se presenta como asesoramiento legal personalizado.
- El usuario no juridico debe entender el cambio sin navegar primero por una
  ficha tecnica.
- No hay accesos rapidos/chips destacados debajo del buscador en esta etapa.
- Una pregunta especifica debe orientar al usuario hacia los diffs relacionados,
  no solo abrir la propuesta general.

## Busqueda

Preguntas esperadas para el MVP:

- `hojarasca`
- `super rigi`
- `transparencia`
- `biocombustibles`
- `pesca ilegal`
- `seguridad social`
- `doble imposicion`

Cuando una busqueda coincide con un tema, grupo impactado o diff especifico, la
vista debe mostrar una respuesta breve y orientar a la propuesta relacionada.
Tambien puede abrirse una busqueda desde URL usando `?q=`.

## Vista diff

Cuando los textos estan cargados, cada cambio muestra:

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

Cuando los textos todavia no estan cargados, la seccion muestra un estado
pendiente profesional y no inventa contenido legal.

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
