# 🗂️ Backlog de Issues — TalentMatch Frontend

> Complementa a [`bugs.md`](./bugs.md). Aquí se agrupan los issues **por pantalla**, con un plan de arquitectura de datos, bugs identificados y un checklist de pruebas de QA (incluida alineación con Figma).
>
> 🇬🇧 English version: [`../en/issues.md`](../en/issues.md)
>
> **Premisa:** el backend está terminado y correcto. Todo lo de abajo es trabajo de frontend.
>
> **Última verificación contra el código: 2026-08-01.**

## Qué cambió respecto a versiones anteriores

Los backlogs anteriores (`issues/P0.md`–`P3.md`, organizados por EPICs) fueron **reemplazados el 2026-07-13** por planes de QA por pantalla — ya no existen `P0.md`–`P3.md` en este repositorio (si ves un enlace a ellos en algún documento viejo, está roto: usa las tablas de abajo). El sprint P0–P3 original ya está cerrado; el foco actual es una revisión de alineación con Figma (márgenes, responsive, checklist de pruebas) pantalla por pantalla.

## Planes de QA por pantalla

Cada archivo documenta: arquitectura/flujo de datos, bugs identificados (overflow del menú kebab, nombre de usuario en blanco, manejo del estado `PAUSED`, accesibilidad táctil, inconsistencias de márgenes) y un checklist completo de pruebas.

| Archivo                                              | Pantalla                  | Ruta(s)                                              |
| ------------------------------------------------------- | ---------------------------- | -------------------------------------------------------- |
| [`issues/dashboard.md`](./issues/dashboard.md)         | Dashboard                   | `/dashboard`                                             |
| [`issues/admin-panel.md`](./issues/admin-panel.md)     | Panel Admin                 | `/admin`                                                 |
| [`issues/position-history.md`](./issues/position-history.md) | Historial de Posiciones | `/position-history`                                      |
| [`issues/vacancy-history.md`](./issues/vacancy-history.md) | Historial de Vacantes    | `/vacancy-history`                                       |
| [`issues/department-history.md`](./issues/department-history.md) | Historial de Departamentos | `/department-history`                             |
| [`issues/candidates-history.md`](./issues/candidates-history.md) | Historial de Candidatos | `/candidates-history`                               |
| [`issues/evaluations-history.md`](./issues/evaluations-history.md) | Evaluaciones           | `/evaluations-history`                                    |

## Pantallas sin un plan de QA dedicado todavía

Estas pantallas no tienen un archivo de QA por pantalla propio. Sus bugs de código conocidos están en [`bugs.md`](./bugs.md):

| Pantalla                     | Ruta(s)                                            | Ver en `bugs.md`         |
| ------------------------------ | ----------------------------------------------------- | ---------------------------- |
| Login                        | `/login`                                             | —                             |
| Nueva/Editar Vacante         | `/vacancy`, `/vacancy/edit/:id`                       | §1.1 (`onReset` ignorado)     |
| Subir CV                     | `/uploadcv`                                          | —                             |
| Historial de CVs (legacy)    | `/cv-history`                                        | §2.2 (pantalla duplicada)     |
| Resultados (legacy)          | `/resultados`, `/resultados/:id`                      | §1.2, §2.1                    |
| Resultados Avanzados         | `/advanced-results/:id`                               | §1.3 (estados no persistidos) |
| Crear Posición               | `/position`                                          | —                             |
| Crear Departamento           | `/department`                                        | —                             |

## Bugs de código transversales

Los bugs que no son específicos de un margen/responsive de una pantalla, sino de lógica (props ignorados, parsing, código muerto, configuración), viven en [`bugs.md`](./bugs.md) — no se duplican aquí. Incluyen: el prop `onReset` ignorado en `VacancySuccess`, el bug de parsing en `CandidateMatchRow` (pantalla legacy), las pantallas duplicadas (`Resultados`/`AdvancedResults`, `CVHistory`/`CandidatesHistory`), componentes huérfanos, y la falta de fallback/`.env.example` para `VITE_API_URL`.

## Estado actual

**Todas las pantallas están conectadas a la API real** (ver `front-documentation.md §8`). El trabajo pendiente es de dos tipos:

1. **QA de alineación con Figma** (márgenes, tipografía, responsive) — cubierto por los 7 planes de pantalla arriba.
2. **Limpieza de bugs menores y deuda técnica** — cubierto por `bugs.md`.

Ninguno de los dos bloquea el uso normal de la aplicación.
