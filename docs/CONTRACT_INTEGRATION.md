# Integracion con legal-contracts

## Rol de este repositorio

`legal-frontend` consume la API de `legal-backend`, que debe alinearse con `legal-contracts`.

Contratos de referencia:

```text
legal-contracts/openapi/backend.v1.yaml
legal-contracts/src/index.ts
```

## Datos visibles

La UI debe representar explicitamente:

- Estado legal.
- Estado de revision.
- Nivel de confianza.
- Freshness.
- Citas y fuentes.

## Prohibido

La UI no debe consumir:

- Candidate bundles.
- Raw data.
- Fuentes externas directamente.

## Regla de producto

Si una respuesta del backend indica baja confianza, dato desactualizado o cambios pendientes, la UI debe mostrarlo como estado visible y no como una nota escondida.

