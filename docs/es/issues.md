# 🗂️ Backlog de Issues por Flujo — TalentMatch Frontend

> Complementa a [`bugs.md`](./bugs.md). Aquí los bugs se **agrupan por flujo** siguiendo la [`api-documentation.md`](./api-documentation.md) y se ordenan de **más importante a menos**.
>
> 🇬🇧 English version: [`../en/issues.md`](../en/issues.md)
>
> **Premisa:** el backend está terminado y correcto. Todo lo de abajo es trabajo de frontend.
>
> **Última verificación contra el código: 2026-07-09.**

## Leyenda de prioridad

| Nivel  | Significado                                                                   |
| ------ | ----------------------------------------------------------------------------- |
| **P0** | Bloquea el flujo central o rompe múltiples pantallas a la vez. Hacer primero. |
| **P1** | Rompe un flujo funcional concreto (crear/listar/subir).                       |
| **P2** | Pantalla secundaria sin conectar o degradada.                                 |
| **P3** | Pulido de UI/UX y calidad de código.                                          |

## Documentos detallados por prioridad

Este archivo es el **índice general**. El desarrollo detallado de cada issue (pasos exactos, archivos, snippets, criterios de aceptación) está en la carpeta [`issues/`](./issues/):

| Archivo                          | Prioridad                      | EPICs                                                  | Estado                     |
| -------------------------------- | ------------------------------ | ------------------------------------------------------ | -------------------------- |
| [`issues/P0.md`](./issues/P0.md) | **P0** — bloqueantes           | 1 (capa de datos), 2 (routing), 3 (crear posición)      | ✅ **Cerrado**             |
| [`issues/P1.md`](./issues/P1.md) | **P1** — flujos rotos          | 4 (vacantes), 5 (carga CVs), 6 (resultados/candidatos) | 🔨 En curso                |
| [`issues/P2.md`](./issues/P2.md) | **P2** — pantallas secundarias | 7 (dashboard), 8 (admin), 9 (auth/rol)                 | 🔨 En curso (9.1, 9.3 ✅)  |
| [`issues/P3.md`](./issues/P3.md) | **P3** — pulido                | 10 (UI/UX y calidad)                                   | ⏳ Pendiente               |

## Estado actual

**P0 está completamente resuelto.** El envelope se normaliza en `apiClient`, el routing roto se corrigió y el flujo de creación de posición funciona de punta a punta. `issues/P0.md` se conserva como registro histórico.

El siguiente foco es **P1**, pero hay un ítem de **P2** que en la práctica es más urgente: **`admin.api.ts` es un simulacro** (`MOCK_USERS` + `setTimeout`, nunca llama a `apiClient`) y los cuatro módulos admin ya lo consumen, así que el panel **aparenta estar conectado**. Ver `bugs.md §1.1` y `issues/P2.md §8.1`.

---

## EPIC 1 — [P0] ✅ Capa de datos: normalizar el envelope de respuesta

**Resuelto.** `apiClient` desempaqueta la doble envoltura `{ response: { success, data } }` y luego `.data`. Los extractores ad-hoc se eliminaron de `PositionHistory`, `VacancyHistory`, `Vacancy`, `Position` y `departmentsApi`. Todos los servicios devuelven el tipo desempaquetado.

Detalle en [`issues/P0.md`](./issues/P0.md).

---

## EPIC 2 — [P0] ✅ Navegación rota

**Resuelto.** Los dos `navigate("/history")` de `Vacancy.tsx` apuntan ahora a `/vacancy-history`.

---

## EPIC 3 — [P0] ✅ Flujo de creación de Posición

**Resuelto.** `Position.tsx` usa `departmentsApi.getAll()`, envía el enum de `educationLevel`, renombró `education`→`educationArea` (omitiéndolo cuando el nivel es `NONE`/`HIGH_SCHOOL`), el campo del PDF de IA es `pdf`, y hay validaciones en cliente que evitan los 400.

---

## EPIC 4 — [P1] Flujo de Vacantes

**Flujo:** Posición → Nueva/Editar Vacante → listar → cambiar estado.
**Endpoints:** `GET /vacancies`, `POST /vacancies`, `PUT /vacancies/:id`, `PATCH /vacancies/:id/status`. Ref: §4.

