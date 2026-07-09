# Documentación del Frontend — TalentMatch AI

> Documentación del **estado actual real** del frontend: estructura, componentes, capa de datos, flujos y su grado de conexión con el backend.
>
> 🇬🇧 English version: [`../en/front-documentation.md`](../en/front-documentation.md)
>
> Documentos relacionados: [`../../CLAUDE.md`](../../CLAUDE.md) (reglas de trabajo) · [`api-documentation.md`](./api-documentation.md) (contrato del backend) · [`bugs.md`](./bugs.md) (inventario de bugs) · [`issues.md`](./issues.md) + [`issues/P0.md`](./issues/P0.md)–[`issues/P3.md`](./issues/P3.md) (backlog priorizado) · [`last-changes.md`](./last-changes.md) (registro de cambios).
>
> **Última verificación contra el código:** 2026-07-09.

---

## 1. Resumen del producto

SPA de reclutamiento (dashboard) para:

- Subir CVs (PDF) y evaluarlos con IA contra vacantes.
- Gestionar **Departamentos → Posiciones → Vacantes → Candidatos**.
- Ver rankings de matching (MatchScore) por vacante.
- Administrar usuarios (panel admin).

La UI y la mayoría de comentarios están en **español**; los identificadores mezclan español e inglés. Los comentarios **nuevos** se escriben en inglés (ver `CLAUDE.md`).

---

## 2. Stack tecnológico real

| Área          | Tecnología                                                                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | **React 19** (`react` / `react-dom` ^19.2)                                                                                                                                          |
| Bundler / dev | **Vite 5**                                                                                                                                                                          |
| Lenguaje      | **TypeScript** (migración `.jsx`→`.tsx` en curso)                                                                                                                                   |
| Estilos       | **Tailwind CSS v4** vía `@tailwindcss/vite` (configurado en `src/index.css` con `@import "tailwindcss"`). El `tailwind.config.js` de la raíz es un stub v3 heredado y **no se usa**. |
| Routing       | **react-router-dom v7**                                                                                                                                                             |
| Estado global | **React Context** (`AuthContext`) — no hay Redux                                                                                                                                    |
| HTTP          | Cliente `fetch` **hecho a mano** (`apiClient.ts`) — no hay Axios                                                                                                                     |
| Iconos        | `lucide-react` (v1.x), `react-icons` y SVGs locales en `assets/icons/`                                                                                                               |
| Type-check    | `vite-plugin-checker` con `typescript: true` → **los errores de tipo rompen `dev` y `build`**                                                                                        |
| Lint          | ESLint 9 con `@typescript-eslint/no-explicit-any` como **error**                                                                                                                     |

> **Dependencias muertas:** `package.json` incluye `express`, `cors` y `dotenv`. **No se usan** — el frontend es 100 % cliente. También aparece `react-router` junto a `react-router-dom` (el segundo ya arrastra al primero).

### Comandos

```bash
npm run dev      # Servidor de desarrollo Vite
npm run build    # Build de producción (falla ante errores de tipo)
npm run lint     # ESLint
npm run preview  # Sirve el dist/ ya construido
```

**No hay test runner** (ni Jest ni Vitest, ni archivos de test). Tampoco hay un script de typecheck aparte: `vite-plugin-checker` corre `tsc` dentro del proceso de Vite. Verificación = `npm run build` (tipos) + QA manual en `npm run dev`.

---

## 3. Estructura de carpetas

```
src/
├── App.tsx                 # Router + ProtectedRoute + layout
├── main.tsx                # Bootstrap React (StrictMode)
├── index.css               # Tailwind v4 + scrollbar custom
├── App.css                 # (heredado)
├── assets/icons/           # SVGs + index.ts (re-exporta como `Icons`)
├── components/
│   ├── admin/              # StatCard, StatsModule, UserTableModule, RoleUpdateModule, UserDeleteModule
│   ├── cards/              # CandidateMatchRow (.jsx), MetricCard (.tsx)
│   ├── context/            # AuthContext.tsx
│   ├── modals/             # CandidateDetailsModal, DeleteDepartmentModal, EditDepartmentModal, VacancyActionModal, TimeoutWarningModal
│   ├── routes/             # AdminRoute.tsx  ← guard de rol para /admin
│   ├── Sections/           # ActionDropdown, PositionHistoryTable, PositionSuccess, UploadCVSuccess, VacancySuccess
│   ├── ui/                 # AuthInput, LoginForm, PillInput, ProcessingModal, SessionTimeoutGuard, StatusDropdown, EmptyVacancyState
│   ├── DemoCredential.jsx, EmptyState.jsx, EvaluationCard.tsx, HistoryTable.jsx
├── layouts/                # Sidebar.tsx, Footer.jsx
├── pages/                  # Pantallas de nivel de ruta (ver §8)
├── services/api/           # apiClient + un *.api.ts por dominio (ver §6)
├── types/                  # Contratos TypeScript por dominio (ver §7)
└── utils/                  # dashboardConfig.js
```

