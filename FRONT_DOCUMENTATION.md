# FRONT_DOCUMENTATION.md — TalentMatch AI (Frontend)

> Documentación del **estado actual real** del frontend: estructura, componentes, capa de datos, flujos y su grado de conexión con el backend.
>
> Documentos relacionados: [`CLAUDE.md`](./CLAUDE.md) (reglas de trabajo) · [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) (contrato del backend) · [`BUGS.md`](./BUGS.md) (inventario de bugs) · [`ISSUES.md`](./ISSUES.md) + [`issues/P0.md`](./issues/P0.md)–[`issues/P3.md`](./issues/P3.md) (backlog priorizado).
>
> ⚠️ El `README.md` describe un stack **aspiracional** (React 18, BEM, Axios, Redux, Zod) que **no corresponde** al código. Esta documentación refleja el código real.

---

## 1. Resumen del producto

SPA de reclutamiento (dashboard) para:

- Subir CVs (PDF) y evaluarlos con IA contra vacantes.
- Gestionar **Departamentos → Posiciones → Vacantes → Candidatos**.
- Ver rankings de matching (MatchScore) por vacante.
- Administrar usuarios (panel admin).

La UI y la mayoría de comentarios están en **español**; los identificadores mezclan español e inglés.

---

## 2. Stack tecnológico real

| Área          | Tecnología                                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework     | **React 19** (`react` / `react-dom` ^19.2)                                                                                                                                           |
| Bundler / dev | **Vite 5**                                                                                                                                                                           |
| Lenguaje      | **TypeScript** (migración `.jsx`→`.tsx` en curso)                                                                                                                                    |
| Estilos       | **Tailwind CSS v4** vía `@tailwindcss/vite` (configurado en `src/index.css` con `@import "tailwindcss"`). El `tailwind.config.js` de la raíz es un stub v3 heredado y **no se usa**. |
| Routing       | **react-router-dom v7**                                                                                                                                                              |
| Estado global | **React Context** (`AuthContext`) — no hay Redux                                                                                                                                     |
| HTTP          | Cliente `fetch` **hecho a mano** (`apiClient.ts`) — no hay Axios                                                                                                                     |
| Iconos        | `lucide-react`, `react-icons` y SVGs locales en `assets/icons/`                                                                                                                      |
| Type-check    | `vite-plugin-checker` corre `tsc` en proceso → **los errores de tipo rompen `dev` y `build`**                                                                                        |
| Lint          | ESLint 9 con `@typescript-eslint/no-explicit-any` como **error**                                                                                                                     |

> Nota: `package.json` incluye `express`, `cors` y `dotenv` como dependencias. **No se usan en el frontend** (residuos); el frontend es 100 % cliente.

### Comandos

```bash
npm run dev      # Servidor de desarrollo Vite
npm run build    # Build de producción (falla ante errores de tipo)
npm run lint     # ESLint
npm run preview  # Sirve el dist/ ya construido
```

