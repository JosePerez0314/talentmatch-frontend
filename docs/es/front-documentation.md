# Documentación del Frontend — TalentMatch AI

> Documentación del **estado actual real** del frontend: estructura, componentes, capa de datos, flujos y su grado de conexión con el backend.
>
> 🇬🇧 English version: [`../en/front-documentation.md`](../en/front-documentation.md)
>
> Documentos relacionados: [`../../CLAUDE.md`](../../CLAUDE.md) (reglas de trabajo) · [`api-documentation.md`](./api-documentation.md) (contrato del backend) · [`bugs.md`](./bugs.md) (inventario de bugs) · [`issues.md`](./issues.md) + [`issues/`](./issues/) (planes de QA por pantalla) · [`last-changes.md`](./last-changes.md) (registro de cambios).
>
> **Última verificación contra el código:** 2026-07-14.
>
> **Resumen del estado:** todas las pantallas están conectadas a la API real — ya no queda ninguna pantalla 100 % mock. Los `MOCK_*`/`setTimeout` que documentaba la versión anterior de este archivo (Dashboard, Panel Admin) fueron reemplazados por llamadas reales. Lo que queda pendiente son **bugs menores** (código muerto, una pantalla legacy con un bug de parsing, un prop ignorado, inconsistencias de nombres) — ninguno impide usar la app con normalidad. Ver el detalle completo en [`bugs.md`](./bugs.md).

---

## 1. Resumen del producto

SPA de reclutamiento (dashboard) para:

- Subir CVs (PDF) y evaluarlos con IA contra vacantes.
- Gestionar **Departamentos → Posiciones → Vacantes → Candidatos**.
- Ver rankings de matching (MatchScore) por vacante.
- Administrar usuarios (panel admin), incluyendo creación de usuarios y cambio de rol.

La UI y la mayoría de comentarios están en **español**; los identificadores mezclan español e inglés. Los comentarios **nuevos** se escriben en inglés (ver `CLAUDE.md`).

---

## 2. Stack tecnológico real

| Área          | Tecnología                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework     | **React 19** (`react` / `react-dom` ^19.2)                                                                                                                                          |
| Bundler / dev | **Vite 5**                                                                                                                                                                          |
| Lenguaje      | **TypeScript** (migración `.jsx`→`.tsx` casi terminada — quedan 5 archivos `.jsx`, ver §3)                                                                                          |
| Estilos       | **Tailwind CSS v4** vía `@tailwindcss/vite` (configurado en `src/index.css` con `@import "tailwindcss"`). El `tailwind.config.js` de la raíz es un stub v3 heredado y **no se usa**. |
| Routing       | **react-router-dom v7**                                                                                                                                                             |
| Estado global | **React Context** (`AuthContext`) — no hay Redux                                                                                                                                    |
| HTTP          | Cliente `fetch` **hecho a mano** (`apiClient.ts`) — no hay Axios                                                                                                                     |
| Iconos        | `lucide-react` **y** `react-icons` coexisten (ver §5), más SVGs locales en `assets/icons/`                                                                                          |
| Capturas      | `html-to-image` — usado por `EvaluationsHistory` para copiar los resultados como imagen al portapapeles                                                                             |
| Type-check    | `vite-plugin-checker` con `typescript: true` → **los errores de tipo rompen `dev` y `build`**                                                                                       |
| Lint          | ESLint 9 con `@typescript-eslint/no-explicit-any` como **error** — el barrido actual confirma **cero** usos de `any` en todo `src/`                                                 |

> **`package.json` está limpio.** No hay dependencias muertas (`express`, `cors`, `dotenv` — que versiones anteriores de esta documentación mencionaban — **no existen** en el `package.json` actual). Tampoco hay `react-router` suelto junto a `react-router-dom`.

> **`vite.config.ts`** fija `server.port: 5173` con `strictPort: true` — evita que el dev server arranque en otro puerto si el 5173 está ocupado, lo que rompería silenciosamente el `Origin` esperado por CORS del backend.

### Comandos

```bash
npm run dev      # Servidor de desarrollo Vite (puerto fijo 5173)
npm run build    # Build de producción (falla ante errores de tipo)
npm run lint     # ESLint
npm run preview  # Sirve el dist/ ya construido
```

**No hay test runner** (ni Jest ni Vitest, ni archivos `*.test.*`/`*.spec.*`). Tampoco hay un script de typecheck aparte: `vite-plugin-checker` corre `tsc` dentro del proceso de Vite. Verificación = `npm run build` (tipos) + QA manual en `npm run dev`.

---

## 3. Estructura de carpetas

