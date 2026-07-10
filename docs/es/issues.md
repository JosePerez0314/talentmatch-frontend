# 🗂️ Backlog de Issues por Flujo — TalentMatch Frontend

> Complementa a [`bugs.md`](./bugs.md). Aquí los bugs se **agrupan por flujo** siguiendo la [`api-documentation.md`](./api-documentation.md) y se ordenan de **más importante a menos**.
>
> 🇬🇧 English version: [`../en/issues.md`](../en/issues.md)
>
> **Premisa:** el backend está terminado y correcto. Todo lo de abajo es trabajo de frontend.
>
> **Última verificación contra el código: 2026-07-09.**

## Leyenda de prioridad

| Nivel  | Significado                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------- |
| **P0** | Bugs invisibles (la UI promete datos que la API no entrega) y validación del sprint anterior. Hacer primero. |
| **P2** | Pantalla polida, paginación consistente, endpoints huérfanos y housekeeping. Nada bloquea.               |

Los backlogs anteriores (P0–P4 con los EPICs 1–11) fueron reemplazados el 2026-07-09 tras cerrar el sprint P0/P1/P2/P3 y hacer un review completo de la app. La historia sigue disponible en `git log` — este índice refleja únicamente el trabajo pendiente **hoy**.

## Documentos detallados por prioridad

| Archivo                          | Prioridad                          | EPICs                                                              | Estado       |
| -------------------------------- | ---------------------------------- | ------------------------------------------------------------------ | ------------ |
| [`issues/P0.md`](./issues/P0.md) | **P0** — bloqueantes               | 12 (datos que la UI promete y no llegan), 13 (validación del sprint) | ⏳ Pendiente |
| [`issues/P2.md`](./issues/P2.md) | **P2** — polish y housekeeping     | 14 (robustez UI), 15 (responsive), 16 (paginación), 17 (endpoints huérfanos), 18 (housekeeping) | ⏳ Pendiente |

## Estado actual

**Sprint anterior (commits `80263da`…`f6feba2`, 2026-07-08 → 2026-07-09):** cerrado a nivel de código pero **sin verificar en navegador** (ver P0 13.1). Los flujos principales están conectados: dashboard sobre `/dashboard`, panel admin sobre `/admin/*`, carga/listado/edición de vacantes y posiciones, resultados de matching, autenticación con rol.

**Foco actual:** los bugs invisibles del review — `CandidateDetailsModal` con 6 barras a cero, `HistoryTable` con el link de CV muerto, y el copy engañoso del botón "Contratar". Ninguno rompe el compile ni el build, pero minan la confianza en lo que la UI muestra al usuario.

## Resumen rápido de prioridades

| EPIC | Flujo                                    | Prioridad | Estado       | Depende de                    |
| ---- | ---------------------------------------- | --------- | ------------ | ----------------------------- |
| 12   | Datos que la UI promete y no llegan      | **P0**    | ⏳ Pendiente | Contrato del backend (12.1)   |
| 13   | Validación del sprint anterior            | **P0**    | ⏳ Pendiente | Dev server + backend en vivo  |
| 14   | Robustez UI (labels, fallbacks)          | **P2**    | ⏳ Pendiente | —                             |
| 15   | Dashboard responsive                     | **P2**    | ⏳ Pendiente | —                             |
| 16   | Paginación consistente                   | **P2**    | ⏳ Pendiente | —                             |
| 17   | Endpoints huérfanos (register, candidates/:id) | **P2** | ⏳ Pendiente | Decisión de producto        |
| 18   | Deuda pre-existente + housekeeping       | **P2**    | ⏳ Pendiente | —                             |
