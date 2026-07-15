# Índice de Documentación — Frontend de TalentMatch AI

> 🇬🇧 English version: [`../en/README.md`](../en/README.md) · ⬆️ Selector de idioma: [`../README.md`](../README.md)

Esta carpeta contiene todos los documentos que describen el **frontend** de TalentMatch AI: qué es, cómo está construido, qué está roto y qué toca hacer después. Cada documento tiene su espejo en `docs/en/`.

**Última verificación completa contra el código fuente: 2026-07-14.**

---

## Por dónde empezar

| Si quieres…                                    | Lee                                                  |
| ---------------------------------------------- | ---------------------------------------------------- |
| Entender el proyecto desde cero                | [`front-documentation.md`](./front-documentation.md) |
| Llamar al backend                              | [`api-documentation.md`](./api-documentation.md)     |
| Saber qué está roto ahora mismo                | [`bugs.md`](./bugs.md)                               |
| Coger la siguiente tarea                       | [`issues.md`](./issues.md) → [`issues/`](./issues/)  |
| Enterarte de qué cambió hace poco y por qué    | [`last-changes.md`](./last-changes.md)               |

---

## Los documentos

### 📘 [`front-documentation.md`](./front-documentation.md)

**La referencia principal.** Describe el estado *real* del frontend, verificado contra el código: stack tecnológico real, estructura de carpetas, routing y guards de ruta, el cliente `fetch` hecho a mano y cómo desempaqueta el envelope del backend, autenticación y el watchdog de sesión, la capa de servicios API, el modelo de tipos, y un inventario pantalla por pantalla de cuáles están conectadas a la API real y qué particularidades tener en cuenta.

Empieza aquí. También lista la deuda técnica y las convenciones que debe seguir el código nuevo.

### 🔌 [`api-documentation.md`](./api-documentation.md)

**El contrato del backend**, endpoint por endpoint: autenticación, aislamiento multi-tenant, formas de request/response, enums, reglas de validación, y la peculiaridad de la doble envoltura de `sendResponseOr404`.

> ⚠️ Esto describe el *backend*. La fuente de verdad vive en el repositorio `talentmatch-backend` — esta es una copia de trabajo para el equipo de frontend y puede desincronizarse.

### 🐞 [`bugs.md`](./bugs.md)

**El inventario de bugs**, barriendo todas las rutas de `src/App.tsx`. Todas las pantallas están ya conectadas a la API real — lo que queda es una lista corta de ítems **menores y no bloqueantes**: bugs de código confirmados, un par de pantallas duplicadas/parcialmente huérfanas, código muerto, comentarios desactualizados y huecos de configuración/entorno. Incluye un anexo de bugs ya resueltos para que no se reabran, y una sección sobre **lo que las herramientas no detectan** (un build en verde no significa una UI correcta).

La premisa transversal: el backend está terminado y correcto, así que todo lo de aquí es trabajo de frontend.

### 🗂️ [`issues.md`](./issues.md)

**El índice del backlog.** Apunta a los planes de QA por pantalla en [`issues/`](./issues/) — cada uno documenta el flujo de datos de esa pantalla, los bugs identificados, y un checklist de pruebas completo (incluida la revisión de alineación con Figma: márgenes, tipografía, comportamiento responsive). Las pantallas sin un plan propio todavía se referencian a la sección correspondiente de `bugs.md`.

| Archivo                                                          | Pantalla                  |
| ---------------------------------------------------------------- | ---------------------------- |
| [`issues/dashboard.md`](./issues/dashboard.md)                  | Dashboard                   |
| [`issues/admin-panel.md`](./issues/admin-panel.md)              | Panel Admin                 |
| [`issues/position-history.md`](./issues/position-history.md)   | Historial de Posiciones     |
| [`issues/vacancy-history.md`](./issues/vacancy-history.md)     | Historial de Vacantes       |
| [`issues/department-history.md`](./issues/department-history.md) | Historial de Departamentos |
| [`issues/candidates-history.md`](./issues/candidates-history.md) | Historial de Candidatos   |
| [`issues/evaluations-history.md`](./issues/evaluations-history.md) | Evaluaciones             |

> El backlog anterior por EPICs (`issues/P0.md`–`P3.md`) fue reemplazado por estos planes por pantalla el 2026-07-13 — esos archivos ya no existen en este repositorio.

### 📋 [`last-changes.md`](./last-changes.md)

**El registro de ingeniería**, del más reciente al más antiguo. Explica no solo *qué* cambió sino *por qué*: la auditoría de alineación con la API, la limpieza del desempaquetado del envelope, los arreglos de P0 anteriores, la conexión real del admin/dashboard, y la actualización más reciente de la documentación.

---

## Estado actual de un vistazo

- ✅ **Todas las pantallas llaman a la API real.** No queda ninguna pantalla mock (antes: Dashboard y el Panel Admin corrían sobre datos falsos — ambos ya están conectados a `dashboardService`/`adminService`).
- ⚠️ **Particularidades menores, no bloqueantes:** Nueva/Editar Vacante ignora un callback de reset en su pantalla de éxito; dos pares de pantallas legacy solapadas/parcialmente sin enlazar (`Resultados` vs. `AdvancedResults`, `CVHistory` vs. `CandidatesHistory`); un puñado de código muerto y comentarios desactualizados. Detalle completo en [`bugs.md`](./bugs.md).

---

## Convenciones

- Estos documentos describen **el código tal como es**, no como debería ser. Cuando discrepen con el código, **manda el código** — corrige el documento.
- Todo cambio que toque routing, la capa de servicios, tipos o auth debería actualizar `front-documentation.md` y, cuando aplique, `bugs.md` / `issues.md`.
- Mantén los dos idiomas sincronizados: edita `docs/en/` y `docs/es/` en el mismo commit.
- Las reglas de trabajo para colaboradores (y para Claude Code) viven en [`../../CLAUDE.md`](../../CLAUDE.md), en la raíz del repo.