```
src/
├── App.tsx                 # Router + ProtectedRoute + AdminRoute + layout
├── main.tsx                # Bootstrap React (StrictMode)
├── index.css                # Tailwind v4 + scrollbar custom
├── App.css                  # (heredado, 5 líneas)
├── src/vite-env.d.ts         # ⚠️ carpeta anidada src/src/ — ver §11
├── assets/icons/             # SVGs + index.ts (re-exporta como `Icons`)
├── components/
│   ├── admin/                # StatCard, StatsModule, UserTableModule, CreateUserModule, RoleUpdateModule, UserDeleteModule
│   ├── cards/                 # CandidateMatchRow.tsx, MetricCard.tsx
│   ├── context/               # AuthContext.tsx
│   ├── modals/                 # CandidateDetailsModal, DeleteDepartmentModal, EditDepartmentModal, VacancyActionModal, TimeoutWarningModal
│   ├── routes/                  # AdminRoute.tsx  ← guard de rol para /admin
│   ├── Sections/                 # ActionDropdown, PositionHistoryTable, PositionSuccess, VacancySuccess, UploadCVSuccess
│   ├── ui/                        # AuthInput, LoginForm, PillInput, ProcessingModal, SessionTimeoutGuard, EmptyVacancyState (huérfano)
│   ├── DemoCredential.jsx (huérfano), EmptyState.jsx, EvaluationCard.tsx, HistoryTable.jsx
├── layouts/                  # Sidebar.tsx, Footer.jsx
├── pages/                    # Pantallas de nivel de ruta (ver §8)
├── services/api/             # apiClient + un *.api.ts por dominio (ver §6)
├── services/session.ts       # Persistencia de sesión en localStorage (ver §4.3)
├── types/                    # Contratos TypeScript por dominio (ver §7)
└── utils/                    # loginShortcuts.ts (real), dashboardConfig.js (huérfano)
```

**Estado de la migración TS:** solo quedan 5 archivos `.jsx`/`.js`: `CVHistory.jsx`, `DemoCredential.jsx` (huérfano), `EmptyState.jsx`, `HistoryTable.jsx`, `TimeoutWarningModal.jsx`, `ProcessingModal.jsx`, `SessionTimeoutGuard.jsx`, `dashboardConfig.js` (huérfano). Todo lo demás — incluidas todas las páginas salvo `CVHistory.jsx` — ya está en TypeScript. Regla: **componentes nuevos en TypeScript**; portar un archivo a TS cuando se le hagan cambios sustanciales.

---

## 4. Arquitectura núcleo

### 4.1 Routing (`src/App.tsx`, 87 líneas)

- `/` → `<Navigate to="/login" replace />`.
- `/login` es la **única ruta pública**.
- Todo lo demás vive dentro de **`ProtectedRoute`** (un `<Route element={<ProtectedRoute/>}>` con `<Outlet/>`), que redirige a `/login` si `useAuth().user` es falsy.
- `/admin` va además dentro de **`AdminRoute`**, anidada dentro de `ProtectedRoute` (requiere sesión **y** rol `ADMIN`).
- Comodín `*` → `<Navigate to="/dashboard" replace />` (que a su vez rebota a login si no hay sesión).

**Reutilización de páginas por ruta** (misma pantalla, distinta URL con params):

| Componente           | Rutas                                              |
| --------------------- | ---------------------------------------------------- |
| `Vacancy`             | `/vacancy`, `/vacancy/edit/:id` (modo create/edit vía `Boolean(useParams().id)`) |
| `Resultados`          | `/resultados`, `/resultados/:id`                       |
| `EvaluationsHistory`  | `/evaluations-history`, `/evaluations-history/:id`     |
| `AdvancedResults`     | `/advanced-results/:id`                                |

#### Tabla completa de rutas

| Ruta                                               | Página                | Protección                  | Nota                                                                 |
| --------------------------------------------------- | ----------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| `/login`                                           | `Login`                | ❌ pública                     |                                                                          |
| `/dashboard`                                       | `Dashboard`            | ✅ sesión                      | Conectada a `dashboardService.getSummary()`                             |
| `/position`                                        | `Position`             | ✅ sesión                      | Wizard de 4 pasos, manual o con IA                                       |
| `/uploadcv`                                        | `UploadCV`             | ✅ sesión                      |                                                                          |
| `/cv-history`                                      | `CVHistory`            | ✅ sesión                      | ⚠️ pantalla paralela a `CandidatesHistory`, no enlazada desde el sidebar — ver §10 |
| `/position-history`                                | `PositionHistory`      | ✅ sesión                      |                                                                          |
| `/vacancy`, `/vacancy/edit/:id`                    | `Vacancy` (`CreateVacancy`) | ✅ sesión                 |                                                                          |
| `/vacancy-history`                                 | `VacancyHistory`       | ✅ sesión                      | Importada en `App.tsx` con el nombre `VacacyHistory` (typo, ver §10)     |
| `/department`                                      | `CreateDepartment`     | ✅ sesión                      |                                                                          |
| `/department-history`                              | `DepartmentHistory`    | ✅ sesión                      |                                                                          |
| `/resultados`, `/resultados/:id`                   | `Resultados`           | ✅ sesión                      | ⚠️ pantalla legacy no enlazada desde ningún lugar de la UI — ver §10     |
| `/candidates-history`                              | `CandidatesHistory`    | ✅ sesión                      | Agrupa candidatos por vacante (usa `vacanciesApi.getAll()`)              |
| `/evaluations-history`, `/evaluations-history/:id` | `EvaluationsHistory`   | ✅ sesión                      | El param `:id` nunca se lee — la pantalla es una máquina de estados propia, ver §10 |
| `/advanced-results/:id`                            | `AdvancedResults`      | ✅ sesión                      | Pantalla de resultados "actual", enlazada desde Vacantes/Candidatos       |
| `/admin`                                           | `AdminPanel`           | ✅ sesión + **rol `ADMIN`**    | El link del sidebar ya se filtra por rol (ver §4.4/§9)                   |