**Estado de la migración TS:** 50 archivos `.ts/.tsx` vs 16 `.js/.jsx`. Los `.jsx` que quedan son pantallas de flujo (`Resultados`, `UploadCV`, `CVHistory`) y componentes de UI heredados. Regla: **componentes nuevos en TypeScript**; portar un archivo a TS cuando se le hagan cambios sustanciales.

---

## 4. Arquitectura núcleo

### 4.1 Routing (`src/App.tsx`)

- `/` → redirige a `/login`.
- `/login` es la **única ruta pública**.
- Todo lo demás vive dentro de **`ProtectedRoute`** (un `<Route element={<ProtectedRoute/>}>` con `<Outlet/>`).
- `/admin` va además dentro de **`AdminRoute`** (guard de rol anidado).
- Comodín `*` → redirige a `/dashboard` (que a su vez rebota a login si no hay sesión).

**`ProtectedRoute`**: si no hay `user`, `<Navigate to="/login">`. El layout protegido monta **`SessionTimeoutGuard` + `Sidebar` + `<main><Outlet/></main>`**. Las páginas protegidas pueden asumir que existe `user`.

> `AuthProvider` hidrata `user` desde `localStorage` de forma **síncrona** (en el inicializador de `useState`), así que no hay verificación asíncrona de sesión ni estado `loading` que esperar.

**Reutilización de páginas por ruta** (misma pantalla, distinta URL con params):

| Componente           | Rutas                                              |
| -------------------- | -------------------------------------------------- |
| `Vacancy`            | `/vacancy`, `/vacancy/edit/:id`                    |
| `Resultados`         | `/resultados`, `/resultados/:id`                   |
| `EvaluationsHistory` | `/evaluations-history`, `/evaluations-history/:id` |
| `AdvancedResults`    | `/advanced-results/:id`                            |

#### Tabla completa de rutas

| Ruta                                               | Página               | Protección                  |
| -------------------------------------------------- | -------------------- | --------------------------- |
| `/login`                                           | `Login`              | ❌ pública                  |
| `/dashboard`                                       | `Dashboard`          | ✅ sesión                   |
| `/position`                                        | `Position`           | ✅ sesión                   |
| `/uploadcv`                                        | `UploadCV`           | ✅ sesión                   |
| `/cv-history`                                      | `CVHistory`          | ✅ sesión                   |
| `/position-history`                                | `PositionHistory`    | ✅ sesión                   |
| `/vacancy`, `/vacancy/edit/:id`                    | `Vacancy`            | ✅ sesión                   |
| `/vacancy-history`                                 | `VacancyHistory`     | ✅ sesión                   |
| `/department`                                      | `CreateDepartment`   | ✅ sesión                   |
| `/department-history`                              | `DepartmentHistory`  | ✅ sesión                   |
| `/resultados`, `/resultados/:id`                   | `Resultados`         | ✅ sesión                   |
| `/candidates-history`                              | `CandidatesHistory`  | ✅ sesión                   |
| `/evaluations-history`, `/evaluations-history/:id` | `EvaluationsHistory` | ✅ sesión                   |
| `/advanced-results/:id`                            | `AdvancedResults`    | ✅ sesión                   |
| `/admin`                                           | `AdminPanel`         | ✅ sesión + **rol `admin`** |

### 4.2 Cliente HTTP (`src/services/api/apiClient.ts`)

Wrapper fino sobre `fetch`. Responsabilidades:

1. Prefija `VITE_API_URL` (limpia una `/` final).
2. Inyecta `Authorization: Bearer <token>` desde `localStorage`.
3. **Desempaqueta el envelope del backend.** El contrato es `{ success, data, error/message }`.
4. Lanza `ApiError` (subclase de `Error` con `status` y `data`) ante `!response.ok` o `success: false`.

