# Últimos cambios

> 🇬🇧 English version: [`../en/last-changes.md`](../en/last-changes.md)

---

## Build desbloqueado + documentación reestructurada en `docs/`

**Rama:** `features`
**Fecha:** 2026-07-09

### Contexto

Una auditoría de documentación destapó dos cosas que no tenían nada que ver con la documentación: el working tree contenía código fuente corrupto, y tanto `npm run build` como `npm run dev` estaban fallando.

### Build roto (6 errores de tipo)

`vite-plugin-checker` corre con `typescript: true`, así que los errores de tipo rompen `dev` y `build` por igual.

- **`src/App.tsx`** — `ProtectedRoute` desestructuraba `loading` de `useAuth()`, pero `AuthContextType` solo expone `user`, `login`, `logout`. `AuthProvider` hidrata `user` desde `localStorage` de forma síncrona en el inicializador de `useState`, así que nunca hubo nada asíncrono que esperar. Se eliminó la rama `loading` (y su pantalla "Verificando sesión…") en vez de añadir un flag permanentemente `false`.
- **`src/pages/Login.tsx`** — `handleSubmit` leía `data.data?.token` y `data.data?.user`, pero `LoginResponseData` es `{ user, token }`, sin `.data` (residuo de cuando los servicios se tipaban `Promise<ApiResponse<T>>`). Además declaraba `token`/`email` arriba y los sombreaba dentro de un `if`, disparando `noUnusedLocals`.

### Código corrupto en `LoginForm.tsx`

Había ediciones sin commitear con fragmentos de un prompt tecleados dentro del JSX:

```diff
-    <div className="w-full max-w-[420px] bg-white rounded-[24px] p-10 ...">
+    <div className="w-full max-w-[420px] bg-white roundTomaed-[24px] p-10 ...">

-        <h1 className="text-3xl font-bold">Inicia Sesión</h1>
+        <h1 className="text-3xl font-bold">Inicia Sesión</h1>, cr
```

Se coló `Toma` dentro de `rounded-[24px]` (matando las esquinas redondeadas de la tarjeta de login) y `, cr` se renderizaba como texto visible bajo el título.

**Ni `tsc` ni ESLint detectan esto** — `roundTomaed-[24px]` es un string válido en `className`, y `, cr` es texto JSX válido. Solo se ve en el navegador. Registrado en `bugs.md §5`.

### Normalización del rol en `Login.tsx`

Arreglar el error de tipos destapó un bug real. La API devuelve `role` en mayúsculas (`ADMIN`/`USER`), mientras `AuthContext.UserData.role` lo tipa en minúsculas. El código anterior comparaba el valor crudo:

```ts
if (role === 'admin') navigate('/admin');   // nunca cierto para un ADMIN real
```

así que un administrador real acababa en `/dashboard`. Mientras tanto `AdminRoute` compara con `.toLowerCase()`, de modo que a `/admin` *sí* se llegaba por URL — una inconsistencia entre dos caminos de código. Ahora se normaliza una sola vez:

```ts
// The API returns the role uppercased (`ADMIN` / `USER`); AuthContext stores it lowercased.
const normalizeRole = (role: string | undefined): UserData["role"] =>
  role?.toLowerCase() === "admin" ? "admin" : "user";
```

El `catch (error: any)` también se estrechó a `error instanceof Error` (el `any` violaba `no-explicit-any`). Unificar el casing de punta a punta sigue abierto como issue **8.3**.

También se eliminó el bloque JSX muerto tras `export default Login;` (P3 §10.3, ahora cerrado).

### Documentación reestructurada

Toda la documentación markdown se movió a `docs/`, separada por idioma, usando `git mv` para preservar el historial:

| Antes                        | Después                                                |
| ---------------------------- | ------------------------------------------------------ |
| `FRONT_DOCUMENTATION.md`     | `docs/es/front-documentation.md`                        |
| `FRONT_DOCUMENTATION.en.md`  | `docs/en/front-documentation.md`                        |
| `API_DOCUMENTATION.md`       | `docs/en/api-documentation.md` (+ `docs/es/` desde HEAD) |
| `BUGS.md`                    | `docs/es/bugs.md` (+ nuevo `docs/en/bugs.md`)           |
| `ISSUES.md`                  | `docs/es/issues.md` (+ nuevo `docs/en/issues.md`)       |
| `issues/P0–P3.md`            | `docs/es/issues/` (+ nuevos `docs/en/issues/`)          |
| `LAST_CHANGES.md`            | `docs/en/last-changes.md` (+ nuevo `docs/es/`)          |

