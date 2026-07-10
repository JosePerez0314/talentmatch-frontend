# 🐞 Inventario de Bugs — TalentMatch Frontend

> **Premisa:** el backend está terminado y correcto. Por lo tanto **todos los ítems de este documento son responsabilidad del frontend** (el front consume/mapea mal un backend que sí funciona, o directamente no está conectado).
>
> 🇬🇧 English version: [`../en/bugs.md`](../en/bugs.md)
>
> Barrido realizado sobre **todas las rutas** definidas en `src/App.tsx`. **Última verificación: 2026-07-09.**

## Estado de conexión por ruta

| Ruta                       | Estado         | Nota                                                |
| -------------------------- | -------------- | --------------------------------------------------- |
| `/login`                   | ✅ Conectado   | OK                                                  |
| `/dashboard`               | ❌ 100 % mock  | `MOCK_DATA` + no responsive + tarjetas sin navegar  |
| `/position`                | ✅ Conectado   | OK                                                  |
| `/uploadcv`                | 🟡 Conectado   | Falta el detalle por archivo                        |
| `/cv-history`              | ✅ Conectado   | OK                                                  |
| `/position-history`        | ✅ Conectado   | OK                                                  |
| `/vacancy` (+ `/edit/:id`) | 🟡 Conectado   | Pantalla de éxito con código fijo "Vac-009"         |
| `/vacancy-history`         | ✅ Conectado   | OK                                                  |
| `/department`              | ✅ Conectado   | OK                                                  |
| `/department-history`      | ✅ Conectado   | OK                                                  |
| `/resultados/:id`          | 🟡 Conectado   | El estado del candidato no persiste                 |
| `/candidates-history`      | ❌ 100 % mock  | Acciones = `alert()`                                |
| `/evaluations-history`     | ❌ 100 % mock  | Botón "Calcular" sin acción                         |
| `/advanced-results/:id`    | ❌ 100 % mock  | Todos los botones inertes                           |
| `/admin`                   | ❌ 100 % mock  | Gate de rol activo, pero el servicio es un simulacro |

---

## 1. Bugs funcionales críticos

### 1.1 — `admin.api.ts` finge estar conectado

- **Archivo:** `src/services/api/admin.api.ts` + `src/components/admin/*`
- **Detalle:** `adminService` **no importa `apiClient`**. Define un array `MOCK_USERS` y devuelve promesas resueltas con `setTimeout`. Los cuatro módulos admin (`StatsModule`, `UserTableModule`, `RoleUpdateModule`, `UserDeleteModule`) lo consumen con `useEffect`, spinners y buscadores reactivos — así que **la pantalla parece funcional**: lista usuarios, "cambia" roles y "elimina". Nada se persiste. `updateRole`/`deleteUser` resuelven `{ success: true }` y `console.log`uean.
- **Agravante:** `getStats` está tipado `Promise<any>`, violando `@typescript-eslint/no-explicit-any` (regla marcada como _error_).
- **Fix:** reescribir sobre `apiClient` contra `GET /admin/stats`, `GET /admin/users`, `PUT /admin/users/:id/role`, `DELETE /admin/users/:id`. Ver `issues/P2.md §8.1`.

### 1.2 — `AdminRoute` vuelca el objeto `user` a la consola

- **Archivo:** `src/components/routes/AdminRoute.tsx:8-9`
- **Detalle:** dos `console.log` de depuración imprimen el usuario completo y su rol en **cada render**. Queda en el bundle de producción.
- **Fix:** eliminarlos.

### 1.3 — Pantalla de éxito de vacante muestra un código fijo

- **Archivo:** `src/components/Sections/VacancySuccess.jsx:7` + `src/pages/Vacancy.tsx`
- **Detalle:** `VacancySuccess` usa `vacancyCode = "Vac-009"` por defecto, y `Vacancy.tsx` lo renderiza **sin pasarle** `vacancyCode`. Siempre muestra "Vac-009" sin importar la vacante creada.
- **Fix:** pasar el código/ID real de la vacante devuelta por `POST /vacancies`.