**Normalización:**

- Si el body trae la clave `response` (doble envoltura del helper `sendResponseOr404` del backend, `{ response: { success, data } }`), opera sobre `body.response`.
- `success` se considera fallo **solo** cuando es exactamente `false`. Un `undefined` se trata como éxito (respuestas sin envelope).
- Devuelve `standardResponse.data` si está definido; si no, el objeto normalizado completo.
- Opción `raw: true` → devuelve el envelope completo sin desempaquetar `.data`.

> **Caso login:** `POST /users/login` responde `{ success, token, user }` (sin `data`). Se devuelve el objeto completo → `Login.tsx` lee `data.token` / `data.user`.

> ⚠️ **`BASE_URL` no tiene fallback.** Es literalmente `import.meta.env.VITE_API_URL`. Si la variable no está definida, `BASE_URL.endsWith("/")` revienta en el primer request. Definir `VITE_API_URL` es obligatorio.

> ⚠️ Un `401` lanza `ApiError("Sesión expirada o no autorizada.")` pero **no dispara `logout()`** ni redirige. Cada llamador decide qué hacer.

### 4.3 Autenticación (`src/components/context/AuthContext.tsx`)

- `AuthProvider` envuelve toda la app.
- Persiste **por separado** en `localStorage`: `tm_user` (objeto usuario) y `token`.
- `login(email, token, role, username?)` — si no se pasa `username`, lo deriva del local-part del email.
- `logout()` limpia `localStorage` y hace `window.location.href = "/login"` (recarga completa, no `navigate`).
- Se consume vía el hook **`useAuth()`**.

```ts
export interface UserData {
  email: string;
  role: "admin" | "user";
  username?: string;
}
```

> ⚠️ **Desalineación de casing en el rol.** El backend emite `ADMIN` / `USER` (mayúsculas); `UserData.role` los tipa en minúsculas. `Login.tsx` normaliza con un helper `normalizeRole()` al guardar, y `AdminRoute` compara con `.toLowerCase()` de forma defensiva. Es un parche funcional, no una unificación: `admin.types.ts` sigue tipando `'admin' | 'user'` mientras `api.types.ts` expone `UserRole = 'ADMIN' | 'USER'` (issue **8.3**).

### 4.4 Guard de rol (`src/components/routes/AdminRoute.tsx`)

Envuelve `/admin` dentro de `ProtectedRoute`:

- Sin `user` → `/login`.
- `user.role.toLowerCase() !== "admin"` → `/dashboard` (evita el `403` crudo del backend).

> ⚠️ Contiene **dos `console.log` de depuración** que vuelcan el objeto `user` completo (incluido el rol) a la consola del navegador en cada render. Deben quitarse (issue **10.5**).

### 4.5 Guardián de sesión (`src/components/ui/SessionTimeoutGuard.jsx`)

Watchdog global de inactividad, montado en el layout protegido:

- Escucha `mousemove/keydown/click/scroll` → actualiza `lastActivity` en `localStorage`.
- **Advierte a los 9 min** (modal `TimeoutWarningModal`), **cierra sesión a los 10 min**.
- Sincroniza `lastActivity` **entre pestañas** vía evento `storage`.
- Al expirar: `logout()` + `navigate("/login", { state: { sessionExpired: true } })` (el login muestra el aviso).

---

## 5. Estilos y assets

- **Tailwind v4 inline** en el JSX. Abundan **valores arbitrarios hardcodeados** (`bg-[#F0F0F5]`, `text-[#447ECA]`, filtros CSS de color en SVGs). No hay tokens de tema centralizados.
- Color corporativo de facto: **`#447ECA`** (azul). Fondo app: `#F0F0F5`.
- `index.css`: importa Tailwind y define un scrollbar custom "enterprise" (fino, aparece en hover).
- **Iconos:** SVGs locales en `assets/icons/` re-exportados como objeto `Icons` desde `assets/icons/index.ts` (`Icons.sidebar.*`, `Icons.auth.*`, `Icons.logos.*`, …). Se combinan con iconos de `lucide-react`.
- No hay sistema BEM/CSS-modules.

> ⚠️ Una clase de Tailwind mal escrita **no rompe el build ni el lint** — para el compilador es solo un string dentro de `className`. Los typos de clases solo se detectan mirando la app en el navegador.

