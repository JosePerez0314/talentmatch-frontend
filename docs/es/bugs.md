# 🐞 Inventario de Bugs — TalentMatch Frontend

> **Premisa:** el backend está terminado y correcto. Por lo tanto **todos los ítems de este documento son responsabilidad del frontend**.
>
> 🇬🇧 English version: [`../en/bugs.md`](../en/bugs.md)
>
> **Última verificación: 2026-08-01.**
>
> ⚠️ **Nota de alcance:** todo lo listado aquí es **menor**. Ninguno de estos bugs impide usar la app con normalidad — todas las pantallas cargan, todos los flujos principales (crear/editar/eliminar departamentos, posiciones, vacantes; subir CVs; ver resultados de matching; administrar usuarios) funcionan de punta a punta contra la API real. Lo que sigue es código muerto, un par de bugs de UI confinados a pantallas legacy, e inconsistencias de nomenclatura — trabajo de limpieza, no bloqueantes de producto.

## Estado de conexión por ruta

| Ruta                        | Estado       | Nota                                                                 |
| ---------------------------- | -------------- | ------------------------------------------------------------------------ |
| `/login`                   | ✅ Conectado | Atajo de demo (`admin` → `admin@admin.ai`)                                |
| `/dashboard`               | ✅ Conectado | `dashboardService.getSummary()` real, ya no hay `MOCK_DATA`             |
| `/position`                | ✅ Conectado | Wizard de 4 pasos, manual o IA (+ `/position/edit/:id` modo edición)      |
| `/uploadcv`                | ✅ Conectado |                                                                          |
| `/cv-history`              | ⚠️ Conectado, huérfano | Pantalla paralela a `/candidates-history`, no enlazada desde el sidebar |
| `/position-history`        | ✅ Conectado | Edición y eliminación conectadas                                          |
| `/vacancy` (+ `/edit/:id`) | ⚠️ Conectado | Pantalla de éxito ignora el callback `onReset`                           |
| `/vacancy-history`         | ✅ Conectado |                                                                          |
| `/department`              | ✅ Conectado |                                                                          |
| `/department-history`      | ✅ Conectado |                                                                          |
| `/resultados/:id`          | ✅ Conectado         | No enlazada desde ningún lugar de la UI; bug de parsing en `CandidateMatchRow`; ahora conectada a la API real (usa `updateCandidateStatus`, seguimiento del estado de vacante, sistema de notificaciones) |
| `/candidates-history`      | ✅ Conectado | Agrupa candidatos por vacante                                             |
| `/evaluations-history`     | ✅ Conectado | El param `:id` de la ruta nunca se usa                                    |
| `/advanced-results/:id`    | ✅ Conectado | Pantalla de resultados actual                                             |
| `/admin`                   | ✅ Conectado | `adminService` real; gate de rol activo en Sidebar y `AdminRoute`         |

---

## 1. Bugs de código confirmados

### 1.1 — `VacancySuccess.tsx` ignora el prop `onReset`

- **Archivo:** `src/components/Sections/VacancySuccess.tsx`
- **Detalle:** el componente declara recibir `{ vacancyCode, onReset }`, pero la desestructuración real solo toma `({ vacancyCode })` — `onReset` nunca se usa. `Vacancy.tsx` sí le pasa un `onReset` real (para resetear el formulario en modo edición y navegar). Como los propios botones de `VacancySuccess` (`navigate(...)` hardcodeado) cubren la navegación visible, el bug pasa desapercibido en el uso normal — pero cualquier lógica adicional que dependiera de que `onReset` se ejecute (p. ej. limpiar estado del padre) nunca corre.
- **Fix:** desestructurar y llamar a `onReset` en el botón correspondiente, o eliminar el prop de la firma si ya no hace falta.

### 1.2 — `CandidateMatchRow.tsx` no parsea `normalizedCandidate` (pantalla legacy)