**No hay test runner** (ni Jest ni Vitest, ni archivos de test). Verificación = `npm run build` (tipos) + QA manual en `npm run dev`.

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
│   ├── Sections/           # ActionDropdown, PositionHistoryTable, PositionSuccess, UploadCVSuccess, VacancySuccess
│   ├── ui/                 # AuthInput, LoginForm, PillInput, ProcessingModal, SessionTimeoutGuard, StatusDropdown, EmptyVacancyState
│   ├── DemoCredential.jsx, EmptyState.jsx, EvaluationCard.tsx, HistoryTable.jsx
├── layouts/                # Sidebar.tsx, Footer.jsx
├── pages/                  # Pantallas de nivel de ruta (ver §8)
├── services/api/           # apiClient + un *.api.ts por dominio (ver §6)
├── types/                  # Contratos TypeScript por dominio (ver §7)
└── utils/                  # dashboardConfig.js
```

**Estado de la migración TS:** ~51 archivos `.ts/.tsx` vs ~16 `.js/.jsx`. Los `.jsx` que quedan son mayormente pantallas de flujo (`Resultados`, `UploadCV`, `CVHistory`) y componentes de UI heredados. Regla: **componentes nuevos en TypeScript**; portar un archivo a TS cuando se le hagan cambios sustanciales.

---

## 4. Arquitectura núcleo

### 4.1 Routing (`src/App.tsx`)

- `/` → redirige a `/login`.
- `/login` es la **única ruta pública**.
- Todo lo demás vive dentro de **`ProtectedRoute`** (un `<Route element={<ProtectedRoute/>}>` con `<Outlet/>`).
- Comodín `*` → redirige a `/dashboard` (que a su vez rebota a login si no hay sesión).

**`ProtectedRoute`** (`App.tsx:29`): muestra un loader "Verificando sesión…" mientras `loading`; si no hay `user`, `<Navigate to="/login">`. El layout protegido monta **`SessionTimeoutGuard` + `Sidebar` + `<main><Outlet/></main>`**. Las páginas protegidas pueden asumir que existe `user`.

**Reutilización de páginas por ruta** (misma pantalla, distinta URL con params):

| Componente           | Rutas                                              |
| -------------------- | -------------------------------------------------- |
| `Vacancy`            | `/vacancy`, `/vacancy/edit/:id`                    |
| `Resultados`         | `/resultados`, `/resultados/:id`                   |
| `EvaluationsHistory` | `/evaluations-history`, `/evaluations-history/:id` |
| `AdvancedResults`    | `/advanced-results/:id`                            |

#### Tabla completa de rutas

| Ruta                                               | Página               | Protegida                      |
| -------------------------------------------------- | -------------------- | ------------------------------ |
| `/login`                                           | `Login`              | ❌ pública                     |
| `/dashboard`                                       | `Dashboard`          | ✅                             |
| `/position`                                        | `Position`           | ✅                             |
| `/uploadcv`                                        | `UploadCV`           | ✅                             |
| `/cv-history`                                      | `CVHistory`          | ✅                             |
| `/position-history`                                | `PositionHistory`    | ✅                             |
| `/vacancy`, `/vacancy/edit/:id`                    | `Vacancy`            | ✅                             |
| `/vacancy-history`                                 | `VacancyHistory`     | ✅                             |
| `/department`                                      | `CreateDepartment`   | ✅                             |
| `/department-history`                              | `DepartmentHistory`  | ✅                             |
| `/resultados`, `/resultados/:id`                   | `Resultados`         | ✅                             |
| `/candidates-history`                              | `CandidatesHistory`  | ✅                             |
| `/evaluations-history`, `/evaluations-history/:id` | `EvaluationsHistory` | ✅                             |
| `/advanced-results/:id`                            | `AdvancedResults`    | ✅                             |
| `/admin`                                           | `AdminPanel`         | ✅ (sin gate de rol — ver §10) |

> ⚠️ **Ruta inexistente `/history`:** `Vacancy.tsx` navega dos veces a `/history`, que **no existe** en el router → cae en `*` y rebota a `/dashboard`. Debe ser `/vacancy-history` (issue **EPIC 2 / P0**).

### 4.2 Cliente HTTP (`src/services/api/apiClient.ts`)

Wrapper fino sobre `fetch`. Responsabilidades:

1. Prefija `VITE_API_URL` (limpia una `/` final).
2. Inyecta `Authorization: Bearer <token>` desde `localStorage`.
3. **Desempaqueta el envelope del backend.** El contrato es `{ success, data, error/message }`.
4. Lanza `ApiError` (subclase de `Error` con `status` y `data`) ante `!response.ok`, `success:false`/`"false"`, o HTTP `401`.

**Normalización actual (ya implementada):**

- Si el body trae la clave `response` (doble envoltura del helper `sendResponseOr404` del backend, `{ response: { success, data } }`), opera sobre `body.response`.
- `success` se evalúa contra `false` (bool) **y** `"false"` (string, caso 404 del backend). Incluye además un chequeo del typo `succes` del backend.
- Devuelve `castedBody.data` si existe; si no, el objeto normalizado.

> ✅ Esto significa que **EPIC 1.1 (normalizar el envelope) ya está aplicado** en `apiClient`. Lo que **falta** de EPIC 1 es la limpieza (1.2): quitar los extractores ad-hoc `res.response.data` que aún viven en `departments.api.ts` y en varias páginas, para no arriesgar doble-desempaquetado / código muerto.
>
> **Caso login:** `POST /users/login` responde `{ success, token, user }` (sin `data`). La lógica devuelve el objeto completo → `Login.tsx` sigue leyendo `data.token`/`data.user`. ✅

### 4.3 Autenticación (`src/components/context/AuthContext.tsx`)

- `AuthProvider` envuelve toda la app.
- Persiste **por separado** en `localStorage`: `tm_user` (objeto usuario) y `token`.
- `login(email, token)` deriva `username` del local-part del email y guarda `{ username, email, loginDate }`.
- Se consume vía el hook **`useAuth()`**.

```ts
interface UserData {
  username: string;
  email: string;
  loginDate: string;
}
```

> ⚠️ **`UserData` NO guarda `role`.** El backend sí devuelve `user.role` en el login y el token incluye `{ userId, role }`, pero el front lo descarta. Consecuencia: no se puede gatear la UI de admin por rol (issue **EPIC 9 / P2**). El tipo de usuario admin se modela aparte en `admin.types.ts`.

### 4.4 Guardián de sesión (`src/components/ui/SessionTimeoutGuard.jsx`)

Watchdog global de inactividad, montado en el layout protegido:

- Escucha `mousemove/keydown/click/scroll` → actualiza `lastActivity` en `localStorage`.
- **Advierte a los 9 min** (modal `TimeoutWarningModal`), **cierra sesión a los 10 min**.
- Sincroniza `lastActivity` **entre pestañas** vía evento `storage`.
- Al expirar: `logout()` + `navigate("/login", { state: { sessionExpired: true } })` (el login muestra el aviso).

---

## 5. Estilos y assets

- **Tailwind v4 inline** en el JSX. Abundan **valores arbitrarios hardcodeados** (`bg-[#F0F0F5]`, `text-[#447ECA]`, filtros CSS de color en SVGs). No hay tokens de tema centralizados (deuda técnica documentada en el propio código de `Login.tsx`).
- Color corporativo de facto: **`#447ECA`** (azul). Fondo app: `#F0F0F5`.
- `index.css`: importa Tailwind y define un scrollbar custom "enterprise" (fino, aparece en hover).
- **Iconos:** SVGs locales en `assets/icons/` re-exportados como objeto `Icons` desde `assets/icons/index.ts` (`Icons.sidebar.*`, `Icons.auth.*`, `Icons.logos.*`, …). Se combinan con iconos de `lucide-react`.
- No hay sistema BEM/CSS-modules (a pesar de lo que dice el README).

---

## 6. Capa de servicios API (`src/services/api/`)

Un objeto-servicio por dominio. **Nunca se llama `fetch` directo** (excepción: `Position.tsx` aún importa `apiClient` crudo para departamentos — se debe migrar a `departmentsApi.getAll()`).

| Servicio           | Archivo              | Métodos                                                                                                            | Estado                                                 |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `authService`      | `auth.api.ts`        | `login`, `register`                                                                                                | ✅ login usado; register sin UI                        |
| `departmentsApi`   | `departments.api.ts` | `getAll`, `getById`, `create`, `update`, `delete`                                                                  | ✅ **flujo de referencia, 100% funcional**             |
| `positionService`  | `positions.api.ts`   | `getAll`, `getById`, `create`, `update`, `delete`, `completeWithAI`, `duplicate`                                   | ⚠️ bugs de payload (ver abajo)                         |
| `vacanciesApi`     | `vacancies.api.ts`   | `getAll`, `getById`, `create`, `update`, `updateStatus`, `delete`, `getResults`, `uploadCVs`, `evaluateCandidates` | ⚠️ parcial                                             |
| `candidateService` | `candidates.api.ts`  | `getAll`                                                                                                           | ✅ solo lectura                                        |
| `dashboardService` | `dashboard.api.ts`   | `getSummary`                                                                                                       | ⚠️ definido pero **no consumido** (Dashboard usa mock) |
| `uploadService`    | `uploads.api.ts`     | `uploadCVs`                                                                                                        | ❌ **apunta a `/uploads`, endpoint que NO existe**     |

### 6.1 Normalización de departamentos (patrón de referencia)

`departmentsApi` hace mapeo de negocio backend↔UI:

- Mongo `_id` → `id`
- El backend usa `title`; la UI usa `name` (se traduce en ambos sentidos).
- Deriva `positionsCount`.
- Conserva un extractor flexible (`res.response.data` / `res.data` / array crudo) que **ya es redundante** tras la normalización de `apiClient` (candidato a limpieza — issue **1.2**).

### 6.2 Bugs conocidos en los servicios (contrastados con `API_DOCUMENTATION.md`)

| Servicio                                 | Bug                                 | Debe ser                                                                                      | Issue    |
| ---------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------- | -------- |
| `positions.api.ts` `completeWithAI`      | envía campo `file` en el `FormData` | campo **`pdf`**                                                                               | 3.2 / P0 |
| `positions.api.ts` `CreatePositionInput` | usa `education`                     | **`educationArea`**                                                                           | 3.4 / P0 |
| `uploads.api.ts`                         | `POST /uploads` (inexistente)       | usar `vacanciesApi.uploadCVs(vacancyId, files)` → `POST /vacancies/:id/upload` (campo `pdfs`) | 5.1 / P1 |

> **Regla del backend para crear candidatos:** solo se crean vía `POST /vacancies/:id/upload` (campo `pdfs`, máx 100 archivos, 5 MB c/u, solo PDF). Hay deduplicación por hash SHA-256; un archivo fallido no bloquea a los demás. `vacanciesApi.uploadCVs` **ya** usa el campo correcto `pdfs`.

---

## 7. Modelo de tipos (`src/types/`)

Contratos TS por dominio. Enums clave (en `api.types.ts`):

```ts
type UserRole = "ADMIN" | "USER";
type EducationLevel =
  | "NONE"
  | "HIGH_SCHOOL"
  | "BACHELOR"
  | "TECHNICAL"
  | "UNIVERSITY"
  | "MASTER"
  | "DOCTORATE";
type VacancyStatus = "ACTIVE" | "PAUSED" | "CLOSED";
type CandidateStatus = "DISPONIBLE" | "CONTRATADO";
```

Entidades: `User`, `Position`, `Vacancy`, `Candidate`, `MatchResult`, `ApiResponse<T>`.

**Inconsistencias de tipos a vigilar:**

- `admin.types.ts` tipa `AdminUser.role` como `'admin' | 'user'` (minúsculas), mientras el backend/`api.types.ts` usan `'ADMIN' | 'USER'`. Unificar al enum del backend y mapear a etiqueta visible (issue **8.3**).
- `dashboard.types.ts` (`DashboardStats` con `metrics`/`vacancyStatuses`/`monthlyData`) **no coincide** con la forma real del backend (`total`/`vacancyStatusBreakdown`/`monthlyActivity`). Requiere adaptador al conectar (issue **7.1**).
- `position.types.ts` (`PositionData`) usa `education`; el modelo real es `educationArea` + `educationLevel`.
- Hay definiciones **duplicadas** de `Vacancy`/`VacancyStatus` en `api.types.ts` y en `vacancy.types.ts`.

---

## 8. Inventario de páginas y su estado de conexión

**Leyenda:** ✅ Conectada a API real · 🟡 Conectada con bugs/pendientes · 🔴 Mock (datos ficticios) · ⚪ Estática/UI.

| Página                  | Archivo                  | Estado | Servicio                                                    | Notas                                                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------ | ------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login                   | `Login.tsx`              | ✅     | `authService.login`                                         | Funciona. **Código muerto** tras `export default` (bloque JSX comentado, issue 10.3). No guarda `role`.                                                                                                                                                                                      |
| Dashboard               | `Dashboard.tsx`          | 🔴     | _(ninguno)_                                                 | 100% `MOCK_DATA`. `dashboardService.getSummary()` existe pero no se llama. Tarjetas `MetricCard` dibujan "→" pero **no navegan**. Padding/`min-h` fijos → problemas responsive. (EPIC 7)                                                                                                     |
| Crear Departamento      | `CreateDepartment.tsx`   | ✅     | `departmentsApi.create`                                     | Funciona. Tiene rama de error muerta (`serverData`) + `console.log` (issues 10.3/10.5).                                                                                                                                                                                                      |
| Historial Departamentos | `DepartmentHistory.tsx`  | ✅     | `departmentsApi.getAll/update/delete`                       | **Flujo de referencia completo** (listar/editar/eliminar con modales). Usa `alert()` para errores.                                                                                                                                                                                           |
| Crear Posición          | `Position.tsx`           | 🟡     | `positionService.create/completeWithAI` + `apiClient` crudo | Carga departamentos con `apiClient('/departments')` **crudo** (debe usar `departmentsApi.getAll()`). `useState<any[]>` (rompe `no-explicit-any`). Envía `educationLevel` como label español en vez de enum, y `education` en vez de `educationArea` → **400**. IA usa campo `file`. (EPIC 3) |
| Historial Posiciones    | `PositionHistory.tsx`    | ✅     | `positionService.getAll/delete/duplicate`                   | Funciona tras normalización del envelope. Aún tiene extractor manual `data?.data` redundante. `alert()` en errores.                                                                                                                                                                          |
| Nueva/Editar Vacante    | `Vacancy.tsx`            | 🟡     | `vacanciesApi`, `positionService`, `departmentsApi`         | Carga deptos+posiciones en paralelo y edita por `getById`. **Navega a `/history` inexistente** (EPIC 2). Pantalla de éxito no recibe el código real de la vacante creada. Filtro posiciones por `departmentId` (verificar tipos string/number).                                              |
| Historial Vacantes      | `VacancyHistory.tsx`     | ✅     | `vacanciesApi.getAll/updateStatus/delete`                   | Funciona. Extractor manual redundante. `alert()` en errores.                                                                                                                                                                                                                                 |
| Subir CV                | `UploadCV.jsx`           | 🔴     | `uploadService.uploadCVs`                                   | **Roto:** el servicio apunta a `/uploads` inexistente. Debe pedir vacante destino y usar `vacanciesApi.uploadCVs`. No maneja respuesta por-archivo (creado/duplicado/fallido). (EPIC 5)                                                                                                      |
| Historial CVs           | `CVHistory.jsx`          | ✅     | `candidateService.getAll`                                   | Lista candidatos (solo lectura). Validar tras normalización.                                                                                                                                                                                                                                 |
| Resultados (matching)   | `Resultados.jsx`         | 🟡     | `vacanciesApi.getResults/updateStatus`                      | Chequeo `response.status === "success"` incorrecto tras normalización. Usa estado inválido **`"FILLED"`** (debe ser `CLOSED`). `console.log` + `alert()`. `StatusDropdown` sugiere persistir estado de candidato que **no tiene endpoint**. (EPIC 6)                                         |
| Resultados Avanzados    | `AdvancedResults.tsx`    | 🔴     | _(ninguno)_                                                 | 100% `MOCK_RESULTS`. `useParams` sin usar. Botones sin cablear. `console.log`. (EPIC 6.4)                                                                                                                                                                                                    |
| Historial Candidatos    | `CandidatesHistory.tsx`  | 🔴     | _(ninguno)_                                                 | 100% `MOCK_VACANCIES`. Acciones son `alert()` placeholder. (EPIC 6.5)                                                                                                                                                                                                                        |
| Evaluaciones            | `EvaluationsHistory.tsx` | 🔴     | _(ninguno)_                                                 | 100% `MOCK_EVALUATIONS`. Botón "Calcular" sin `onClick`. Debe cargar vacantes reales y disparar `evaluateCandidates`. (EPIC 6.2)                                                                                                                                                             |
| Panel Admin             | `AdminPanel.tsx`         | 🔴     | _(ninguno)_                                                 | Loader simulado con `setTimeout`. Módulos usan `mockUsers`. **No existe `admin.api.ts`.** Buscador sin `onChange`. Sin gate de rol. (EPIC 8)                                                                                                                                                 |

### Resumen de conexión

- **Funcionan de punta a punta:** Login, Departamentos (crear + historial CRUD), Historial de Posiciones, Historial de Vacantes, Historial de CVs.
- **Conectadas pero con bugs bloqueantes:** Crear Posición, Nueva/Editar Vacante, Resultados, Subir CV.
- **100% mock (sin API):** Dashboard, Resultados Avanzados, Historial de Candidatos, Evaluaciones, Panel Admin.

---

## 9. Inventario de componentes

### `layouts/`

- **`Sidebar.tsx`** — navegación por grupos (`MENU_GROUPS`): Dashboard · Acciones Rápidas · Registros · Análisis · **Configuración (Administración)**. Colapsable, muestra usuario y logout. ⚠️ "Administración" está en el **último** grupo, usa el ícono de dashboard y **se muestra a todos** (debería ir primero, con ícono propio y solo para `ADMIN` — EPIC 9.2). Soporta `isDynamic` para inyectar `lastVacancyId` (hoy no se usa activamente).
- **`Footer.jsx`** — pie estático.

### `components/context/`

- **`AuthContext.tsx`** — ver §4.3.

### `components/ui/`

- **`LoginForm.tsx`** — formulario de login. ⚠️ Ícono mostrar/ocultar contraseña **invertido** respecto a la convención (issue 10.2).
- **`AuthInput.tsx`** — input estilizado de auth.
- **`PillInput.tsx`** — input tipo "pills"/tags (skills, idiomas).
- **`StatusDropdown.jsx`** — dropdown de estado de candidato. Vocabulario `["No contratado","Contratado","Contactar"]`, **desalineado** con `AdvancedResults` (issue 10.1) y con el enum real `DISPONIBLE|CONTRATADO`.
- **`ProcessingModal.jsx`** — modal de "procesando…" (IA/subidas).
- **`SessionTimeoutGuard.jsx`** — ver §4.4.
- **`EmptyVacancyState.tsx`** — estado vacío para vacantes.

### `components/modals/`

- **`CandidateDetailsModal.jsx`** — detalle de candidato con barras de progreso por skill; parsea arrays de skills/idiomas de forma defensiva y colorea por score.
- **`EditDepartmentModal.tsx`** / **`DeleteDepartmentModal.tsx`** — edición/borrado de departamento (usados por el flujo de referencia).
- **`VacancyActionModal.tsx`** — acciones sobre vacante.
- **`TimeoutWarningModal.jsx`** — aviso de inactividad (9 min).

### `components/cards/`

- **`CandidateMatchRow.jsx`** — fila de candidato en resultados (score con estilo por rango, link al CV, dropdown de estado).
- **`MetricCard.tsx`** — tarjeta de métrica del Dashboard (dibuja "→" pero **no navega** aún — EPIC 7.3).

### `components/Sections/`

- **`ActionDropdown.tsx`** — menú de acciones de fila (editar/eliminar/duplicar).
- **`PositionHistoryTable.tsx`** — tabla de posiciones.
- **`PositionSuccess.tsx`**, **`VacancySuccess.jsx`**, **`UploadCVSuccess.jsx`** — pantallas de éxito de cada flujo de creación. ⚠️ `VacancySuccess` usa un código fijo `"Vac-009"` porque `Vacancy.tsx` no le pasa el código real (EPIC 4.4).

### `components/admin/`

- **`StatsModule.tsx`** + **`StatCard.tsx`** — grid de métricas del panel admin (mock).
- **`UserTableModule.tsx`** — tabla de usuarios; **exporta `mockUsers`** que los otros módulos importan.
- **`RoleUpdateModule.tsx`** — cambio de rol (sobre `mockUsers`).
- **`UserDeleteModule.tsx`** — borrado de usuario (sobre `mockUsers`).

### Sueltos

- **`EvaluationCard.tsx`** — tarjeta de vacante en Evaluaciones (botón "Calcular" sin cablear).
- **`HistoryTable.jsx`** — tabla genérica de historial.
- **`DemoCredential.jsx`** — muestra credenciales demo (lee vars `import.meta.env`).
- **`EmptyState.jsx`** — estado vacío genérico.

---

## 10. Backlog de issues (mapa a los archivos `issues/`)

El backlog está priorizado en [`ISSUES.md`](./ISSUES.md) y detallado en `issues/P0–P3.md`. **Orden obligatorio: P0 → P1 → P2 → P3.** EPIC 1 desbloquea al resto.

### P0 — Bloqueantes del flujo central ([`issues/P0.md`](./issues/P0.md))

- **EPIC 1 — Envelope de respuesta.** La normalización en `apiClient` (1.1) **ya está implementada**. Pendiente: **1.2** quitar extractores ad-hoc redundantes (`departments.api.ts`, `PositionHistory`, `VacancyHistory`, `Vacancy`, `CVHistory`) y **1.3** verificar regresión (login, `GET /vacancies/:id`, creaciones 201).
- **EPIC 2 — Routing.** `Vacancy.tsx`: cambiar `navigate("/history")` (×2) por `/vacancy-history`.
- **EPIC 3 — Crear Posición.** Cargar deptos con `departmentsApi.getAll()`; campo IA `file`→`pdf`; `educationLevel` como enum (no label español); `education`→`educationArea` con regla de opcionalidad (§8.1 API); validaciones cliente (rol ≥5, descripción ≥25, ≥1 skill técnica y ≥1 blanda).

### P1 — Flujos funcionales rotos ([`issues/P1.md`](./issues/P1.md))

- **EPIC 4 — Vacantes.** Limpiar extractor en listado; dropdown de posiciones por departamento; estado `"FILLED"`→`"CLOSED"` en `Resultados.jsx`; pantalla de éxito con código real.
- **EPIC 5 — Subir CVs.** `UploadCV` debe pedir vacante destino y usar `vacanciesApi.uploadCVs`; eliminar `uploads.api.ts`; reportar resultado **por archivo** (creado/duplicado/fallido).
- **EPIC 6 — Resultados y Candidatos.** Corregir parsing de `getResults`; conectar Evaluaciones (`evaluateCandidates` → navegar a `/resultados/:id`); decidir estado de candidato (no hay endpoint individual; solo la vacante persiste estado); conectar Resultados Avanzados e Historial de Candidatos (hoy mock).

### P2 — Pantallas secundarias sin conectar ([`issues/P2.md`](./issues/P2.md))

- **EPIC 7 — Dashboard.** Conectar `dashboardService.getSummary()`; adaptar `DashboardStats` a la forma real (`total`/`vacancyStatusBreakdown`/`monthlyActivity`); responsive; tarjetas → atajos a historiales.
- **EPIC 8 — Admin.** Crear `admin.api.ts` (`/admin/stats`, `/admin/users`, rol, borrado); conectar módulos; casing de roles `ADMIN|USER`; separar stats globales del dashboard por-usuario.
- **EPIC 9 — Auth/rol.** Guardar `role` en `AuthContext`/`localStorage`; Sidebar admin primero, con ícono propio y **solo para `ADMIN`**; (opc.) proteger ruta `/admin`.

### P3 — Pulido y calidad ([`issues/P3.md`](./issues/P3.md))

- **EPIC 10.** Unificar vocabulario de estados de candidato; corregir ícono de contraseña; eliminar código muerto (`CreateDepartment` rama `serverData`, bloque tras `export default Login`); quitar `any` (`Position.tsx`); limpiar `console.log`/`alert()` de depuración. Meta: `npm run lint` y `npm run build` limpios.

---

## 11. Convenciones y deuda técnica

**Convenciones a seguir:**

- Componentes/módulos **nuevos en TypeScript** con interfaces explícitas.
- Endpoints **siempre** como métodos de un `*.api.ts`; nunca `fetch`/`apiClient` crudo desde una página (excepción a corregir: `Position.tsx`).
- Normalización defensiva backend↔UI en la capa de servicios (patrón de `departments.api.ts`).
- Evitar `any` (ESLint lo marca como **error**). `error: any` en catches es tolerado; `any[]` en estado no.
- Commits en **Conventional Commits** (`<type>(<scope>): <subject>`; tipos: `feat/fix/refactor/test/docs/chore`).

**Deuda técnica destacada:**

- Colores hardcodeados por todo el JSX (sin tokens de tema Tailwind).
- Tipos duplicados/desalineados (`Vacancy`, roles, `DashboardStats`, `education`).
- Extractores de envelope redundantes tras la normalización de `apiClient`.
- Dependencias muertas en `package.json` (`express`, `cors`, `dotenv`).
- `alert()`/`console.log` como placeholders de UX.
- 5 pantallas todavía en modo mock.

---

## 12. Entorno y despliegue

- Variables vía `import.meta.env`: **`VITE_API_URL`** (fallback `http://localhost:5000/api`) y credenciales demo.
- ⚠️ **Nunca leer el archivo `.env`** (regla de `CLAUDE.md`). Inferir variables desde los usos de `import.meta.env.*`.
- **`vercel.json`** reescribe todas las rutas no-`/api` a `index.html` (SPA routing en Vercel).

---

## 13. Cómo continuar (guía rápida)

1. **Levantar:** `npm install` → `npm run dev` → login.
2. **Antes de tocar datos:** el flujo de **Departamentos** es el patrón de referencia funcional; imítalo al conectar otros dominios.
3. **Prioriza P0** (routing + crear posición; el envelope ya está normalizado, falta limpieza).
4. **Verifica cada cambio con `npm run build`** (no hay tests; los errores de tipo rompen el build).
5. Al conectar una pantalla mock, **añade estados de carga/error/vacío** (hoy casi ninguna los tiene).

---

_Documento generado a partir del análisis del código fuente y del backlog `issues/P0–P3.md`. Ante discrepancias entre este documento y el código, el código manda: actualiza esta documentación._