- [x] **4.1** Lista de vacantes (`VacancyHistory.tsx`) — validada tras EPIC 1.
- [x] **4.2** Dropdown de posiciones en crear vacante — funciona tras EPIC 1.
- [x] **4.3** Estado inválido `FILLED` → `CLOSED` en `Resultados.jsx`.
- [ ] **4.4** `VacancySuccess` muestra código fijo "Vac-009"; `Vacancy.tsx` no le pasa el código. Pasar el `id`/código real devuelto por `POST /vacancies`.

**Criterio de aceptación:** crear, editar, listar vacante y cambiar estado funcionan de punta a punta, mostrando el código real.

---

## EPIC 5 — [P1] Flujo de carga de CVs

**Flujo:** Vacante → subir CVs → crear candidatos.
**Endpoints:** `POST /vacancies/:id/upload` (campo `pdfs`, máx 100, 5 MB c/u). Ref: §4, §5.

- [x] **5.1** `uploads.api.ts` (que posteaba a `/uploads`, inexistente) fue eliminado. `UploadCV` exige una vacante destino y usa `vacanciesApi.uploadCVs`.
- [ ] **5.2** Manejar la respuesta **por archivo**: el 201 devuelve un array con `{ success, data }` o `{ success:false, message }` por CV, incluyendo duplicados por hash. Hoy solo se cuentan los fallos.

**Criterio de aceptación:** subir CVs a una vacante crea/asocia candidatos y reporta duplicados/fallos por archivo.

---

## EPIC 6 — [P1] Resultados de matching y Candidatos

**Flujo:** Vacante → evaluar IA → ranking → detalle candidato.
**Endpoints:** `POST /vacancies/:id/evaluations`, `GET /vacancies/:id/results`, `GET /candidates`. Ref: §4, §5.

- [x] **6.1** Parsing de resultados alineado: `getResults` devuelve `MatchResult[]` directo.
- [ ] **6.2** `EvaluationsHistory` es 100 % mock y el botón "Calcular" no tiene `onClick`. Conectar el listado a `GET /vacancies` y el botón a `POST /vacancies/:id/evaluations`, luego navegar a resultados. `vacanciesApi.evaluateCandidates()` ya existe y está tipado.
- [ ] **6.3** Estado de candidato sin backend: no hay endpoint de update de candidato. El `StatusDropdown` no persiste. Decidir: (a) quitar el control, o (b) mapear "Contratado" solo al cierre de vacante.
- [ ] **6.4** `AdvancedResults` (`/advanced-results/:id`) es 100 % mock. Conectar a `GET /vacancies/:id/results` (reusar `useParams`) y cablear los botones.
- [ ] **6.5** `CandidatesHistory` es 100 % mock con acciones `alert()`. Conectar contra `GET /candidates`.

**Criterio de aceptación:** evaluar una vacante genera ranking real; el detalle del candidato usa datos del backend; sin controles que finjan persistencia.

---

## EPIC 7 — [P2] Dashboard

**Flujo:** vista de resumen por usuario.
**Endpoints:** `GET /dashboard` (scoped al usuario, ≠ `/admin/stats`). Ref: §7.

- [ ] **7.1** Dashboard usa `MOCK_DATA`. Conectar a `dashboardService.getSummary()` y mapear la respuesta real (`total`, `vacancyStatusBreakdown[]`, `monthlyActivity[]`). Los tipos ya existen en `dashboard.types.ts`.
- [ ] **7.2** Responsive: `min-h` fijos desbordan en pantallas pequeñas.
- [ ] **7.3** Accesos rápidos: las `MetricCard` muestran flecha pero el componente no acepta destino. Cada tarjeta debe navegar a su historial.

**Criterio de aceptación:** métricas reales del usuario, sin scroll indebido, accesos rápidos funcionales.

---

## EPIC 8 — [P2] Panel de Administración

**Flujo:** admin gestiona usuarios de toda la plataforma.
**Endpoints:** `GET /admin/stats`, `GET /admin/users` (paginado), `PUT /admin/users/:id/role`, `DELETE /admin/users/:id`. Solo `role: ADMIN` (403 si no). Ref: §6.