---

## 6. Capa de servicios API (`src/services/api/`)

Un objeto-servicio por dominio. **Nunca se llama `fetch` directo** desde una página.

| Servicio           | Archivo              | Métodos                                                                                                            | Estado                                      |
| ------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `authService`      | `auth.api.ts`        | `login`, `register`                                                                                                | ✅ login usado; `register` sin UI           |
| `departmentsApi`   | `departments.api.ts` | `getAll`, `getById`, `create`, `update`, `delete`                                                                  | ✅ **flujo de referencia, 100 % funcional** |
| `positionService`  | `positions.api.ts`   | `getAll`, `getById`, `create`, `update`, `delete`, `completeWithAI`, `duplicate`                                   | ✅ funcional                                |
| `vacanciesApi`     | `vacancies.api.ts`   | `getAll`, `getById`, `create`, `update`, `updateStatus`, `delete`, `getResults`, `uploadCVs`, `evaluateCandidates` | ✅ funcional (`evaluateCandidates` sin UI)  |
| `candidateService` | `candidates.api.ts`  | `getAll`                                                                                                           | ✅ solo lectura                             |
| `dashboardService` | `dashboard.api.ts`   | `getSummary`                                                                                                       | ⚠️ definido pero **no consumido**           |
| `adminService`     | `admin.api.ts`       | `getStats`, `getUsers`, `updateRole`, `deleteUser`                                                                 | ❌ **stub falso — no llama a la API**       |

Todos los métodos devuelven ya el tipo desempaquetado (`Promise<Position[]>`, `Promise<Vacancy>`, `Promise<void>`…), no `Promise<ApiResponse<T>>`. `apiClient` se encarga del envelope, así que los llamadores **no deben re-desempaquetar**.

### 6.1 `admin.api.ts` es un simulacro (trampa importante)

`adminService` **no importa `apiClient`**. Devuelve datos inventados:

```ts
const MOCK_USERS: AdminUser[] = [ /* Ana Garcia, Carlos Perez, Beatriz Solis */ ];

export const adminService = {
  getStats: async (): Promise<any> =>
    new Promise((resolve) => setTimeout(() => resolve({ totalUsers: 145, /* … */ }), 800)),
  getUsers: async (page, limit): Promise<AdminUser[]> =>
    new Promise((resolve) => setTimeout(() => resolve(MOCK_USERS), 500)),
  // updateRole / deleteUser → resuelven { success: true } sin persistir nada
};
```

Los cuatro módulos de `components/admin/` ya lo consumen con `useEffect` y estados de carga, así que **el panel parece conectado y no lo está**. Además usa `Promise<any>`, que viola `no-explicit-any`. Reescribirlo sobre `apiClient` contra `/admin/*` es el issue **8.1**.

### 6.2 Normalización de departamentos (patrón de referencia)

`departmentsApi` hace mapeo de negocio backend↔UI mediante una interfaz `RawDepartment` y una función `normalizeRawDepartment` tipada (sin `any`):

- `id: number` → `id: string`
- El backend usa `title`; la UI usa `name` (se traduce en ambos sentidos).
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
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `api.types.ts`                | Enums + `User`, `Position`, `Vacancy`, `Candidate`, `MatchResult`, `ApiResponse<T>`, `ApiErrorDetail`, `UploadResult`                                                                                                     |
| `dashboard.types.ts`          | Forma real del backend (`DashboardTotals`, `VacancyStatusBreakdownItem`, `MonthlyActivityItem`, `DashboardSummary`) **y** formas de UI (`DashboardMetric`, `DashboardVacancyStatusCard`, `MonthlyData`, `DashboardStats`) |
| `department.types.ts`         | `Department`, `CreateDepartmentInput`, `UpdateDepartmentInput`                                                                                                                                                            |
| `admin.types.ts`              | `AdminUser`, `StatItem`, `StatCardColorType`                                                                                                                                                                              |
| `evaluations.types.ts`        | `EvaluationVacancy` (forma de UI)                                                                                                                                                                                        |
| `candidates-history.types.ts` | `HistoryCandidate`, `VacancyGroup` (formas de UI)                                                                                                                                                                        |

`position.types.ts` y `vacancy.types.ts` fueron **eliminados** (duplicaban `api.types.ts` y contenían el campo obsoleto `education`).

**Inconsistencias vivas:**

