# 🗂️ Backlog de Issues por Flujo — TalentMatch Frontend

> Complementa a [`BUGS.md`](./BUGS.md). Aquí los bugs se **agrupan por flujo** siguiendo la [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) y se ordenan de **más importante a menos**.
>
> **Premisa:** el backend está terminado y correcto. Todo lo de abajo es trabajo de frontend.
>
> **Hallazgo transversal más importante:** cruzar el front con la API reveló que **varios historiales que parecían "conectados" en realidad están rotos** por el manejo del envelope de respuesta (ver EPIC 1). Esto corrige el estado optimista de `BUGS.md`.

## Leyenda de prioridad

| Nivel  | Significado                                                                   |
| ------ | ----------------------------------------------------------------------------- |
| **P0** | Bloquea el flujo central o rompe múltiples pantallas a la vez. Hacer primero. |
| **P1** | Rompe un flujo funcional concreto (crear/listar/subir).                       |
| **P2** | Pantalla secundaria sin conectar o degradada.                                 |
| **P3** | Pulido de UI/UX y calidad de código.                                          |

## Documentos detallados por prioridad

Este archivo es el **índice general**. El desarrollo detallado de cada issue (pasos exactos, archivos, snippets, criterios de aceptación) está en la carpeta [`issues/`](./issues/):

| Archivo | Prioridad | EPICs |
|---|---|---|
| [`issues/P0.md`](./issues/P0.md) | **P0** — bloqueantes | 1 (capa de datos), 2 (routing), 3 (crear posición) |
| [`issues/P1.md`](./issues/P1.md) | **P1** — flujos rotos | 4 (vacantes), 5 (carga CVs), 6 (resultados/candidatos) |
| [`issues/P2.md`](./issues/P2.md) | **P2** — pantallas secundarias | 7 (dashboard), 8 (admin), 9 (auth/rol) |
| [`issues/P3.md`](./issues/P3.md) | **P3** — pulido | 10 (UI/UX y calidad) |

## Orden de ejecución recomendado

`EPIC 1` (capa de datos) → `EPIC 2` (routing) → `EPIC 3` (posiciones) → `EPIC 4` (vacantes) → `EPIC 5` (carga CVs) → `EPIC 6` (resultados/candidatos) → `EPIC 7` (dashboard) → `EPIC 8` (admin) → `EPIC 9` (auth/rol) → `EPIC 10` (pulido).

`EPIC 1` es el desbloqueador: arregla de una vez posiciones, vacantes, candidatos y (al conectar) dashboard.

---

## EPIC 1 — [P0] Capa de datos: normalizar el envelope de respuesta

**Flujo:** transversal a todo consumo de API.
**Endpoints afectados:** todos los que usan `sendResponseOr404` → doble envoltura `{ "response": { "success": true, "data": ... } }` (`GET /positions`, `GET /positions/:id`, `GET /candidates`, `GET /candidates/:id`, `GET /departments/*`, `PUT/DELETE /departments/:id`, `GET /vacancies`, `PATCH /vacancies/:id/status`, `PUT /vacancies/:id`, `GET /dashboard`). Ref: `API_DOCUMENTATION.md` §9.1–9.2.

**Problema:** `apiClient` (`src/services/api/apiClient.ts:49`) solo devuelve `castedBody.data`. En la doble envoltura no hay `.data` de primer nivel (está en `.response.data`), así que devuelve el objeto crudo `{ response: {...} }`. Solo `departmentsApi` desempaqueta a mano; el resto de servicios reciben basura → listas vacías.

**Issues:**

- [ ] **1.1** Centralizar el desempaquetado en `apiClient`: si `body.response` existe, operar sobre `body.response`; devolver `.data` si está, si no el objeto. Contemplar `success: "false"` **string** en el 404 de `sendResponseOr404` (`API_DOCUMENTATION.md` §9.2) para no tratarlo como éxito.
- [ ] **1.2** Eliminar los extractores ad-hoc redundantes una vez centralizado: `Position.tsx:55`, `PositionHistory.tsx:28`, `VacancyHistory.tsx:35`, `Vacancy.tsx:64`, `CVHistory.jsx:25`, y la lógica manual de `departmentsApi`.
- [ ] **1.3** Regresión: verificar que `GET /vacancies/:id` (que **no** usa el helper, responde `{ success, data }` directo — §9.1 nota ¹) siga funcionando tras el cambio.