`API_DOCUMENTATION.md` tenía una traducción completa ES→EN sin commitear que sobrescribía la versión española en el mismo archivo; el texto español se recuperó con `git show HEAD:API_DOCUMENTATION.md` para que sobrevivan ambos idiomas.

`README.md` y `CLAUDE.md` se quedan en la raíz del repo. `docs/README.md` es un selector de idioma; `docs/{en,es}/README.md` indexan y describen cada documento.

### Documentación corregida contra el código

Las docs habían derivado mucho respecto al código fuente. Las correcciones más grandes:

- **`admin.api.ts` existe, pero es falso.** Las docs decían que no existía. Existe — como `MOCK_USERS` + `setTimeout`, tipado `Promise<any>`, sin importar nunca `apiClient`. Los cuatro módulos admin lo consumen, así que el panel *parece* conectado. Promovido al ítem más urgente del backlog (`issues/P2.md §8.1`).
- **`apiClient` no tiene fallback de `VITE_API_URL`.** Las docs (y `CLAUDE.md`) afirmaban `http://localhost:5000/api`. Es un `import.meta.env.VITE_API_URL` pelado, así que si falta la variable revienta en el primer request.
- **`apiClient` ya no tolera `success: "false"`** (string) ni el typo `succes` del backend — solo chequea el booleano.
- **`AuthContext` sí guarda el `role`** (las docs decían que no) — ver la salvedad del casing arriba. `loginDate` desapareció; `username` ahora es opcional.
- **`AdminRoute.tsx` no estaba documentado**, incluidos sus dos `console.log` de depuración que vuelcan `user` en cada render.
- `uploads.api.ts`, `position.types.ts` y `vacancy.types.ts` fueron eliminados; `evaluations.types.ts` y `candidates-history.types.ts` son nuevos y no estaban documentados.
- `Resultados.jsx` ya envía `CLOSED`, no `FILLED`; `bugs.md` seguía listándolo como abierto.

### Verificación

`npx tsc --noEmit` → 0 errores. `npm run build` → correcto (1863 módulos, 7.25 s).

---

## Auditoría de alineación con la API + limpieza de tipado

**Rama:** `features`
**Fecha:** 2026-07-08 (sesión continuada)

---

### Contexto

Auditoría completa de los archivos `.tsx`/`.ts`/`.jsx` contra `api-documentation.md`. Encontrado y corregido:

1. Métodos de servicio todavía tipados como `Promise<ApiResponse<T>>` cuando `apiClient` desempaqueta `.data` → mentiras de tipado que obligaban a los llamadores a re-desempaquetar defensivamente.
2. `any` esparcido por páginas y servicios (viola la regla de error `@typescript-eslint/no-explicit-any`).
3. Bugs de runtime por suposiciones obsoletas sobre la forma de la API (`Resultados.jsx` chequeando un campo `status` que no existe; `"FILLED"` enviado como estado de vacante cuando el enum solo permite `ACTIVE | PAUSED | CLOSED`).
4. `uploads.api.ts` llamando a `POST /uploads`, un endpoint que no existe — los CVs se suben, según la documentación, vía `POST /vacancies/:id/upload`.
5. `Position.tsx` enviando `educationArea: ""` cuando el backend espera que el campo se omita (según §8.1) — causaba un 400 en los niveles `NONE`/`HIGH_SCHOOL`.
6. `Position.tsx` usando el fallback `||` para `yearsOfExperience` — trataba el 0 como falsy y perdía valores legítimos después de que el backend se actualizara para aceptar `>= 0`.
7. Archivos de tipos duplicados/obsoletos (`position.types.ts`, `vacancy.types.ts`) con campos (`education`) que ya no existen en el contrato del backend.

---

### Fase A — Corrección de los tipos de retorno de los servicios

`apiClient` desempaqueta `.data` de `{ success, data }` (y de la doble envoltura `{ response: { success, data } }`). Los tipos de retorno ahora lo reflejan.

#### `src/services/api/positions.api.ts`

- `getById`, `create`, `update`, `duplicate` → `Promise<Position>` (antes `Promise<ApiResponse<Position>>`).
- `completeWithAI` → `Promise<Partial<CreatePositionInput>>` (antes `Promise<ApiResponse<...>>`).
- `delete` → `Promise<void>`.
- `CreatePositionInput.educationArea` → opcional (`educationArea?: string`), para que los llamadores puedan enviar `undefined` y dejar que `JSON.stringify` omita el campo.