- [ ] **8.1** ⚠️ **Prioritario.** `src/services/api/admin.api.ts` existe pero es un **simulacro**: `MOCK_USERS` + `setTimeout`, `Promise<any>`, nunca importa `apiClient`. Reescribirlo de verdad.
- [ ] **8.2** Los módulos (`StatsModule`, `UserTableModule`, `RoleUpdateModule`, `UserDeleteModule`) **ya tienen** `useEffect`, estados de carga y buscadores reactivos. Solo hay que quitar el `setTimeout(750)` de `AdminPanel.tsx` y dejar que los datos vengan del backend. La cabecera muestra "admin" hardcodeado: leerlo de `useAuth()`.
- [ ] **8.3** Casing de roles: la API usa `ADMIN`/`USER`; el front tipa `admin`/`user` (`admin.types.ts`, `AuthContext`). Unificar y mapear a etiqueta visible.
- [ ] **8.4** `GET /admin/stats` es **global**, no confundir con `/dashboard` por usuario (§9.4).

**Criterio de aceptación:** el panel lista usuarios reales, cambia roles y elimina; stats globales correctas.

---

## EPIC 9 — [P2] Auth / control por rol

**Flujo:** login → token con `{ userId, role }` → gating de rutas admin.
**Endpoints:** `POST /users/login` (devuelve `user.role`). Ref: §0, §1.

- [x] **9.1** `AuthContext` guarda el `role` (`UserData.role`); `Login.tsx` lo normaliza con `normalizeRole()` y redirige según el rol.
- [ ] **9.2** Sidebar: mover "Administración" al **primer** grupo, con **ícono propio** (ej. `Shield`), y mostrarlo **solo si el usuario es admin**. Hoy usa el ícono de Dashboard, va al final y **se muestra a todos** (aunque `AdminRoute` bloquee el acceso).
- [x] **9.3** Ruta `/admin` protegida por `AdminRoute`, que redirige a `/dashboard` si el rol no es admin.

**Criterio de aceptación:** el acceso a Administración aparece de primero, con ícono propio y solo para admins.

---

## EPIC 10 — [P3] UI/UX y calidad de código

- [ ] **10.1** Estados de candidato inconsistentes: `StatusDropdown.jsx` ("Contactar", "No contratado") vs `AdvancedResults.tsx` ("Contactado", "No Contratado"). Ninguno coincide con `DISPONIBLE | CONTRATADO`.
- [ ] **10.2** Ícono mostrar/ocultar contraseña invertido (`LoginForm.tsx`).
- [x] **10.3** Código muerto: bloque JSX tras `export default Login;` — eliminado (2026-07-09).
- [x] **10.4** `useState<any[]>` en `Position.tsx` → tipado `Department[]`. (Queda `Promise<any>` en `admin.api.ts`, cubierto por 8.1.)
- [ ] **10.5** Quitar `console.log`/`alert` de depuración. **El más urgente:** `AdminRoute.tsx:8-9` vuelca el objeto `user` a la consola en cada render.

**Criterio de aceptación:** UI consistente, sin código muerto, `npm run lint` limpio.

---

## Resumen de prioridades

| EPIC | Flujo                    | Prioridad | Estado           | Depende de |
| ---- | ------------------------ | --------- | ---------------- | ---------- |
| 1    | Capa de datos (envelope) | **P0**    | ✅ Resuelto      | —          |
| 2    | Navegación (`/history`)  | **P0**    | ✅ Resuelto      | —          |
| 3    | Crear Posición           | **P0**    | ✅ Resuelto      | —          |
| 4    | Vacantes                 | **P1**    | 🔨 Falta 4.4     | —          |
| 5    | Carga de CVs             | **P1**    | 🔨 Falta 5.2     | —          |
| 6    | Resultados / Candidatos  | **P1**    | 🔨 Falta 6.2–6.5 | —          |
| 7    | Dashboard                | **P2**    | ⏳ Pendiente     | —          |
| 8    | Administración           | **P2**    | ⚠️ Crítico (8.1) | —          |
| 9    | Auth / rol               | **P2**    | 🔨 Falta 9.2     | —          |
| 10   | UI/UX y calidad          | **P3**    | ⏳ Pendiente     | —          |