**Criterio de aceptación:** historiales de Posiciones, Vacantes y CVs muestran datos reales del backend sin extractores manuales.

---

## EPIC 2 — [P0] Navegación rota

**Flujo:** transversal.

**Issues:**

- [ ] **2.1** `Vacancy.tsx:183` y `:202` navegan a `/history` (ruta inexistente → rebota a `/dashboard`). Cambiar a `/vacancy-history`. (Es la única ruta rota tras cruzar todos los `navigate()` contra `App.tsx`.)

**Criterio de aceptación:** volver del historial y el éxito en edición de vacante llevan a `/vacancy-history`.

---

## EPIC 3 — [P0] Flujo de creación de Posición

**Flujo:** Departamento → Nueva Posición (manual o IA) → persistir.
**Endpoints:** `GET /departments`, `POST /positions`, `POST /positions/complete`. Ref: §3, §8.1.

**Issues:**

- [ ] **3.1** Dropdown de departamentos vacío: `Position.tsx:51-62` usa fetch crudo. Reemplazar por `departmentsApi.getAll()` y renderizar `id`/`name` normalizados.
- [ ] **3.2** IA autocompletar no funciona: el campo del archivo es **`pdf`**, no `file` (`positions.api.ts:54`). El endpoint `POST /positions/complete` espera `multipart/form-data` con campo `pdf` (§3).
- [ ] **3.3** `educationLevel` manda labels en español (`Position.tsx:336-342`: "Bachiller", "Maestría"…). Enviar los valores del enum: `NONE, HIGH_SCHOOL, BACHELOR, TECHNICAL, UNIVERSITY, MASTER, DOCTORATE`.
- [ ] **3.4** Campo de área de estudio: el front envía `education` pero la API espera **`educationArea`** (`Position.tsx:346` + `positions.api.ts` `CreatePositionInput`). Renombrar y aplicar la regla §8.1: si `educationLevel` es `NONE`/`HIGH_SCHOOL`, `educationArea` es opcional; en el resto es obligatorio (400 si falta).
- [ ] **3.5** Mapear la respuesta de IA (`data: PositionExtracted` + `cloudinaryPositionUrl`) a `formData` con los nombres correctos (`educationArea`, enum de nivel) en `processWithAI` (`Position.tsx:97-108`).
- [ ] **3.6** Validaciones cliente para evitar 400: `role` ≥ 5 chars, `description` ≥ 25 chars, `technicalSkills` ≥ 1 (§3 `POST /positions`).

**Criterio de aceptación:** crear posición manual y por IA persiste sin 400; el nivel/área de educación se guardan correctamente.

---

## EPIC 4 — [P1] Flujo de Vacantes

**Flujo:** Posición → Nueva/Editar Vacante → listar → cambiar estado.
**Endpoints:** `GET /vacancies`, `POST /vacancies`, `PUT /vacancies/:id`, `PATCH /vacancies/:id/status`. Ref: §4.

**Issues:**

- [ ] **4.1** Lista de vacantes (`VacancyHistory.tsx`) — depende de **EPIC 1**; validar tras centralizar el envelope.
- [ ] **4.2** Dropdown de posiciones en crear vacante (`Vacancy.tsx:59-67`) depende de que `GET /positions` desempaquete bien (**EPIC 1**). Sin eso, "No hay posiciones en este depto." aunque existan.
- [ ] **4.3** Estado inválido `FILLED`: `Resultados.jsx:62` envía `updateStatus(id, "FILLED")`; el enum es `ACTIVE | PAUSED | CLOSED` (§0). Cambiar a `CLOSED`.
- [ ] **4.4** `VacancySuccess` muestra código fijo "Vac-009" (`VacancySuccess.jsx:7`); `Vacancy.tsx:177-188` no le pasa el código. Pasar el `id`/código real devuelto por `POST /vacancies`.

**Criterio de aceptación:** crear, editar, listar vacante y cambiar estado funcionan de punta a punta.

---

## EPIC 5 — [P1] Flujo de carga de CVs