#### `src/services/api/vacancies.api.ts`

- `getById`, `create`, `update`, `updateStatus` → `Promise<Vacancy>`.
- `delete` → `Promise<void>`.
- `getResults` → `Promise<MatchResult[]>` (antes `Promise<ApiResponse<any>>`).
- `uploadCVs` → `Promise<UploadResult[]>` (antes `Promise<ApiResponse<any>>`).
- `evaluateCandidates` → `Promise<MatchResult[]>` (antes `Promise<ApiResponse<any>>`).

#### `src/services/api/auth.api.ts`

- `login`, `register` → `Promise<LoginResponseData>` (antes `Promise<ApiResponse<LoginResponseData>>`). Explica por qué `Login.tsx` leía antes tanto `data.token` como `data.data?.token`.

#### `src/services/api/candidates.api.ts`

- `getAll` → `Promise<Candidate[]>` (antes `Promise<ApiResponse<Candidate[]>>`).

#### `src/services/api/departments.api.ts`

- La interfaz `RawDepartment` + la función `normalizeRawDepartment` reemplazan al extractor ad-hoc cargado de `any`. El mapeo de campos coincide con la salida de Prisma (`id: number`, `title`, `_count.positions`, `createdAt`).

#### `src/services/api/dashboard.api.ts`

- `getSummary` → `Promise<DashboardSummary>`.

---

### Fase A — Altas y bajas de tipos

#### `src/types/api.types.ts`

Añadida la interfaz `UploadResult` para los resultados de subida de CV por archivo (§4):

```typescript
export interface UploadResult {
    success: boolean;
    data?: Candidate;
    message?: string;
    error?: string;
}
```

#### `src/types/dashboard.types.ts`

Añadidas interfaces que coinciden con la respuesta real de `GET /dashboard` (§7): `DashboardTotals`, `VacancyStatusBreakdownItem`, `MonthlyActivityItem`, `DashboardSummary`. La interfaz local de UI `VacancyStatus` se renombró a `DashboardVacancyStatusCard` para no chocar con el enum `VacancyStatus` de `api.types.ts`.

#### Eliminados

- `src/types/position.types.ts` — sin uso, contenía el nombre de campo obsoleto `education`.
- `src/types/vacancy.types.ts` — duplicado sin uso de `Vacancy` en `api.types.ts`.
- `src/services/api/uploads.api.ts` — llamaba al endpoint inexistente `/uploads`.

---

### Fase A — Limpieza de `any` en las páginas

#### `src/pages/Login.tsx`

- Eliminado `const data: any = await authService.login(...)`. Ahora usa el tipado `LoginResponseData`.
- Búsqueda de token/email simplificada — el fallback muerto `data.data?.token` eliminado (era un síntoma del tipado erróneo `ApiResponse<T>`).
- `catch (error: any)` reemplazado por `catch (error) { const message = error instanceof Error ? error.message : String(error); }`.

#### `src/pages/PositionHistory.tsx`

- `useState<any[]>` → `useState<Position[]>` (importado de `api.types.ts`).
- Eliminado el cast `as string[]` sobre los nombres de departamento (ahora se infiere).
- `catch (err: any)` → `catch (err)`.

#### `src/pages/Position.tsx`

- Dos bloques `catch (error: any)` (procesamiento IA + submit) se estrechan vía `formatApiError` (ver Fase B).

#### `src/pages/Vacancy.tsx`

- `catch (error: any)` → `catch (error)` con estrechamiento vía `formatApiError`.
- Eliminado el desempaquetado defensivo `const v = vacancyData?.data || vacancyData` ahora que `vacanciesApi.getById` devuelve `Vacancy` directamente.

#### `src/pages/CreateDepartment.tsx`

- La aserción de tipo ad-hoc `{ serverData: any }` reemplazada por `err instanceof ApiError && err.data` — estrecha vía la clase `ApiError` exportada desde `apiClient.ts`, que lleva un `data?: unknown` tipado para los detalles del servidor.

#### `src/components/Sections/PositionHistoryTable.tsx`

- `PositionData.createdAt` ahora opcional (`createdAt?: string`) y `formatDate` acepta `string | undefined`, de modo que `Position[]` es estructuralmente asignable.

