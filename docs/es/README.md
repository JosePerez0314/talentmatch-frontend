# Índice de Documentación — Frontend de TalentMatch AI

> 🇬🇧 English version: [`../en/README.md`](../en/README.md) · ⬆️ Selector de idioma: [`../README.md`](../README.md)

Esta carpeta contiene todos los documentos que describen el **frontend** de TalentMatch AI: qué es, cómo está construido, qué está roto y qué toca hacer después. Cada documento tiene su espejo en `docs/en/`.

**Última verificación completa contra el código fuente: 2026-07-09.**

---

## Por dónde empezar

| Si quieres…                                    | Lee                                                  |
| ---------------------------------------------- | ---------------------------------------------------- |
| Entender el proyecto desde cero                | [`front-documentation.md`](./front-documentation.md) |
| Llamar al backend                              | [`api-documentation.md`](./api-documentation.md)     |
| Saber qué está roto ahora mismo                | [`bugs.md`](./bugs.md)                               |
| Coger la siguiente tarea                       | [`issues.md`](./issues.md) → `issues/P0–P3.md`       |
| Enterarte de qué cambió hace poco y por qué    | [`last-changes.md`](./last-changes.md)               |

---

## Los documentos

### 📘 [`front-documentation.md`](./front-documentation.md)

**La referencia principal.** Describe el estado *real* del frontend, verificado contra el código: stack tecnológico real, estructura de carpetas, routing y guards de ruta, el cliente `fetch` hecho a mano y cómo desempaqueta el envelope del backend, autenticación y el watchdog de sesión, la capa de servicios API, el modelo de tipos, y un inventario pantalla por pantalla de cuáles están realmente conectadas a la API y cuáles siguen con datos mock.

Empieza aquí. También lista la deuda técnica y las convenciones que debe seguir el código nuevo.

### 🔌 [`api-documentation.md`](./api-documentation.md)

**El contrato del backend**, endpoint por endpoint: autenticación, aislamiento multi-tenant, formas de request/response, enums, reglas de validación, y la peculiaridad de la doble envoltura de `sendResponseOr404`.

> ⚠️ Esto describe el *backend*. La fuente de verdad vive en el repositorio `talentmatch-backend` — esta es una copia de trabajo para el equipo de frontend y puede desincronizarse.

### 🐞 [`bugs.md`](./bugs.md)

**El inventario de bugs**, barriendo todas las rutas de `src/App.tsx`. Agrupado en bugs funcionales críticos, pantallas sin conectar (mock), problemas de UI/UX/responsive, y calidad de código. Incluye un anexo de bugs ya resueltos para que no se reabran, y una sección sobre **lo que las herramientas no detectan** (un build en verde no significa una UI correcta).

La premisa transversal: el backend está terminado y correcto, así que todo lo de aquí es trabajo de frontend.

### 🗂️ [`issues.md`](./issues.md)

**El índice del backlog priorizado.** Los mismos problemas que `bugs.md`, pero agrupados por *flujo* (capa de datos, routing, posiciones, vacantes, subidas, resultados, dashboard, admin, auth, pulido) y ordenados P0 → P3. Cada EPIC enlaza a su desarrollo detallado:

| Archivo                          | Prioridad                      | Contenido                                                     | Estado                          |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------- | ------------------------------- |
| [`issues/P0.md`](./issues/P0.md) | **P0** — bloqueantes           | EPIC 1 (capa de datos), 2 (routing), 3 (crear posición)        | ✅ Cerrado (registro histórico) |
| [`issues/P1.md`](./issues/P1.md) | **P1** — flujos rotos          | EPIC 4 (vacantes), 5 (carga de CVs), 6 (resultados)            | 🔨 En curso                     |
| [`issues/P2.md`](./issues/P2.md) | **P2** — pantallas secundarias | EPIC 7 (dashboard), 8 (admin), 9 (auth/rol)                    | 🔨 En curso                     |
| [`issues/P3.md`](./issues/P3.md) | **P3** — pulido                | EPIC 10 (UI/UX y calidad de código)                            | ⏳ Pendiente                    |

Cada archivo detallado da los archivos exactos, números de línea, snippets de código y criterios de aceptación.

### 📋 [`last-changes.md`](./last-changes.md)

**El registro de ingeniería**, del más reciente al más antiguo. Explica no solo *qué* cambió sino *por qué*: la auditoría de alineación con la API, la limpieza del desempaquetado del envelope, los arreglos de P0, y la sesión más reciente (build desbloqueado, docs reestructuradas).

---

## Estado actual de un vistazo

- ✅ **Funcionan de punta a punta:** Login, Departamentos (crear + historial CRUD), Crear Posición, historiales de Posiciones/Vacantes/CVs.
- 🟡 **Conectadas, con pendientes:** Nueva/Editar Vacante, Subir CV, Resultados.
- 🔴 **Sin API real:** Dashboard, Resultados Avanzados, Historial de Candidatos, Evaluaciones, Panel Admin.

⚠️ **La trampa que hay que conocer:** `src/services/api/admin.api.ts` existe y el Panel de Administración *parece* conectado — pero el servicio es un simulacro (`MOCK_USERS` + `setTimeout`) que nunca llama a `apiClient`. Ver [`bugs.md §1.1`](./bugs.md) y [`issues/P2.md §8.1`](./issues/P2.md).

---

## Convenciones

- Estos documentos describen **el código tal como es**, no como debería ser. Cuando discrepen con el código, **manda el código** — corrige el documento.
- Todo cambio que toque routing, la capa de servicios, tipos o auth debería actualizar `front-documentation.md` y, cuando aplique, `bugs.md` / `issues.md`.
- Mantén los dos idiomas sincronizados: edita `docs/en/` y `docs/es/` en el mismo commit.
- Las reglas de trabajo para colaboradores (y para Claude Code) viven en [`../../CLAUDE.md`](../../CLAUDE.md), en la raíz del repo.