Sin lazy-loading/code-splitting: todas las páginas se importan de forma estática.

### 4.2 Cliente HTTP (`src/services/api/apiClient.ts`, 159 líneas)

Wrapper fino sobre `fetch`. Responsabilidades:

1. Prefija `VITE_API_URL` (limpia una `/` final).
2. Inyecta `Authorization: Bearer <token>` desde `localStorage` — **salvo** en endpoints marcados `isPublicEndpoint: true`.
3. **Desempaqueta el envelope del backend.** Soporta dos formas: `{ success, data, error/message, details }` (`ApiResponse<T>`) o la doble envoltura `{ response: { success, data } }` (`WrappedApiResponse<T>`, usada por el helper `sendResponseOr404` del backend) — usa la que esté presente.
4. Devuelve `.data` si está definido, salvo que se pida `raw: true` (devuelve el envelope completo).
5. Lanza `ApiError` (con `message`, `status`, `data`) ante `!response.ok` o `success: false`.

**`isPublicEndpoint` (opción por-llamada, usada hoy solo por `authService.login` y `authService.register`):**

- No adjunta `Authorization` al request (evita mandar un token viejo/inválido a `POST /users/login` o `POST /users`).
- Un `401` en un endpoint público **no** dispara `endExpiredSession()` — se propaga como `ApiError` normal, así el formulario de login puede mostrar "credenciales incorrectas" en vez de que la app borre la sesión y redirija fuera del propio formulario que el usuario está llenando.

**401 en endpoints no públicos:** llama a `endExpiredSession()` (limpia `localStorage` vía `session.ts` y hace `window.location.assign("/login")`, salvo que ya se esté en `/login`). Esto es un cambio real respecto a versiones anteriores del frontend, donde el 401 no disparaba logout.

> ⚠️ **`BASE_URL` sigue sin fallback.** `const BASE_URL: string = import.meta.env.VITE_API_URL;` — si la variable no está definida, el primer request usa literalmente la URL `"undefined/users/login"`. No hay `.env.example` comprometido en el repo pese a que `.gitignore` deja una excepción explícita para él (`!.env.example`) — un clon nuevo no tiene ninguna plantilla que lo guíe. Ver `bugs.md`.

### 4.3 Autenticación (`src/components/context/AuthContext.tsx` + `src/services/session.ts`)

- `AuthProvider` envuelve toda la app; hidrata el estado de forma síncrona vía `readStoredSession()` en el inicializador de `useState` (no hay estado `loading` que esperar).
- `readStoredSession()` (`session.ts`): si `tm_user` existe pero no hay `token`, trata la sesión como inválida y limpia ambas claves (evita quedar "logueado" en apariencia pero sin token real). Valida que `role` sea exactamente `"ADMIN"` o `"USER"`; cualquier otro valor invalida la sesión.
- `login({email, token, role, username?})` — si no se pasa `username`, se deriva del local-part del email (`deriveUsername`).
- `logout()` limpia `localStorage` (vía `clearStoredSession`) y hace `window.location.href = "/login"` (recarga completa, no `navigate`).
- Se consume vía el hook **`useAuth()`** (lanza si se usa fuera del provider).

```ts
// src/types/auth.types.ts
export type SessionRole = UserRole; // 'ADMIN' | 'USER' — mismo enum que el backend, sin traducción de casing
export interface SessionUser {
  email: string;
  role: SessionRole;
  username: string;
}
```

> ✅ **La desalineación de casing de roles que documentaban versiones anteriores ya no existe.** El backend emite `ADMIN`/`USER` y **todo** el frontend (`AuthContext`, `session.ts`, `AdminRoute`, `types/api.types.ts`, `types/auth.types.ts`) usa ese mismo enum en mayúsculas — no hay ningún `'admin' | 'user'` en minúsculas en el código actual. La única normalización que queda es defensiva y vive en `Login.tsx`: `asRole(role) = role === "ADMIN" ? "ADMIN" : "USER"`, para el caso borde de que el backend devuelva algo inesperado.
- Tras un login exitoso, `Login.tsx` navega explícitamente: `navigate(role === "ADMIN" ? "/admin" : "/dashboard")` — un admin no pasa primero por `/dashboard`.
- `Login.tsx` también resuelve atajos de demo vía `resolveLoginEmail()` (`utils/loginShortcuts.ts`): escribir solo `"admin"` en el campo de correo lo expande a `admin@admin.ai` al enviar el formulario. El `<input>` de email alterna `type="text"`/`type="email"` (`LoginForm.tsx`) para que la validación nativa del navegador no bloquee ese atajo antes de que se expanda.