---

### Fase A — Exposición de errores (detalles de campo de Zod)

`Position.tsx` y `Vacancy.tsx` ahora incluyen un helper `formatApiError`:

```typescript
const formatApiError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    if (Array.isArray(error.data)) {
      const details = (error.data as ApiErrorDetail[])
        .map(d => `${d.field}: ${d.message}`)
        .join("; ");
      if (details) return `${error.message} — ${details}`;
    }
    return error.message;
  }
  return error instanceof Error ? error.message || fallback : fallback;
};
```

Cuando el backend devuelve un 400 con `details` de Zod, la UI ahora muestra `Validation error — body.role: mínimo 5 caracteres` en vez de solo `Validation error`.

---

### Fase A — Correcciones en la creación de posición

Dos arreglos en `Position.tsx handleSubmitFinal` y `processWithAI` resuelven los 400 que ocurrían en el flujo de creación.

**1. `educationArea: undefined` cuando está vacío**

Según §8.1, `educationArea` es opcional cuando `educationLevel` es `NONE` o `HIGH_SCHOOL`; si se omite, el backend asigna `"N/A"`. Pero el frontend enviaba `educationArea: ""` (string vacío, no omitido), que el validador Zod rechazaba. Corregido con:

```typescript
educationArea: formData.educationArea?.trim() || undefined,
```

`JSON.stringify` omite los valores `undefined`, así que el campo queda realmente ausente del payload.

**2. Coalescencia `??` para el `yearsOfExperience` extraído por IA**

El mapeo de IA era `yearsOfExperience: aiData.yearsOfExperience || prev.yearsOfExperience`, que trataba un `0` legítimo como falsy y caía al valor anterior. El backend ahora acepta `>= 0`, así que hace falta `??`:

```typescript
yearsOfExperience: aiData.yearsOfExperience ?? prev.yearsOfExperience,
```

---

### Fase B — Correcciones en `Resultados.jsx`

#### Parsing de la respuesta

Chequeaba `response.status === "success"` y leía `response.data.results` — ninguno de los dos existe en el contrato de la API. Después de que `apiClient` desempaqueta `.data`, la respuesta es `MatchResult[]` directamente. Simplificado a:

```javascript
setCandidates(Array.isArray(response) ? response : []);
```

#### Estado de vacante inválido

`await vacanciesApi.updateStatus(id, "FILLED")` — `"FILLED"` no es un `VacancyStatus` válido. El enum permite `ACTIVE | PAUSED | CLOSED` (§0). Cuando un candidato se marca como "Contratado" y la vacante se cierra, ahora enviamos `"CLOSED"`.

---

### Fase C — `/uploadcv` enrutado por el endpoint documentado

`uploads.api.ts` fue eliminado (llamaba al inexistente `/uploads`). `UploadCV.jsx` ahora:

1. Carga las vacantes al montar vía `vacanciesApi.getAll()`, filtradas a `status === "ACTIVE"`.
2. Renderiza un `<select>` obligatorio en la parte superior del formulario.
3. Deshabilita el botón "Subir Archivos" hasta que se seleccione una vacante.
4. Sube vía `vacanciesApi.uploadCVs(selectedVacancyId, files)` — el documentado `POST /vacancies/:id/upload` (§4).
5. Al recibir la respuesta, cuenta los fallos por archivo (`UploadResult[]`) y muestra un aviso si algún archivo no pudo procesarse. El detalle completo por archivo (creado/duplicado/fallido) sigue pendiente — ver `issues/P1.md §5.2`.

---

### Seguimiento de issues

`issues/P0.md`, `P1.md`, `P2.md`, `P3.md` reestructurados para reflejar el estado actual:

- **P0** — todos los EPICs (1, 2.1, 3.x) resueltos. Documento conservado como registro histórico.
- **P1** — restantes: 4.4, 5.2 (parcial), 6.2, 6.3, 6.4, 6.5.
- **P2** — ningún ítem resuelto entonces, pero la base para 7.1 (Dashboard) y 9.1 (rol en auth) quedó lista con los nuevos tipos.
- **P3** — 10.3 (`serverData` de CreateDepartment) y 10.4 (limpieza de `any`) resueltos. Restantes: 10.1, 10.2, 10.3 (bloque final de Login), 10.5.

Los ítems resueltos se eliminaron de los archivos para que cada P contenga solo trabajo pendiente accionable.