### 1.4 — Sidebar: "Administración" visible para todos, mal ubicado y con ícono equivocado

- **Archivo:** `src/layouts/Sidebar.tsx:55-60`
- **Detalle:** está en el último grupo ("CONFIGURACIÓN") y usa `Icons.sidebar.dashboard` (el mismo ícono que Dashboard). Además **no se filtra por rol**: un usuario normal ve el enlace, lo pulsa, y `AdminRoute` lo rebota a `/dashboard`. Funciona en cuanto a seguridad, pero es una UX rota.
- **Fix:** mover el item al primer grupo, darle ícono propio (ej. `Shield`) y renderizarlo solo si `user.role === "admin"`.

### 1.5 — `apiClient` revienta si falta `VITE_API_URL`

- **Archivo:** `src/services/api/apiClient.ts:1`
- **Detalle:** `const BASE_URL: string = import.meta.env.VITE_API_URL;` — **sin fallback**. Si la variable no está definida, `BASE_URL.endsWith("/")` lanza `TypeError: Cannot read properties of undefined`. El tipo `string` es una mentira: en runtime puede ser `undefined`.
- **Fix:** fallback explícito o un fallo temprano con mensaje claro al arrancar.

### 1.6 — Un `401` no cierra la sesión

- **Archivo:** `src/services/api/apiClient.ts:78-84`
- **Detalle:** ante un `401` se lanza `ApiError("Sesión expirada o no autorizada.")`, pero **no se llama a `logout()`** ni se redirige. Con un token expirado, cada pantalla muestra su propio error y el usuario queda atrapado en una app que parece autenticada.
- **Fix:** centralizar el manejo del `401` (limpiar `localStorage` + redirigir a `/login`).

### 1.7 — Casing del rol desalineado entre front y backend

- **Archivos:** `src/components/context/AuthContext.tsx:5`, `src/types/admin.types.ts:17`, `src/types/api.types.ts:4`
- **Detalle:** el backend emite `ADMIN`/`USER`; `UserData.role` y `AdminUser.role` los tipan `'admin' | 'user'`, mientras `api.types.ts` expone `UserRole = 'ADMIN' | 'USER'`. Hoy funciona gracias a dos parches defensivos: `normalizeRole()` en `Login.tsx` y `.toLowerCase()` en `AdminRoute`. Cualquier código nuevo que compare el rol sin normalizar fallará en silencio.
- **Fix:** unificar en el enum del backend y mapear a etiqueta visible en la UI.

---

## 2. Pantallas sin conectar (100 % mock)

### 2.1 — Dashboard

- **Archivo:** `src/pages/Dashboard.tsx:9-28`
- **Detalle:** toda la data proviene de `MOCK_DATA`. No usa `dashboardService.getSummary()` (que existe y está tipado contra la forma real del backend). Métricas, gráfica y estados de vacantes son ficticios.

### 2.2 — Resultados Avanzados

- **Archivo:** `src/pages/AdvancedResults.tsx:21-25, 125`
- **Detalle:** usa `MOCK_RESULTS`, `useParams` no se usa, y los botones "Compartir", "Recalcular MatchScore" y "Ver perfil" no hacen nada. Título/depto/código hardcodeados.

### 2.3 — Historial de Candidatos

- **Archivo:** `src/pages/CandidatesHistory.tsx:5-22`
- **Detalle:** `MOCK_VACANCIES`. Todas las acciones son `alert()`. No usa `candidateService`.

### 2.4 — Evaluaciones

- **Archivo:** `src/pages/EvaluationsHistory.tsx:16-53` + `src/components/EvaluationCard.tsx:63`
- **Detalle:** `MOCK_EVALUATIONS`. El botón "Calcular" **no tiene `onClick`**. La ruta `/evaluations-history/:id` recibe `:id` pero nunca se usa. `vacanciesApi.evaluateCandidates()` existe, está tipado y **nadie lo llama**.
- **Extra:** el archivo **redeclara** la interfaz `EvaluationVacancy` localmente en vez de importarla de `src/types/evaluations.types.ts`, que ya la define igual.