- **Archivo:** `src/components/cards/CandidateMatchRow.tsx` (usado solo por `src/pages/Resultados.tsx`)
- **Detalle:** `api.types.ts` documenta `MatchResult.normalizedCandidate` como un **string JSON serializado** que hay que parsear (así lo hace correctamente `CandidateDetailsModal.tsx` vía `parseNormalized`, con try/catch). `CandidateMatchRow.tsx` en cambio ensancha el tipo localmente (`ResultData`) para tratarlo como si ya fuera un objeto y lee `resultData.normalizedCandidate?.technicalSkills` directamente. Si el backend siempre devuelve un string, esto es `undefined` y la fila de candidato en `Resultados.tsx` **muestra cero skills**.
- **Alcance:** solo afecta a `/resultados/:id`, la pantalla legacy no enlazada desde el sidebar (ver §2). `AdvancedResults.tsx`, la pantalla de resultados actual, no tiene este problema.
- **Fix:** parsear `normalizedCandidate` con `JSON.parse()` igual que `CandidateDetailsModal.tsx`, o retirar la pantalla legacy (ver §2.1).

---

## 2. Pantallas duplicadas / parcialmente huérfanas

### 2.1 — `Resultados.tsx` vs `AdvancedResults.tsx`

- **Archivos:** `src/pages/Resultados.tsx` (rutas `/resultados`, `/resultados/:id`) y `src/pages/AdvancedResults.tsx` (ruta `/advanced-results/:id`)
- **Detalle:** ambas muestran resultados de matching para una vacante, pero con layouts distintos. `AdvancedResults` es la pantalla enlazada desde `VacancyHistory` y `CandidatesHistory`, y la que recibió el rediseño y los fixes recientes (secciones separadas, guard de recálculo, manejo de `PAUSED`). `Resultados` sigue viva en el router pero **no está enlazada desde ningún botón/link de la app** — solo es alcanzable escribiendo la URL directamente. Además tiene el bug de §1.2 y usa un `ProcessingModal` de progreso cosmético (no real).
- **Fix:** decidir si `Resultados.tsx` se retira del router (y de paso su bug de §1.2 deja de importar) o si se consolida con `AdvancedResults`.

### 2.2 — `CVHistory.jsx` vs `CandidatesHistory.tsx`

- **Archivos:** `src/pages/CVHistory.jsx` (ruta `/cv-history`, usa `candidateService.getAll()` → `GET /candidates` plano) y `src/pages/CandidatesHistory.tsx` (ruta `/candidates-history`, usa `vacanciesApi.getAll()` agrupando candidatos por vacante)
- **Detalle:** dos pantallas de "historial de candidatos" con fuentes de datos distintas. El Sidebar solo enlaza `/candidates-history`; `/cv-history` no aparece en ningún menú y solo es alcanzable por URL directa. `HistoryTable.jsx` (usado únicamente por `CVHistory.jsx`) lee múltiples nombres de campo alternativos para la URL del CV, señal de que se escribió contra una forma de API más antigua que la documentada hoy.
- **Fix:** igual que en §2.1 — decidir si se retira `/cv-history` del router o se consolida.

---

## 3. Código muerto y comentarios desactualizados

### 3.2 — Mecanismo `isDynamic` del Sidebar, vestigial

- **Archivo:** `src/layouts/Sidebar.tsx`
- **Detalle:** el tipo `MenuItem` tiene un campo `isDynamic` y hay lógica para sufijar la ruta con `lastVacancyId` desde `localStorage`, pero **ningún** `MenuItem` en `MENU_GROUPS` activa `isDynamic: true` hoy — es una rama muerta. `VacancyHistory.tsx` sigue escribiendo `localStorage.setItem("lastVacancyId", id)` para alimentar este mecanismo que ya no lo consume nadie visible.
- **Fix:** limpiar el campo `isDynamic` y la escritura de `lastVacancyId` si de verdad no hay ningún consumidor, o documentar para qué se está preservando.

### 3.3 — Comentarios desactualizados

- `src/types/dashboard.types.ts` (línea ~32): el comentario dice "Tipos de la UI (mock data + tarjetas)" — pero estos tipos ya se llenan con datos reales de `dashboard.api.ts` desde que `Dashboard.tsx` se conectó. El comentario quedó desactualizado.
- `src/main.tsx`: tiene un `@ts-ignore` con un comentario ("Temporal mientras `App` se migra a `.tsx`"), pero `App.tsx` **ya** es `.tsx` — el comentario (y posiblemente el `@ts-ignore`) ya no aplican.

### 3.4 — Detalles cosméticos