- `admin.types.ts` tipa `AdminUser.role` como `'admin' | 'user'`; el backend usa `'ADMIN' | 'USER'` (issue **8.3**).
- `dashboard.types.ts` mantiene **dos** modelos en paralelo: el real del backend y el que consume hoy el `Dashboard` mock. Al conectar hará falta un adaptador (issue **7.1**).
- `evaluations.types.ts` existe pero `EvaluationsHistory.tsx` **redeclara la misma interfaz localmente** en vez de importarla.

---

## 8. Inventario de páginas y su estado de conexión

**Leyenda:** ✅ Conectada a API real · 🟡 Conectada con pendientes · 🔴 Mock (datos ficticios).

| Página                  | Archivo                  | Estado | Servicio                                                         | Notas                                                                                                                                                  |
| ----------------------- | ------------------------ | ------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login                   | `Login.tsx`              | ✅     | `authService.login`                                              | Normaliza el rol con `normalizeRole()` y redirige a `/admin` o `/dashboard`.                                                                            |
| Dashboard               | `Dashboard.tsx`          | 🔴     | _(ninguno)_                                                      | 100 % `MOCK_DATA`. `dashboardService.getSummary()` existe pero no se llama. `MetricCard` dibuja "→" pero **no navega**. `min-h` fijos → responsive.     |
| Crear Departamento      | `CreateDepartment.tsx`   | ✅     | `departmentsApi.create`                                          | Funciona. Surface los `details` de Zod vía `ApiError`. Queda un `console.log` de depuración.                                                            |
| Historial Departamentos | `DepartmentHistory.tsx`  | ✅     | `departmentsApi.getAll/update/delete`                            | **Flujo de referencia completo** (listar/editar/eliminar con modales). Usa `alert()` para errores.                                                      |
| Crear Posición          | `Position.tsx`           | ✅     | `positionService.create/completeWithAI`, `departmentsApi.getAll` | Departamentos tipados `Department[]`. Envía el enum de `educationLevel`, omite `educationArea` cuando aplica, campo IA `pdf`. Validaciones en cliente.  |
| Historial Posiciones    | `PositionHistory.tsx`    | ✅     | `positionService.getAll/delete/duplicate`                        | Funciona. `alert()` en errores.                                                                                                                         |
| Nueva/Editar Vacante    | `Vacancy.tsx`            | 🟡     | `vacanciesApi`, `positionService`, `departmentsApi`              | Carga deptos+posiciones en paralelo y edita por `getById`. La pantalla de éxito **no recibe el código real** de la vacante (issue 4.4).                 |
| Historial Vacantes      | `VacancyHistory.tsx`     | ✅     | `vacanciesApi.getAll/updateStatus/delete`                        | Funciona. `alert()` en errores.                                                                                                                         |
| Subir CV                | `UploadCV.jsx`           | 🟡     | `vacanciesApi.getAll/uploadCVs`                                  | Selector de vacante activa obligatorio; sube vía `POST /vacancies/:id/upload`. Solo cuenta fallos; falta el **detalle por archivo** (issue 5.2).        |
| Historial CVs           | `CVHistory.jsx`          | ✅     | `candidateService.getAll`                                        | Lista candidatos (solo lectura).                                                                                                                        |
| Resultados (matching)   | `Resultados.jsx`         | 🟡     | `vacanciesApi.getResults/updateStatus`                           | Parsing correcto (`MatchResult[]`) y estado `CLOSED`. El `StatusDropdown` **no persiste** el estado del candidato (issue 6.3). `console.log`/`alert()`. |
| Resultados Avanzados    | `AdvancedResults.tsx`    | 🔴     | _(ninguno)_                                                      | 100 % `MOCK_RESULTS`. `useParams` sin usar. Botones sin cablear. `console.log`.                                                                         |
| Historial Candidatos    | `CandidatesHistory.tsx`  | 🔴     | _(ninguno)_                                                      | 100 % `MOCK_VACANCIES`. Acciones son `alert()` placeholder.                                                                                             |
| Evaluaciones            | `EvaluationsHistory.tsx` | 🔴     | _(ninguno)_                                                      | 100 % `MOCK_EVALUATIONS`. Botón "Calcular" sin `onClick`. `evaluateCandidates` existe pero nadie lo llama.                                              |
| Panel Admin             | `AdminPanel.tsx`         | 🔴     | `adminService` (**falso**)                                       | Loader `setTimeout` en la página **y** en el servicio. Módulos conectados a datos inventados. La cabecera muestra "admin" hardcodeado.                  |