### 2.5 — Panel de Administración

- **Archivo:** `src/pages/AdminPanel.tsx:11-15` + `src/services/api/admin.api.ts`
- **Detalle:** loader simulado con `setTimeout(750)` en la página, **encima** de los `setTimeout` del propio servicio falso (ver §1.1). La cabecera muestra `admin` como texto hardcodeado en vez de leer `user.username`/`user.role`.

---

## 3. UI / UX / Responsive

### 3.1 — Dashboard no se adapta a pantallas pequeñas

- **Archivo:** `src/pages/Dashboard.tsx:49, 79`
- **Detalle:** padding fijo y `min-h-[350px] xl:min-h-[450px]` rígidos dentro de un `<main>` con `overflow-y-auto`. En pantallas de baja altura el contenido desborda y obliga a scrollear.
- **Fix:** alturas flexibles / `aspect-ratio`, revisar breakpoints.

### 3.2 — Tarjetas de métricas del Dashboard sin navegación

- **Archivo:** `src/components/cards/MetricCard.tsx` + `src/pages/Dashboard.tsx:63-72`
- **Detalle:** cada `MetricCard` dibuja una flecha "→" que sugiere navegación, pero el componente **no acepta `onClick` ni `to`**. Ningún acceso rápido funciona.
- **Fix:** añadir la prop de destino y cablear cada tarjeta a su historial.

### 3.3 — Estados de candidato inconsistentes entre pantallas

- **Archivos:** `src/components/ui/StatusDropdown.jsx:9` vs `src/pages/AdvancedResults.tsx:8, 92`
- **Detalle:** en resultados los estados son `"No contratado" | "Contratado" | "Contactar"`, y en `AdvancedResults` `"No Contratado" | "Contactado" | "Contratado"`. Difieren en texto ("Contactar" vs "Contactado") y en casing. Ninguno coincide con el enum real `DISPONIBLE | CONTRATADO`.
- **Fix:** unificar en un único set derivado del enum del backend.

### 3.4 — Ícono de mostrar/ocultar contraseña invertido

- **Archivo:** `src/components/ui/LoginForm.tsx:60-66`
- **Detalle:** cuando la contraseña está visible muestra `Eye` (abierto) y cuando está oculta muestra `EyeOff`; la convención habitual es la inversa.
- **Fix:** intercambiar los íconos.

### 3.5 — El estado del candidato no persiste

- **Archivos:** `src/pages/Resultados.jsx` + `src/components/ui/StatusDropdown.jsx`
- **Detalle:** al cambiar el estado solo se actualiza el UI local (y, si es "Contratado", el estado de la **vacante** vía `PATCH /vacancies/:id/status` → `CLOSED`). No existe endpoint para persistir el estado por candidato: los candidatos son de solo lectura en la API.
- **Fix:** decisión de diseño — quitar el control o dejar claro que no guarda. Ver `issues/P1.md §6.3`.

---

## 4. Calidad de código / menores

- **4.1 — `console.log` de depuración:** `AdminRoute.tsx:8-9` (crítico, ver §1.2), `admin.api.ts:32,41,50`, `RoleUpdateModule.tsx:41`, `AdvancedResults.tsx:136`, `Resultados.jsx:51`, `CreateDepartment.tsx:35`.
- **4.2 — `alert()` como placeholder:** `CandidatesHistory.tsx` (acciones inventadas), y como reporte de error en `Resultados.jsx`, `VacancyHistory.tsx`, `DepartmentHistory.tsx`, `PositionHistory.tsx`.
- **4.3 — Dependencias muertas:** `package.json` declara `express`, `cors` y `dotenv` — ninguna se usa en un frontend 100 % cliente. También `react-router` junto a `react-router-dom`.
- **4.4 — `DemoCredential.jsx` huérfano:** no se importa en ninguna parte y sus credenciales están hardcodeadas como texto literal, no leídas de `import.meta.env`.
- **4.5 — `dashboard.types.ts` con dos modelos:** conviven la forma real del backend (`DashboardSummary`) y la forma de UI del mock (`DashboardStats`). Al conectar hará falta un adaptador o eliminar una de las dos.
- **4.6 — `EvaluationsHistory.tsx` redeclara un tipo:** define `EvaluationVacancy` localmente en vez de importarlo de `src/types/evaluations.types.ts`.

