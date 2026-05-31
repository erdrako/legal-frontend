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

- busqueda en lenguaje simple;
- preguntas sugeridas;
- resultado principal de propuesta/reforma;
- resumen simple;
- temas afectados;
- grupos impactados;
- diff texto actual vs texto propuesto;
- explicacion `que cambia`;
- explicacion `que significa`;
- fuente, estado del dato, alcance y advertencia.

## Reglas UX

- El texto legal original debe estar siempre disponible.
- La explicacion simple no reemplaza la fuente legal.
- Fuente, estado y alcance se muestran en pantalla.
- La herramienta no se presenta como asesoramiento legal personalizado.
- El usuario no juridico debe entender el cambio sin navegar primero por una
  ficha tecnica.

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