**Flujo:** Vacante → subir CVs → crear candidatos.
**Endpoints:** `POST /vacancies/:id/upload` (campo `pdfs`, máx 100, 5MB c/u). Ref: §4, §5.

**Issues:**

- [ ] **5.1** `UploadCV` (`/uploadcv`) postea a **`/uploads`**, que **no existe** en la API (`uploads.api.ts:12`). Los candidatos se crean **solo** vía `POST /vacancies/:id/upload` (§5). Rediseñar el flujo para exigir una vacante destino (o eliminar la ruta genérica y mover la subida a la vacante). Reusar `vacanciesApi.uploadCVs`.
- [ ] **5.2** Manejar la respuesta por-archivo: el 201 devuelve un **array** con `{ success, data }` o `{ success:false, message }` por CV, incluyendo duplicados por hash (§4). Mostrar resultado por archivo, no un éxito global plano.

**Criterio de aceptación:** subir CVs a una vacante crea/asocia candidatos y reporta duplicados/fallos por archivo.

---

## EPIC 6 — [P1] Resultados de matching y Candidatos

**Flujo:** Vacante → evaluar IA → ranking → detalle candidato.
**Endpoints:** `POST /vacancies/:id/evaluations`, `GET /vacancies/:id/results`, `GET /candidates`. Ref: §4, §5.

**Issues:**

- [ ] **6.1** Parsing de resultados: `Resultados.jsx:30` chequea `response.status === "success"`, pero `getResults` devuelve `{ success, data: MatchResult[], meta }` y `apiClient` ya desenvuelve `.data`. Alinear al contrato real y usar `meta` para paginación.
- [ ] **6.2** **[Pendiente de conectar]** `EvaluationsHistory` es 100% mock y el botón "Calcular" no tiene acción (`EvaluationCard.tsx:63`). Conectar el listado a `GET /vacancies` y el botón a `POST /vacancies/:id/evaluations`, luego navegar a resultados.
- [ ] **6.3** Estado de candidato sin backend: no existe endpoint de update de candidato (§5, solo lectura). El `StatusDropdown` de resultados no persiste. Decidir: (a) quitar el control, o (b) mapear "Contratado" solo al cierre de vacante. Enum real de candidato: `DISPONIBLE | CONTRATADO`.
- [ ] **6.4** **[Pendiente de conectar]** `AdvancedResults` (`/advanced-results/:id`) es 100% mock. Conectar a `GET /vacancies/:id/results` (reusar `useParams`) y cablear los botones (Compartir, Recalcular, Ver perfil).
- [ ] **6.5** **[Pendiente de conectar]** `CandidatesHistory` es 100% mock con acciones `alert()`. Conectar contra `GET /candidates` (depende de **EPIC 1**). `CVHistory` ya llama a la API — solo validar tras EPIC 1.

**Criterio de aceptación:** evaluar una vacante genera ranking real; el detalle del candidato usa datos del backend; sin controles que finjan persistencia.

---

## EPIC 7 — [P2] Dashboard

**Flujo:** vista de resumen por usuario.
**Endpoints:** `GET /dashboard` (scoped al usuario, ≠ `/admin/stats`). Ref: §7.

**Issues:**

- [ ] **7.1** **[Pendiente de conectar]** Dashboard usa `MOCK_DATA`. Conectar a `dashboardService.getSummary()` y mapear la respuesta real: `total { positionsCount, departmentsCount, candidatesCount, openVacanciesCount }`, `vacancyStatusBreakdown[]`, `monthlyActivity[]`. Depende de **EPIC 1**.
- [ ] **7.2** Responsive: `Dashboard.tsx:49,79` usa padding y `min-h` fijos → desborda y scrollea en pantallas pequeñas. Ajustar breakpoints/alturas.
- [ ] **7.3** Accesos rápidos: las `MetricCard` muestran flecha pero no navegan. Son **atajos directos a los historiales** — cada tarjeta debe navegar a su historial correspondiente: Total Posiciones → `/position-history`, Departamentos → `/department-history`, Candidatos en Pool → `/candidates-history` (o `/cv-history`), Vacantes → `/vacancy-history`. Conectar `onClick`/enlace en cada `MetricCard`.

**Criterio de aceptación:** métricas reales del usuario, sin scroll indebido, accesos rápidos funcionales.

---