---

## Sesión previa — Limpieza del desempaquetado del envelope

**Rama:** `features`
**Fecha:** 2026-07-08

### Contexto

`apiClient` ya desempaqueta el envelope de respuesta del backend (incluida la doble envoltura `{ response: { success, data } }` usada por los endpoints con `sendResponseOr404`). Pese a eso, varios métodos de servicio estaban incorrectamente tipados como si devolvieran `Promise<ApiResponse<T>>` cuando en realidad devuelven `T` directamente. Los consumidores tenían entonces que re-desempaquetar defensivamente con patrones como:

```typescript
Array.isArray(data) ? data : (data as any)?.data || [];
```

Ya están eliminados. Ver `api-documentation.md §9` para el detalle de la doble envoltura de `sendResponseOr404`.

### Archivos cambiados

#### `src/services/api/positions.api.ts`

- `getAll`: tipo de retorno corregido de `Promise<ApiResponse<Position[]>>` a `Promise<Position[]>`. Añadido el parámetro de tipo explícito `<Position[]>` a la llamada a `apiClient` para que TypeScript infiera el tipo correcto en el call site.

#### `src/services/api/vacancies.api.ts`

- `getAll`: misma corrección — `Promise<ApiResponse<Vacancy[]>>` → `Promise<Vacancy[]>` con `<Vacancy[]>` explícito en `apiClient`.

#### `src/services/api/candidates.api.ts`

- `getAll`: misma corrección — `Promise<ApiResponse<Candidate[]>>` → `Promise<Candidate[]>` con `<Candidate[]>` explícito en `apiClient`.

#### `src/pages/PositionHistory.tsx` (línea 28)

- Reemplazado `const positionsArray = Array.isArray(data) ? data : (data as any)?.data || []` por `const positionsArray = data ?? []`.
- Eliminada la anotación ahora redundante `(p: any)` en el `.map()` — TypeScript infiere `p: Position` del array tipado.

#### `src/pages/VacancyHistory.tsx` (línea 35)

- Eliminada la variable intermedia `rawData` y la cadena de extracción defensiva.
- Simplificado a `setVacancies([...data].reverse())` directamente. El guard ternario previo (`rawData ? ... : []`) siempre era truthy y desapareció.

#### `src/pages/Vacancy.tsx` (línea 64)

- Reemplazado `const positions = Array.isArray(posRes) ? posRes : (posRes as any)?.data || []` por `const positions = posRes`. `positionService.getAll()` ahora declara `Position[]` como tipo de retorno, así que no hace falta desempaquetar.

#### `src/pages/Position.tsx` (líneas 9, 51–60)

- Reemplazado `import { apiClient }` por `import { departmentsApi }`.
- Reemplazado el fetch manual `apiClient('/departments', { method: 'GET' })` (que además contenía un extractor defensivo) por una única llamada a `departmentsApi.getAll()` — consistente con cómo `Vacancy.tsx` carga departamentos.

#### `src/pages/CVHistory.jsx` (línea 25)

- **Sin cambios.** `setCvs(data || [])` ya funciona correctamente: `candidateService.getAll()` devuelve el array directamente y el fallback `|| []` es un guard inofensivo ante null/undefined inesperados. Validado y dejado como está.

### También cambiado en esta sesión (departments.api.ts)

La interfaz `RawDepartment` y la función `normalizeRawDepartment` de `src/services/api/departments.api.ts` se corrigieron para coincidir con la forma real del backend Prisma/SQL (validado contra `api-documentation.md`):

| Antes                     | Después                          | Razón                                                            |
| ------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| `_id?: string`            | `id: number`                     | El backend es Prisma/SQL — el campo es `id`, no `_id`, y es numérico |
| `positionsCount?: number` | `_count?: { positions: number }` | Prisma devuelve el conteo anidado bajo `_count`                  |
| `created_at?: string`     | _(eliminado)_                    | Prisma usa `createdAt` en camelCase exclusivamente               |
| `positions?: unknown[]`   | _(eliminado)_                    | No lo devuelve la API                                            |

La normalización ahora convierte `id: number → string`, aplana `_count.positions → positionsCount` y mapea `title → name` — todo en una única función tipada y sin `any`.

---

## Issues restantes de P0 — EPIC 2 y EPIC 3

**Fecha:** 2026-07-08

### EPIC 2.1 — `src/pages/Vacancy.tsx`