### 4.4 Guard de rol (`src/components/routes/AdminRoute.tsx`, 13 líneas)

```ts
export const AdminRoute: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
```

Comparación directa contra `'ADMIN'` (sin `.toLowerCase()`, ya no hace falta). **Sin `console.log`** — el volcado de depuración que documentaban versiones anteriores fue eliminado.

### 4.5 Guardián de sesión (`src/components/ui/SessionTimeoutGuard.jsx`)

Watchdog global de inactividad, montado en el layout protegido:

- Escucha eventos de actividad → actualiza `lastActivity` en `localStorage` (throttleado a máximo 1 escritura/segundo).
- **Advierte a los 9 min** (modal `TimeoutWarningModal`), **cierra sesión a los 10 min**.
- Sincroniza `lastActivity` **entre pestañas** vía evento `storage`.
- Al expirar: `logout()` + `navigate("/login", { state: { sessionExpired: true } })`.

---

## 5. Estilos y assets

- **Tailwind v4 inline** en el JSX. Abundan **valores arbitrarios hardcodeados** (`bg-[#F0F0F5]`, `text-[#447ECA]`). No hay tokens de tema centralizados.
- Color corporativo de facto: **`#447ECA`** (azul). Fondo app: `#F0F0F5`.
- `index.css` (25 líneas): importa Tailwind y define un scrollbar custom "enterprise" (fino, aparece en hover). `App.css` son 5 líneas sin contenido relevante.
- **Dos librerías de íconos coexisten:** `lucide-react` (uso pervasivo) y `react-icons` (usado solo en `DeleteDepartmentModal.tsx`, `EvaluationCard.tsx` y el componente huérfano `EmptyVacancyState.tsx`). No es un bug, pero es deuda de consistencia — ver `bugs.md`.
- **Iconos locales:** SVGs en `assets/icons/` re-exportados como objeto `Icons` desde `assets/icons/index.ts` (`Icons.sidebar.*`, `Icons.auth.*`, `Icons.logos.*`, …).
- No hay sistema BEM/CSS-modules.

> ⚠️ Una clase de Tailwind mal escrita **no rompe el build ni el lint** — para el compilador es solo un string dentro de `className`. Los typos de clases solo se detectan mirando la app en el navegador.

---

## 6. Capa de servicios API (`src/services/api/`)

Un objeto-servicio por dominio. **Nunca se llama `fetch` directo** desde una página. **Los ocho archivos son reales — no queda ningún servicio simulado.**

| Servicio           | Archivo              | Métodos                                                                                                              | Estado                                      |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `authService`      | `auth.api.ts`        | `login`, `register`                                                                                                  | ✅ ambos como `isPublicEndpoint: true`         |
| `departmentsApi`   | `departments.api.ts` | `getAll`, `getById`, `create`, `update`, `delete`                                                                     | ✅ **flujo de referencia, 100 % funcional**    |
| `positionService`  | `positions.api.ts`   | `getAll`, `getById`, `create`, `update`, `delete`, `completeWithAI`, `duplicate`                                      | ✅ funcional                                    |
| `vacanciesApi`     | `vacancies.api.ts`   | `getAll`, `getById`, `create`, `update`, `updateStatus`, `delete`, `getResults`, `uploadCVs`, `evaluateCandidates`   | ✅ funcional                                    |
| `candidateService` | `candidates.api.ts`  | `getAll`                                                                                                             | ✅ solo lectura — el comentario del archivo aclara explícitamente que actualizar el status de un candidato individual **no está implementado**; esa responsabilidad se movió a `vacanciesApi.updateStatus` (cierra la vacante completa) |
| `dashboardService` | `dashboard.api.ts`   | `getSummary`                                                                                                         | ✅ **conectado** — `Dashboard.tsx` lo consume  |
| `adminService`     | `admin.api.ts`       | `getStats`, `getUsers`, `updateRole`, `deleteUser`, `createUser`                                                     | ✅ **reescrito sobre `apiClient` — ya no es un mock** |

Todos los métodos devuelven ya el tipo desempaquetado (`Promise<Position[]>`, `Promise<Vacancy>`, `Promise<void>`…), no `Promise<ApiResponse<T>>`. `apiClient` se encarga del envelope, así que los llamadores **no deben re-desempaquetar**.

### 6.1 `admin.api.ts` ya no es un simulacro

La documentación anterior advertía que `adminService` devolvía datos inventados con `MOCK_USERS` + `setTimeout`. **Esto ya no es así**: los cinco métodos llaman a `apiClient` contra endpoints reales —