---

## 5. Sobre lo que las herramientas **no** detectan

Vale la pena tenerlo presente al revisar cambios:

- **Las clases de Tailwind no se validan.** `className="rounded-[24px]"` y `className="roundTomaed-[24px]"` son igual de válidas para `tsc` y para ESLint — son solo strings. Un typo en una clase solo se ve abriendo la app.
- **El texto suelto en JSX tampoco.** Un `<h1>Título</h1>, cr` compila perfectamente y renderiza `, cr` en pantalla.
- Ambos casos ocurrieron en `LoginForm.tsx` (corregidos el 2026-07-09). **`npm run build` en verde no significa que la UI esté bien.**

---

## Resumen ejecutivo

| Categoría                     | Cantidad |
| ----------------------------- | -------- |
| Bugs funcionales críticos     | 7        |
| Pantallas sin conectar (mock) | 5        |
| UI / UX / Responsive          | 5        |
| Calidad / menores             | 6        |

**Prioridad sugerida:** 1) conectar `adminService` de verdad y quitar el volcado de `user` a consola (§1.1, §1.2), 2) blindar `apiClient` (§1.5, §1.6), 3) conectar las pantallas mock (§2), 4) responsive y consistencia (§3), 5) limpieza (§4).

---

## Anexo — Bugs ya resueltos

Se conservan para trazabilidad. **No reabrir sin verificar contra el código.**

| Bug                                                         | Resuelto en | Nota                                                        |
| ----------------------------------------------------------- | ----------- | ----------------------------------------------------------- |
| `Vacancy.tsx` navegaba a la ruta inexistente `/history`      | 2026-07-08  | Ahora `/vacancy-history`                                     |
| Dropdown de departamentos vacío en "Nueva Posición"          | 2026-07-08  | Usa `departmentsApi.getAll()` con tipos `Department[]`       |
| Autocompletar con IA no funcionaba (campo `file`)            | 2026-07-08  | El `FormData` envía el campo `pdf`                           |
| Estado de vacante `FILLED` inválido                          | 2026-07-08  | `Resultados.jsx` envía `CLOSED`                              |
| Desempaquetado frágil de resultados (`response.status`)      | 2026-07-08  | `getResults` devuelve `MatchResult[]` directo                |
| `uploads.api.ts` posteaba a `/uploads` (inexistente)         | 2026-07-08  | Archivo eliminado; `UploadCV` usa `vacanciesApi.uploadCVs`   |
| `Position.tsx` con `useState<any[]>`                         | 2026-07-08  | Tipado `Department[]`                                        |
| Rama de error muerta `serverData` en `CreateDepartment.tsx`  | 2026-07-08  | Usa `err instanceof ApiError`                                |
| Ruta `/admin` sin gate de rol                                | 2026-07-09  | `AdminRoute` la protege                                      |
| `AuthContext` no guardaba el rol                             | 2026-07-09  | `UserData.role` existe (pero ver §1.7)                       |
| `App.tsx` leía `loading` de un contexto que no lo exponía    | 2026-07-09  | Rompía `dev` y `build`; rama eliminada                       |
| `Login.tsx` leía `data.data?.token` (campo inexistente)      | 2026-07-09  | Rompía `dev` y `build`; simplificado a `data.token`          |
| Bloque JSX muerto tras `export default Login;`               | 2026-07-09  | Eliminado                                                    |
| `LoginForm.tsx` con texto corrupto (`roundTomaed-[24px]`, `, cr`) | 2026-07-09  | Ni `tsc` ni ESLint lo detectaban — ver §5                 |
