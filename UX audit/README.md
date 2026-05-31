# UX Audit

Auditoria UX operativa de LexMapa.

Este directorio contiene el runner que ejecuta la auditoria completa de la
experiencia visual y deja evidencia en archivos:

- `ux-audit.md`
- `ux-audit.json`
- `ux-audit-summary.md`
- `ux-audit-screenshots/`

## Ejecutar

Desde `legal-frontend`:

```powershell
npm run audit:ux:full
```

O directamente:

```powershell
powershell -ExecutionPolicy Bypass -File ".\UX audit\run-ux-audit.ps1"
```

## Que hace

1. Levanta el frontend local en un puerto temporal.
2. Ejecuta la auditoria UX estatica.
3. Abre Chrome en modo headless.
4. Genera screenshots desktop y mobile.
5. Guarda todo dentro de esta carpeta.

## Screenshots

Las capturas quedan en:

```text
UX audit/ux-audit-screenshots
```

Archivos generados:

- `home-desktop.png`
- `home-mobile.png`
- `diff-desktop.png`

## Nota

La auditoria necesita Google Chrome o Microsoft Edge instalado localmente.
No reemplaza pruebas con usuarios; deja evidencia rapida para revisar la
experiencia antes de deployar.