## EPIC 8 — [P2] Panel de Administración

**Flujo:** admin gestiona usuarios de toda la plataforma.
**Endpoints:** `GET /admin/stats`, `GET /admin/users` (paginado), `PUT /admin/users/:id/role`, `DELETE /admin/users/:id`. Solo `role: ADMIN` (403 si no). Ref: §6.

**Issues:**

- [ ] **8.1** Crear `src/services/api/admin.api.ts` con: `getStats()`, `getUsers(page, limit)`, `updateRole(id, role)`, `deleteUser(id)`.
- [ ] **8.2** **[Pendiente de conectar]** `AdminPanel` y sus módulos (`StatsModule`, `UserTableModule`, `RoleUpdateModule`, `UserDeleteModule`) son 100% mock. Conectarlos a `admin.api.ts`: quitar `mockUsers` y el loader `setTimeout`; hacer funcional el buscador (`onChange`).
- [ ] **8.3** Casing de roles: la API usa `ADMIN`/`USER`; el front tipa `admin`/`user` (`admin.types.ts`). Unificar/mapear.
- [ ] **8.4** `GET /admin/stats` es **global** (toda la plataforma), no confundir con `/dashboard` por usuario (§9.4).

**Criterio de aceptación:** el panel lista usuarios reales, cambia roles y elimina; stats globales correctas.

---

## EPIC 9 — [P2] Auth / control por rol

**Flujo:** login → token con `{ userId, role }` → gating de rutas admin.
**Endpoints:** `POST /users/login` (devuelve `user.role`). Ref: §0, §1.

**Issues:**

- [ ] **9.1** `AuthContext` no guarda el `role` del usuario (el login lo devuelve en `user.role`). Persistirlo para poder gatear admin.
- [ ] **9.2** Sidebar: mover "Administración" al **primer** grupo, con **ícono propio** (ej. `Shield`), y mostrarlo **solo si `role === ADMIN`** (`Sidebar.tsx:55-60`). Hoy usa el ícono de Dashboard y va al final.
- [ ] **9.3** (Opcional) Proteger la ruta `/admin` en `App.tsx` para no-admin (evitar el 403 crudo).

**Criterio de aceptación:** el acceso a Administración aparece de primero, con ícono propio y solo para admins.

---

## EPIC 10 — [P3] UI/UX y calidad de código

**Issues:**

- [ ] **10.1** Estados de candidato inconsistentes entre pantallas: `StatusDropdown.jsx:9` ("Contactar", "No contratado") vs `AdvancedResults.tsx:8,92` ("Contactado", "No Contratado"). Unificar texto y casing.
- [ ] **10.2** Ícono mostrar/ocultar contraseña invertido (`LoginForm.tsx:58`).
- [ ] **10.3** Código muerto: rama `serverData` que `apiClient` nunca produce (`CreateDepartment.tsx:34`) y bloque tras `export default` (`Login.tsx:98-109`).
- [ ] **10.4** `useState<any[]>` para departamentos (`Position.tsx:38`) rompe `no-explicit-any` (regla marcada como _error_). Tipar correctamente.
- [ ] **10.5** Quitar `console.log`/`alert` de depuración (`CreateDepartment.tsx`, `AdvancedResults.tsx`, `Resultados.jsx` y placeholders varios).

**Criterio de aceptación:** UI consistente, sin código muerto, `npm run lint` limpio.

---

## Resumen de prioridades

| EPIC | Flujo                    | Prioridad | Depende de                 |
| ---- | ------------------------ | --------- | -------------------------- |
| 1    | Capa de datos (envelope) | **P0**    | —                          |
| 2    | Navegación (`/history`)  | **P0**    | —                          |
| 3    | Crear Posición           | **P0**    | — (3.1 usa departmentsApi) |
| 4    | Vacantes                 | **P1**    | EPIC 1                     |
| 5    | Carga de CVs             | **P1**    | —                          |
| 6    | Resultados / Candidatos  | **P1**    | EPIC 1                     |
| 7    | Dashboard                | **P2**    | EPIC 1                     |
| 8    | Administración           | **P2**    | EPIC 9 (rol)               |
| 9    | Auth / rol               | **P2**    | —                          |
| 10   | UI/UX y calidad          | **P3**    | —                          |