- `src/App.tsx` importa `VacancyHistory` bajo el nombre `VacacyHistory` (typo conservado) — no tiene impacto funcional, solo legibilidad.
- `src/layouts/Sidebar.tsx`: `handleLogout` llama a `logout()` (que ya hace una navegación completa a `/login`) y además llama a `navigate("/login")` — doble navegación redundante pero inofensiva.

---

## 4. Configuración y entorno

### 4.1 — `apiClient.ts` sin fallback para `VITE_API_URL`

- **Archivo:** `src/services/api/apiClient.ts:3`
- **Detalle:** `const BASE_URL: string = import.meta.env.VITE_API_URL;` sigue sin fallback. Si la variable no está definida, el primer request usa literalmente la URL `"undefined/users/login"`.
- **Agravante:** no hay `.env.example` comprometido en el repo, pese a que `.gitignore` deja una excepción explícita para él (`!.env.example`). Un clon nuevo del repo no tiene ninguna plantilla que indique qué variables definir.
- **Fix:** fallback explícito o fallo temprano con mensaje claro al arrancar; comitear un `.env.example` con `VITE_API_URL` (sin valores reales).

### 4.2 — Variables de entorno muertas

- `.env` local define `VITE_TEST_USER`/`VITE_TEST_PASS`, pero **ningún archivo de `src/` las lee**. Solo `VITE_API_URL` se usa en código.

---

## 5. UI / UX menores

### 5.1 — Búsqueda de `UserTableModule` solo filtra la página actual

- **Archivo:** `src/components/admin/UserTableModule.tsx`
- **Detalle:** el buscador filtra sobre `users`, que ya es la página actual (10 filas) devuelta por `adminService.getUsers(page, limit)`. Un admin que busca un usuario que no está en la página visible no lo encuentra, aunque exista en el sistema.
- **Fix:** decidir si la búsqueda debe ser server-side (nuevo parámetro en `GET /admin/users`) o si se documenta como "búsqueda solo en esta página" en la propia UI.

### 5.2 — Dos librerías de íconos coexistiendo

- `lucide-react` se usa de forma pervasiva; `react-icons` solo aparece en `DeleteDepartmentModal.tsx` y `EvaluationCard.tsx`. No es un bug, pero es deuda de consistencia — no hay razón funcional para mantener dos librerías de íconos.

### 5.3 — `/evaluations-history/:id` con parámetro sin usar

- **Archivo:** `src/App.tsx` (ruta), `src/pages/EvaluationsHistory.tsx`
- **Detalle:** la ruta declara `:id`, pero `EvaluationsHistory.tsx` nunca llama a `useParams()` — la pantalla es una máquina de estados autocontenida que arranca en modo selección de vacante sin importar la URL. La variante con `:id` es efectivamente inalcanzable con utilidad real.
- **Fix:** quitar la variante de ruta con `:id` si no hay plan de usarla, o implementar que preseleccione la vacante correspondiente.

---

## 6. Sobre lo que las herramientas **no** detectan

- **Las clases de Tailwind no se validan.** Un typo en una clase (`className="rounded-[24px]"` vs `"roundTomaed-[24px]"`) es igual de válido para `tsc` y ESLint — son solo strings. Solo se detecta mirando la app en el navegador.
- **El texto suelto en JSX tampoco.** Un `<h1>Título</h1>, cr` compila perfectamente y renderiza `, cr` en pantalla.
- **`npm run build` en verde no significa que la UI esté bien.** Ambos casos anteriores ocurrieron en `LoginForm.tsx` en una sesión anterior (2026-07-09) y ni `tsc` ni ESLint los detectaron.

---

## Resumen ejecutivo

| Categoría                              | Cantidad |
| ----------------------------------------- | ---------- |
| Bugs de código confirmados               | 2        |
| Pantallas duplicadas/parcialmente huérfanas | 2        |
| Código muerto / comentarios desactualizados | 5        |
| Configuración y entorno                  | 2        |
| UI / UX menores                          | 3        |

**Ninguno de estos ítems es bloqueante.** Prioridad sugerida si se quiere invertir tiempo en limpieza: 1) decidir el destino de las pantallas duplicadas (§2) — esto resuelve de paso el bug de §1.2 si se retira `Resultados.tsx`; 2) arreglar el prop `onReset` ignorado (§1.1); 3) blindar `VITE_API_URL` y comitear `.env.example` (§4.1); 4) limpieza de código muerto (§3) y detalles menores (§5).