```ts
getStats()                     // GET  /admin/stats
getUsers(page = 1, limit = 50) // GET  /admin/users?page&limit → { users, meta }
updateRole(userId, newRole)    // PUT  /admin/users/:id/role
deleteUser(userId)             // DELETE /admin/users/:id
createUser(email, password)    // POST /users (endpoint público; se crea como USER, y si el admin
                                // eligió rol ADMIN en el formulario, CreateUserModule hace un
                                // segundo llamado a updateRole)
```

No quedan `console.log`, `setTimeout` ni `any` en este archivo.

### 6.2 Normalización de departamentos (patrón de referencia)

`departmentsApi` hace mapeo de negocio backend↔UI mediante una interfaz `RawDepartment` y una función `normalizeRawDepartment` tipada (sin `any`):

- `id: number` → `id: string`.
- El backend usa `title`; la UI usa `name` (se traduce en ambos sentidos, tanto al leer como al escribir).
- Aplana `_count.positions` → `positionsCount`.

Es el patrón a imitar al conectar otros dominios cuya forma no coincide con la UI.

---

## 7. Modelo de tipos (`src/types/`)

Contratos TS por dominio. Enums clave (en `api.types.ts`):

```ts
type UserRole = "ADMIN" | "USER";
type EducationLevel =
  | "NONE" | "HIGH_SCHOOL" | "BACHELOR" | "TECHNICAL"
  | "UNIVERSITY" | "MASTER" | "DOCTORATE";
type VacancyStatus = "ACTIVE" | "PAUSED" | "CLOSED";
type CandidateStatus = "DISPONIBLE" | "CONTRATADO";
```