### Resumen de conexión

- **Funcionan de punta a punta:** Login, Departamentos (crear + historial CRUD), Crear Posición, Historial de Posiciones, Historial de Vacantes, Historial de CVs.
- **Conectadas con pendientes:** Nueva/Editar Vacante, Subir CV, Resultados.
- **Sin API real:** Dashboard, Resultados Avanzados, Historial de Candidatos, Evaluaciones, Panel Admin.

---

## 9. Inventario de componentes

### `layouts/`

- **`Sidebar.tsx`** — navegación por grupos (`MENU_GROUPS`): Dashboard · Acciones Rápidas · Registros · Análisis · **Configuración (Administración)**. Colapsable, muestra usuario y logout. ⚠️ "Administración" sigue en el **último** grupo, usa `Icons.sidebar.dashboard` (el mismo ícono que Dashboard) y **se muestra a todos**, aunque `AdminRoute` bloquee el acceso: un usuario normal ve el enlace y al pulsarlo rebota a `/dashboard` (issue **9.2**).
- **`Footer.jsx`** — pie estático.

### `components/routes/`

- **`AdminRoute.tsx`** — ver §4.4.

### `components/context/`

- **`AuthContext.tsx`** — ver §4.3.

### `components/ui/`

- **`LoginForm.tsx`** — formulario de login. ⚠️ Ícono mostrar/ocultar contraseña **invertido** respecto a la convención (issue 10.2).
- **`AuthInput.tsx`** — input estilizado de auth.
- **`PillInput.tsx`** — input tipo "pills"/tags (skills, idiomas).
- **`StatusDropdown.jsx`** — dropdown de estado de candidato. Vocabulario `["No contratado", "Contratado", "Contactar"]`, **desalineado** con `AdvancedResults` y con el enum real `DISPONIBLE|CONTRATADO` (issue 10.1).
- **`ProcessingModal.jsx`** — modal de "procesando…" (IA/subidas).
- **`SessionTimeoutGuard.jsx`** — ver §4.5.
- **`EmptyVacancyState.tsx`** — estado vacío para vacantes.

### `components/modals/`

- **`CandidateDetailsModal.jsx`** — detalle de candidato con barras de progreso por skill; parsea arrays de skills/idiomas de forma defensiva y colorea por score.
- **`EditDepartmentModal.tsx`** / **`DeleteDepartmentModal.tsx`** — edición/borrado de departamento (flujo de referencia).
- **`VacancyActionModal.tsx`** — acciones sobre vacante.
- **`TimeoutWarningModal.jsx`** — aviso de inactividad (9 min).

### `components/cards/`

- **`CandidateMatchRow.jsx`** — fila de candidato en resultados (score con estilo por rango, link al CV, dropdown de estado).
- **`MetricCard.tsx`** — tarjeta de métrica del Dashboard. Dibuja "→" pero **no acepta `onClick` ni `to`** (issue 7.3).

### `components/Sections/`

- **`ActionDropdown.tsx`** — menú de acciones de fila (editar/eliminar/duplicar).
- **`PositionHistoryTable.tsx`** — tabla de posiciones.
- **`PositionSuccess.tsx`**, **`VacancySuccess.jsx`**, **`UploadCVSuccess.jsx`** — pantallas de éxito de cada flujo. ⚠️ `VacancySuccess` usa un código fijo `"Vac-009"` porque `Vacancy.tsx` no le pasa el real (issue 4.4).

### `components/admin/`

- **`StatsModule.tsx`** + **`StatCard.tsx`** — grid de métricas (datos de `adminService`, falsos).
- **`UserTableModule.tsx`** — tabla de usuarios paginada, consume `adminService.getUsers()`.
- **`RoleUpdateModule.tsx`** — cambio de rol con buscador reactivo. `console.log` de depuración.
- **`UserDeleteModule.tsx`** — borrado de usuario con buscador reactivo.

> Los cuatro módulos ya tienen estados de carga y filtros funcionales. Lo único que falta es que `adminService` hable con el backend.

### Sueltos