---

## Anexo — Bugs ya resueltos

Se conservan para trazabilidad. **No reabrir sin verificar contra el código.**

| Bug                                                          | Resuelto en | Nota                                                                 |
| --------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| `adminService` era un simulacro (`MOCK_USERS` + `setTimeout`)   | 2026-07-13/14 | Reescrito sobre `apiClient` contra `/admin/*`, con `createUser` nuevo    |
| Dashboard 100 % mock (`MOCK_DATA`)                              | 2026-07-13/14 | Conectado a `dashboardService.getSummary()`                              |
| Sidebar mostraba "Panel Admin" a todos los roles                | 2026-07-13/14 | Ahora condicionado a `user?.role === "ADMIN"`                            |
| `AdminRoute` volcaba el objeto `user` a consola                 | ≤ 2026-07-13  | Sin `console.log` en el archivo actual                                   |
| Casing de rol desalineado (`admin/user` UI vs `ADMIN/USER` API) | ≤ 2026-07-13  | Unificado en mayúsculas en todo el frontend                              |
| Un `401` no cerraba la sesión                                   | ≤ 2026-07-13  | `apiClient` llama a `endExpiredSession()` salvo en endpoints públicos    |
| `apiClient` adjuntaba token a endpoints públicos de auth        | 2026-07-13    | `isPublicEndpoint` evita adjuntar `Authorization` en login/registro      |
| Vacante sin manejo de estado `PAUSED` en resultados             | 2026-07-13    | `AdvancedResults.tsx` maneja badge y guard de recálculo para `PAUSED`    |
| Dependencias muertas en `package.json` (`express`, `cors`, `dotenv`) | ≤ 2026-07-13 | No existen en el `package.json` actual                                   |
| `Vacancy.tsx` navegaba a la ruta inexistente `/history`         | 2026-07-08    | Ahora `/vacancy-history`                                                 |
| Dropdown de departamentos vacío en "Nueva Posición"             | 2026-07-08    | Usa `departmentsApi.getAll()` con tipos `Department[]`                   |
| Estado de vacante `FILLED` inválido                             | 2026-07-08    | Se envía `CLOSED`                                                        |
| `LoginForm.tsx` con texto corrupto (`roundTomaed-[24px]`, `, cr`) | 2026-07-09  | Ni `tsc` ni ESLint lo detectaban — ver §6                                |
| Selector de estado en `AdvancedResults` usaba estados locales inventados (`NO_CONTRATADO/CONTACTADO/CONTRATADO`) | 2026-08-01 | Conectado a `PATCH /vacancies/:vacancyId/candidates/:candidateId/status` con valores reales de `ApplicationStatus` (`PENDIENTE/EN_PROCESO/SELECCIONADO/RECHAZADO`) |
| `handleHire` en `Resultados.tsx` llamaba a `updateStatus("CLOSED")` en vez de `updateCandidateStatus(..., "SELECCIONADO")` | 2026-08-01 | Corregido para llamar a `vacanciesApi.updateCandidateStatus` con el estado correcto |
| Botón Editar de `PositionHistory` no tenía ruta configurada | 2026-08-01 | Ruta `/position/edit/:id` añadida a `App.tsx`; botón Editar navega a ella; `Position.tsx` maneja el modo edición vía `useParams` |
| Panel admin con nombres de usuario en blanco y avatares con doble inicial | 2026-08-01 | `UserTableModule`, `RoleUpdateModule`, `UserDeleteModule` ahora muestran `email.split('@')[0]` como nombre; el avatar muestra una sola inicial |
| `getResults` retornaba 404 y rompía la página de resultados | 2026-08-01 | El 404 se trata como array vacío en vez de relanzar el error |
| Componentes huérfanos: `DemoCredential.jsx`, `EmptyVacancyState.tsx`, `dashboardConfig.js` | 2026-08-01 | Archivos eliminados |
| `src/src/vite-env.d.ts` en carpeta anidada incorrecta | 2026-08-01 | Reubicado en `src/vite-env.d.ts` |