| Archivo                       | Contenido                                                                                                                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.types.ts`                | Enums + `User`, `Position`, `Vacancy` (incluye `_count.candidates` y `candidates?: Candidate[]`, solo presentes en el endpoint de listado), `Candidate` (tiene `fileUrl` actual y `resumeUrl` legacy), `NormalizedCandidate`, `MatchResult` (documenta `normalizedCandidate?: string` como **JSON serializado** que hay que parsear), `ApiResponse<T>`, `ApiErrorDetail`, `UploadResult` |
| `auth.types.ts`                | `AuthUser`, `LoginResponse`, `SessionRole`, `SessionUser`, `LoginSession`, `AuthContextValue`, `AuthUiState` — con comentarios explícitos sobre las dos "trampas" del objeto de usuario del backend (rol en mayúsculas, sin `username`) |
| `dashboard.types.ts`          | Tipos de wire (`DashboardTotals`, `VacancyStatusBreakdownItem`, `MonthlyActivityItem`, `DashboardSummary`) **y** tipos de UI (`DashboardMetric`, `DashboardVacancyStatusCard`, `MonthlyData`) — ⚠️ el comentario en línea dice "mock data" pero estos tipos ya se llenan con datos reales (ver `bugs.md`) |
| `department.types.ts`         | `Department`, `CreateDepartmentInput`, `UpdateDepartmentInput`                                                                                                                                                            |
| `admin.types.ts`              | `StatItem`, `StatCardColorType` — ya **no** define su propio tipo de rol; reutiliza `UserRole` transitivamente                                                                                                            |
| `evaluations.types.ts`        | `EvaluationVacancy` (forma de UI; su campo `status: "Activa" | "Cerrada"` es casi siempre `"Activa"` en la práctica porque la lista fuente ya viene filtrada a `ACTIVE`)                                                     |

**Inconsistencia viva:**

- El enum real de candidato es `CandidateStatus = "DISPONIBLE" | "CONTRATADO"`, pero varias pantallas (`AdvancedResults.tsx`, `EvaluationsHistory.tsx`) manejan localmente estados adicionales como `"CONTACTADO"`/`"NO_CONTRATADO"` que **no existen en el backend** — son puramente cosméticos, se resetean al recargar la página y nunca se envían a la API. Ver `bugs.md`.

---

## 8. Inventario de páginas y su estado de conexión

**Leyenda:** ✅ Conectada a API real · ⚠️ Conectada, con una particularidad a tener en cuenta.

| Página                  | Archivo                  | Estado | Servicio                                                         | Notas                                                                                                                                                  |
| ------------------------- | -------------------------- | -------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login                   | `Login.tsx`              | ✅     | `authService.login`                                              | Atajo de demo (`admin` → `admin@admin.ai`), navega directo a `/admin` si el rol es `ADMIN`.                                                             |
| Dashboard               | `Dashboard.tsx`          | ✅     | `dashboardService.getSummary`                                     | Métricas, gráfica SVG de actividad mensual y distribución de estados — todo desde el backend real. Loading/error/empty states completos.               |
| Crear Departamento      | `CreateDepartment.tsx`   | ✅     | `departmentsApi.create`                                          | Surface los `details` de Zod vía `ApiError`. Tiene un `console.debug` (no `console.log`) para detalle de validación.                                    |
| Historial Departamentos | `DepartmentHistory.tsx`  | ✅     | `departmentsApi.getAll/update/delete`                             | **Flujo de referencia completo.** Eliminar requiere escribir el nombre exacto del departamento en el modal.                                             |
| Crear Posición          | `Position.tsx`           | ✅     | `positionService.create/completeWithAI`, `departmentsApi.getAll` | Wizard de 4 pasos, manual o autocompletado con IA vía PDF.                                                                                               |
| Historial Posiciones    | `PositionHistory.tsx`    | ✅     | `positionService.getAll/delete/duplicate`                         | Tabs de departamento calculados en cliente.                                                                                                             |
| Nueva/Editar Vacante    | `Vacancy.tsx`            | ⚠️     | `vacanciesApi`, `positionService`, `departmentsApi`              | Funcional de punta a punta, pero la pantalla de éxito ignora el `onReset` que le pasa (ver §10 / `bugs.md`).                                            |
| Historial Vacantes      | `VacancyHistory.tsx`     | ✅     | `vacanciesApi.getAll/updateStatus/delete`                         | Kebab con transiciones de estado (Activa/Pausada/Cerrada) vía `VacancyActionModal`.                                                                     |
| Subir CV                | `UploadCV.tsx`           | ✅     | `vacanciesApi.getAll/uploadCVs`                                  | Selector de vacante activa obligatorio, drag-and-drop a nivel de ventana + selector de archivos. Valida `application/pdf`.                              |
| Historial CVs           | `CVHistory.jsx`          | ⚠️     | `candidateService.getAll`                                        | Pantalla paralela a `CandidatesHistory` con una fuente de datos distinta (`/candidates` plano) — no está enlazada desde el sidebar. Ver §10.            |
| Resultados (legacy)     | `Resultados.tsx`         | ⚠️     | `vacanciesApi.getResults/updateStatus`                           | Pantalla de resultados más antigua, no enlazada desde ningún lugar de la UI. Tiene un bug de parsing en `CandidateMatchRow` (ver §10 / `bugs.md`). Es la única pantalla donde "Contratar" persiste de verdad (cierra la vacante). |
| Resultados Avanzados    | `AdvancedResults.tsx`    | ✅     | `vacanciesApi.getResults/getById/getAll/uploadCVs/evaluateCandidates` | Pantalla de resultados **actual**: dos secciones (candidatos subidos / evaluados), guard de recálculo, manejo de estado `PAUSED`.                        |
| Historial Candidatos    | `CandidatesHistory.tsx`  | ✅     | `vacanciesApi.getAll`                                             | Agrupa candidatos por vacante (usa `GET /vacancies` con `candidates[]` anidado, no `GET /candidates`).                                                  |
| Evaluaciones            | `EvaluationsHistory.tsx` | ✅     | `vacanciesApi.evaluateCandidates/getResults`, `departmentsApi.getAll` | Máquina de estados (idle/calculating/done/empty). Incluye "Compartir" (captura como imagen vía `html-to-image`).                                        |
| Panel Admin             | `AdminPanel.tsx`         | ✅     | `adminService` (real)                                             | Incluye `CreateUserModule` (nuevo). Paginación real desde `GET /admin/users`.                                                                            |

### Resumen de conexión

- **Todas las pantallas llaman a la API real.** No queda ninguna pantalla mock.
- **Con particularidades a resolver (menores, no bloqueantes):** Nueva/Editar Vacante (prop `onReset` ignorado), Historial de CVs y Resultados legacy (pantallas paralelas sin enlazar, una de ellas con un bug de parsing). Detalle completo en [`bugs.md`](./bugs.md).

---

## 9. Inventario de componentes

### `layouts/`

- **`Sidebar.tsx`** (236 líneas) — navegación por grupos (`MENU_GROUPS`): Dashboard (+ Panel Admin condicional) · Acciones Rápidas · Registros · Análisis. ✅ **El link "Panel Admin" ya se filtra por rol** (`user?.role === "ADMIN"`) — el bug que documentaban versiones anteriores (visible para todos) está resuelto. ⚠️ Conserva un mecanismo `isDynamic`/`lastVacancyId` vestigial: ningún `MenuItem` actual lo activa, pero `VacancyHistory.tsx` sigue escribiendo `lastVacancyId` en `localStorage` para él (código muerto, ver `bugs.md`). El logout llama a `logout()` (que ya navega) y además hace su propio `navigate("/login")` — doble navegación redundante pero inofensiva.
- **`Footer.jsx`** — pie estático, solo se renderiza en `Login.tsx`.

### `components/routes/`

- **`AdminRoute.tsx`** — ver §4.4. Ya no tiene `console.log`.

### `components/context/`

- **`AuthContext.tsx`** — ver §4.3.

### `components/ui/`

- **`LoginForm.tsx`** — formulario de login. El campo de email alterna `type="text"`/`"email"` para permitir el atajo de demo.
- **`AuthInput.tsx`** — input estilizado de auth.
- **`PillInput.tsx`** — input tipo "pills"/tags (skills, idiomas). Soporta Enter y blur para añadir; la deduplicación la hace el llamador (`Position.tsx` con `Set`).
- **`ProcessingModal.jsx`** — modal de "procesando…" usado **solo** por `Resultados.tsx` (legacy); es una animación de progreso cosmética (`setInterval` de 3 pasos fijos), no refleja progreso real.
- **`SessionTimeoutGuard.jsx`** — ver §4.5.
- **`EmptyVacancyState.tsx`** — ⚠️ **huérfano**, no se importa desde ningún lugar.

### `components/modals/`

- **`CandidateDetailsModal.tsx`** (442 líneas) — vista canónica de detalle de candidato; parsea correctamente `normalizedCandidate` como JSON (`parseNormalized`, con try/catch). Usada por `Resultados`, `AdvancedResults` y `EvaluationsHistory`.
- **`EditDepartmentModal.tsx`** / **`DeleteDepartmentModal.tsx`** — edición/borrado de departamento (flujo de referencia); el borrado exige escribir el nombre exacto.
- **`VacancyActionModal.tsx`** — confirmación de cambio de estado con copy/colores por estado (ACTIVE/PAUSED/CLOSED).
- **`TimeoutWarningModal.jsx`** — aviso de inactividad (9 min), puramente presentacional.

### `components/cards/`

- **`CandidateMatchRow.tsx`** — usado únicamente por `Resultados.tsx` (legacy). ⚠️ Trata `normalizedCandidate` como si ya fuera un objeto en vez de parsear el string JSON documentado en `api.types.ts` — ver `bugs.md`.
- **`MetricCard.tsx`** — tarjeta de métrica del Dashboard; renderiza un `<Link>` si recibe `to`, o un `<div>` plano si no.

### `components/Sections/`

- **`ActionDropdown.tsx`** — menú de acciones de fila genérico (editar/eliminar/duplicar), usado por `PositionHistoryTable`.
- **`PositionHistoryTable.tsx`** — tabla de posiciones con badge de departamento.
- **`PositionSuccess.tsx`**, **`UploadCVSuccess.tsx`** — pantallas de éxito; `UploadCVSuccess` lista el resultado por archivo desde `UploadResult[]`.
- **`VacancySuccess.tsx`** — ⚠️ declara recibir `{vacancyCode, onReset}` pero solo desestructura `vacancyCode` — `onReset` se ignora en silencio pese a que `Vacancy.tsx` sí lo pasa. Sus propios botones navegan con `navigate(...)` hardcodeado, así que el comportamiento visible funciona por coincidencia, no porque el callback se invoque. Ver `bugs.md`.

### `components/admin/`

Los cinco módulos consumen `adminService` real, con estados de carga/error propios.

- **`StatsModule.tsx`** + **`StatCard.tsx`** — grid de 6 métricas desde `GET /admin/stats`. `StatCard` resuelve el ícono de `lucide-react` dinámicamente por nombre de string (con un `@ts-ignore` porque el namespace de `lucide-react` no está tipado para indexado arbitrario), con fallback a `HelpCircle`.
- **`UserTableModule.tsx`** — tabla paginada. ⚠️ El buscador filtra solo los usuarios de la **página actual** (10 filas), no el total del sistema — limitación de UX menor, no un bug de datos.
- **`CreateUserModule.tsx`** — nuevo módulo. Valida la política de contraseña en cliente (10-100 caracteres, mayúscula/minúscula/dígito) espejando la política documentada del backend. Si el rol elegido es `ADMIN`, hace un segundo llamado a `updateRole` tras crear el usuario.
- **`RoleUpdateModule.tsx`** — cambio de rol con edición diferida por usuario (`pendingRoles`) antes de guardar.
- **`UserDeleteModule.tsx`** — confirmación en dos pasos in-place ("Eliminar" → "¿Confirmar?"), sin modal ni `window.confirm`.

### Sueltos

- **`EvaluationCard.tsx`** — tarjeta de vacante activa en Evaluaciones, con botón "Calcular".
- **`HistoryTable.jsx`** — tabla genérica usada solo por `CVHistory.jsx`; lee varios nombres de campo alternativos para la URL del CV (`cv.fileUrl || cv.cvUrl || cv.rawApiPayload?.cvUrl`), lo que sugiere que se escribió contra una forma de API más antigua/laxa que la que documenta `candidates.api.ts` hoy.
- **`DemoCredential.jsx`** — ⚠️ **huérfano**, no se importa ni renderiza en ninguna parte. `Login.tsx` no lo usa.
- **`EmptyState.jsx`** — estado vacío genérico, usado por `CVHistory.jsx`.

---

## 10. Bugs y deuda técnica conocidos

Inventario completo, con severidad y archivos, en [`bugs.md`](./bugs.md). Resumen — **todos son menores; ninguno impide usar la app con normalidad:**

- `VacancySuccess.tsx` ignora el callback `onReset` que le pasa `Vacancy.tsx`.
- `CandidateMatchRow.tsx` (pantalla legacy `Resultados.tsx`) trata `normalizedCandidate` como objeto en vez de parsear el JSON — probablemente renderiza los skills en cero en esa pantalla.
- Dos pares de pantallas solapadas y no del todo enlazadas: `Resultados` vs `AdvancedResults`, y `CVHistory` vs `CandidatesHistory`.
- `/evaluations-history/:id` declara un parámetro de ruta que nunca se lee.
- Mecanismo `isDynamic`/`lastVacancyId` del Sidebar, vestigial.
- Componentes huérfanos: `DemoCredential.jsx`, `EmptyVacancyState.tsx`, `utils/dashboardConfig.js`.
- Comentarios desactualizados: `dashboard.types.ts` dice "mock data" (ya no lo es); `main.tsx` tiene un `@ts-ignore` con un comentario sobre migrar `App` a `.tsx` (ya migrado).
- Estados de candidato `"CONTACTADO"`/`"NO_CONTRATADO"` solo existen en la UI, nunca se persisten y no están en el enum real del backend.
- `apiClient.ts` sigue sin fallback para `VITE_API_URL`; no hay `.env.example` comprometido.
- Detalles cosméticos: typo `VacacyHistory` en el import de `App.tsx`, carpeta anidada `src/src/vite-env.d.ts`.

---

## 11. Convenciones y deuda técnica

**Convenciones a seguir:**

- Componentes/módulos **nuevos en TypeScript** con interfaces explícitas.
- Endpoints **siempre** como métodos de un `*.api.ts`; nunca `fetch`/`apiClient` crudo desde una página.
- Los servicios devuelven el tipo ya desempaquetado; **no re-desempaquetar** en el llamador.
- Normalización defensiva backend↔UI en la capa de servicios (patrón de `departments.api.ts`).
- Evitar `any` (ESLint lo marca como **error**) — el barrido actual confirma cero usos.
- Comentarios de código **nuevos en inglés**.
- Commits en **Conventional Commits** (`<type>(<scope>): <subject>`, en inglés).

**Deuda técnica destacada (ver `bugs.md` para el detalle completo):**

- Pantallas duplicadas/paralelas sin consolidar (`Resultados`/`AdvancedResults`, `CVHistory`/`CandidatesHistory`).
- Estados de candidato ad-hoc en la UI que no existen en el backend.
- Dos librerías de íconos (`lucide-react` + `react-icons`) coexistiendo.
- `apiClient` sin fallback de `VITE_API_URL` y sin `.env.example` comprometido.
- Puñado de código muerto (componentes huérfanos, mecanismo del sidebar, comentarios desactualizados).

---

## 12. Entorno y despliegue

- Variable requerida vía `import.meta.env`: **`VITE_API_URL`**. **No hay valor por defecto** — sin ella la app falla en el primer request.
- El `.env` local (no versionado) también define `VITE_TEST_USER`/`VITE_TEST_PASS`, pero **ningún archivo de `src/` los lee** — son variables muertas hoy.
- ⚠️ **Nunca leer el archivo `.env`** (regla de `CLAUDE.md`). Inferir las variables desde los usos de `import.meta.env.*`.
- **`vercel.json`** reescribe todas las rutas no-`/api` a `index.html` (SPA routing en Vercel).

---

## 13. Cómo continuar (guía rápida)

1. **Levantar:** `npm install` → definir `VITE_API_URL` → `npm run dev` (puerto fijo 5173) → login.
2. **Antes de tocar datos:** el flujo de **Departamentos** sigue siendo el patrón de referencia funcional; imítalo al conectar dominios nuevos.
3. **Prioriza la deuda de `bugs.md`** — todo es menor, pero el prop `onReset` ignorado y el bug de parsing en `CandidateMatchRow` son los más concretos de arreglar.
4. **Decide qué hacer con las pantallas duplicadas** (`Resultados` vs `AdvancedResults`, `CVHistory` vs `CandidatesHistory`): ¿consolidar en una sola, o retirar la ruta legacy del router?
5. **Verifica cada cambio con `npm run build`** (no hay tests; los errores de tipo rompen el build).
6. Recuerda que **`npm run build` no valida clases de Tailwind ni strings sueltos**: revisa la UI en el navegador.
7. Para QA detallado por pantalla (márgenes, responsive, checklist de pruebas), consulta [`issues/`](./issues/) — cubre Dashboard, Panel Admin, Historial de Posiciones/Vacantes/Departamentos/Candidatos y Evaluaciones.

---

_Documento generado a partir del análisis del código fuente. Ante discrepancias entre este documento y el código, el código manda: actualiza esta documentación._