Dos llamadas `navigate("/history")` apuntaban a una ruta que no existe en `App.tsx` (cae al comodín y va a `/dashboard`). Ambas corregidas a `navigate("/vacancy-history")`:

- El callback `onReset` dentro de `<VacancySuccess>` (rama de modo edición).
- El `onClick` del botón "Volver al historial".

### EPIC 3.2 — `src/services/api/positions.api.ts`

`POST /positions/complete` espera `multipart/form-data` con el campo `pdf` (§3). El frontend enviaba `file`.

- `formData.append("file", pdfFile)` → `formData.append("pdf", pdfFile)`

### EPIC 3.3 — `src/pages/Position.tsx` (select de educationLevel)

El `<select>` usaba labels en español como `value` (`"Bachiller"`, `"Maestría"`…). La API valida contra el enum `EducationLevel` (§0). Todos los valores actualizados al enum y añadidos dos niveles que faltaban:

| Antes (value)           | Después (value) | Label mostrada                     |
| ----------------------- | --------------- | ---------------------------------- |
| `"Ninguno"`             | `"NONE"`        | Ninguno                            |
| `"Bachiller"`           | `"HIGH_SCHOOL"` | Bachiller                          |
| _(faltaba)_             | `"TECHNICAL"`   | Técnico                            |
| _(faltaba)_             | `"BACHELOR"`    | Pregrado / Bachiller universitario |
| `"Grado Universitario"` | `"UNIVERSITY"`  | Grado Universitario                |
| `"Maestría"`            | `"MASTER"`      | Maestría                           |
| _(faltaba)_             | `"DOCTORATE"`   | Doctorado                          |

### EPIC 3.4 — Renombrado `education` → `educationArea`

La API usa `educationArea` (§3); el frontend enviaba `education` → 400 al crear.

- `src/services/api/positions.api.ts` — `CreatePositionInput.education: string` → `educationArea: string`
- `src/pages/Position.tsx` — `INITIAL_STATE.education` → `educationArea`; `value`/`onChange` del input actualizados; `validateStep(4)` actualizado con la regla §8.1: `educationArea` solo es obligatorio cuando `educationLevel` no es `NONE` ni `HIGH_SCHOOL`. El asterisco en la label de "Área de estudio" ahora es condicional según la misma regla.

### EPIC 3.5 — `src/pages/Position.tsx` (mapeo de la respuesta de IA)

`processWithAI` mapeaba `education: aiData.education` — un campo que no existe en la respuesta de la API (§3 usa `educationArea`). Corregido a `educationArea: aiData.educationArea ?? prev.educationArea`.

### EPIC 3.6 — `src/pages/Position.tsx` (guards de `validateStep`)

Añadidos guards de longitud mínima que coinciden con las reglas de validación de la API (§3):

- Paso 2: `role.trim().length >= 5` (antes `!== ""`), `description.trim().length >= 25` (antes `!== ""`)
- Paso 4: `educationLevel !== ""` + chequeo condicional de `educationArea` (§8.1)

### EPIC 10.4 (de P3) — `src/pages/Position.tsx` (`any[]` → `Department[]`)

`useState<any[]>` para departamentos resuelto como efecto colateral del EPIC 3.1: se añadió el import de `Department` desde `../types/department.types` y el estado quedó tipado como `useState<Department[]>([])`.

---

## Archivos de issues — correcciones contra api-documentation.md

### P1 §6.1 — parsing de resultados

El código de parsing sugerido usaba `response?.results`, que no existe en la respuesta de la API. `GET /vacancies/:id/results` devuelve `{ success, data: MatchResult[], meta }` — `apiClient` desempaqueta `.data`, así que `response` ya es `MatchResult[]`. Corregido a:

```js
const candidatesData = Array.isArray(response) ? response : [];
```

### Todos los demás issues P0–P3 validados contra api-documentation.md ✅

Tras cruzar cada issue con la documentación de la API:

- **P0:** todos los EPICs 1–3 coinciden con los endpoints, enums y nombres de campo documentados.
- **P1:** los EPICs 4–6 coinciden; solo §6.1 tenía el error de `response?.results` (corregido arriba).
- **P2:** los EPICs 7–9 coinciden; la forma de la API admin en §8.1 se alinea con la respuesta documentada de `GET /admin/users` (`{ users, meta }`).
- **P3:** el EPIC 10 es solo calidad de código; sin problemas de precisión respecto a la API.