- **`EvaluationCard.tsx`** — tarjeta de vacante en Evaluaciones (botón "Calcular" sin cablear).
- **`HistoryTable.jsx`** — tabla genérica de historial.
- **`DemoCredential.jsx`** — muestra credenciales demo. ⚠️ Los valores están **hardcodeados como texto literal**, no leídos de `import.meta.env`; además el componente está **huérfano** (no se importa ni renderiza en ninguna parte).
- **`EmptyState.jsx`** — estado vacío genérico.

---

## 10. Backlog de issues

El backlog está priorizado en [`issues.md`](./issues.md) y detallado en `issues/P0–P3.md`. **Orden obligatorio: P0 → P1 → P2 → P3.**

- **P0 — Bloqueantes** ([`issues/P0.md`](./issues/P0.md)): ✅ **todos resueltos.** Se conserva como registro histórico (EPIC 1 envelope, EPIC 2 routing, EPIC 3 crear posición).
- **P1 — Flujos funcionales** ([`issues/P1.md`](./issues/P1.md)): pendientes 4.4 (código real de vacante), 5.2 (detalle por archivo en upload), 6.2 (conectar Evaluaciones), 6.3 (decidir estado de candidato), 6.4 (Resultados Avanzados), 6.5 (Historial de Candidatos).
- **P2 — Pantallas secundarias** ([`issues/P2.md`](./issues/P2.md)): 7.x (Dashboard), 8.x (Admin — `adminService` real), 9.2 (Sidebar por rol). 9.1 y 9.3 ✅ resueltos.
- **P3 — Pulido** ([`issues/P3.md`](./issues/P3.md)): 10.1 (vocabulario de estados de candidato), 10.2 (ícono de contraseña), 10.5 (`console.log`/`alert()`).

---

## 11. Convenciones y deuda técnica

**Convenciones a seguir:**

- Componentes/módulos **nuevos en TypeScript** con interfaces explícitas.
- Endpoints **siempre** como métodos de un `*.api.ts`; nunca `fetch`/`apiClient` crudo desde una página.
- Los servicios devuelven el tipo ya desempaquetado; **no re-desempaquetar** en el llamador.
- Normalización defensiva backend↔UI en la capa de servicios (patrón de `departments.api.ts`).
- Evitar `any` (ESLint lo marca como **error**).
- Comentarios de código **nuevos en inglés**.
- Commits en **Conventional Commits** (`<type>(<scope>): <subject>`, en inglés).

**Deuda técnica destacada:**

- `adminService` es un simulacro que aparenta estar conectado.
- Colores hardcodeados por todo el JSX (sin tokens de tema Tailwind).
- Casing de roles desalineado (`admin|user` en UI vs `ADMIN|USER` en API), parcheado con normalización en dos sitios.
- `dashboard.types.ts` mantiene dos modelos en paralelo.
- Dependencias muertas en `package.json` (`express`, `cors`, `dotenv`, `react-router`).
- `alert()`/`console.log` como placeholders de UX (incluido un volcado del objeto `user` en `AdminRoute`).
- 5 pantallas todavía sin API real.
- `apiClient` sin fallback de `VITE_API_URL` y sin auto-logout en `401`.

---

## 12. Entorno y despliegue

- Variable requerida vía `import.meta.env`: **`VITE_API_URL`**. **No hay valor por defecto** — sin ella la app falla en el primer request.
- ⚠️ **Nunca leer el archivo `.env`** (regla de `CLAUDE.md`). Inferir las variables desde los usos de `import.meta.env.*`.
- **`vercel.json`** reescribe todas las rutas no-`/api` a `index.html` (SPA routing en Vercel).

---

## 13. Cómo continuar (guía rápida)

1. **Levantar:** `npm install` → definir `VITE_API_URL` → `npm run dev` → login.
2. **Antes de tocar datos:** el flujo de **Departamentos** es el patrón de referencia funcional; imítalo al conectar otros dominios.
3. **Prioriza P1** (P0 ya está cerrado): código real de vacante, detalle de upload, conectar Evaluaciones.
4. **Verifica cada cambio con `npm run build`** (no hay tests; los errores de tipo rompen el build).
5. Recuerda que **`npm run build` no valida clases de Tailwind ni strings**: revisa la UI en el navegador.
6. Al conectar una pantalla mock, **añade estados de carga/error/vacío**.

---

_Documento generado a partir del análisis del código fuente. Ante discrepancias entre este documento y el código, el código manda: actualiza esta documentación._
