# API Documentation — TalentMatch AI

**Generado a partir de:** `src/routes/`, `src/controllers/`, `src/validations/` y `prisma/schema.prisma`.
**Base URL:** `/api`
**Formato:** JSON (`Content-Type: application/json`), excepto los endpoints de subida de archivos (`multipart/form-data`).

---

## 0. Convenciones generales

### Autenticación

La mayoría de los endpoints requieren un JWT en el header:

```
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/users/login` y contiene `{ userId, role }`. El middleware de auth (`authMiddleware`) lo decodifica y expone `req.user = { id, role }` a los controladores.

**Rutas públicas (sin token):** únicamente `POST /api/users` y `POST /api/users/login`. Todo lo demás requiere `Authorization: Bearer <token>` válido.

**Rutas admin-only:** todo `/api/admin/*` requiere además `role: "ADMIN"` en el token — si el usuario es `"USER"`, responde `403`.

**Aislamiento multi-tenant:** salvo los endpoints de `/api/admin`, todas las consultas están filtradas por `userId` del token — un usuario nunca puede leer/editar/borrar recursos de otro usuario (devuelve `404`, no `403`, para no filtrar existencia del recurso).

### Formato estándar de respuesta exitosa

La mayoría de los controladores responde:

```json
{ "success": true, "data": { ... } }
```

> **Nota técnica:** los endpoints que usan el helper `sendResponseOr404` (ver sección 9) envuelven la respuesta un nivel adicional: `{ "response": { "success": true, "data": { ... } } }`. Verificar caso por caso en las tablas de abajo qué forma aplica a cada endpoint.

### Formato estándar de error

```json
{ "success": false, "error": "<mensaje>" }
```

Errores de validación (Zod, HTTP 400) incluyen además:

```json
{
  "success": false,
  "error": "Validation error",
  "details": [{ "field": "campo", "message": "..." }]
}
```

### Enums relevantes (`prisma/schema.prisma`)

| Enum                | Valores                                                                             |
| ------------------- | ----------------------------------------------------------------------------------- |
| `EducationLevel`    | `NONE`, `HIGH_SCHOOL`, `BACHELOR`, `TECHNICAL`, `UNIVERSITY`, `MASTER`, `DOCTORATE` |
| `VacancyStatus`     | `ACTIVE`, `PAUSED`, `CLOSED`                                                        |
| `CandidateStatus`   | `DISPONIBLE`, `CONTRATADO`                                                          |
| `ApplicationStatus` | `PENDIENTE`, `EN_PROCESO`, `SELECCIONADO`, `RECHAZADO`                              |
| `UserRole`          | `ADMIN`, `USER`                                                                     |

---

## 1. Autenticación y Usuarios — `/api/users`

### `POST /api/users`

Registra un nuevo usuario y crea automáticamente 10 departamentos default para su cuenta.
**Auth:** no requerida.

| Campo (body) | Tipo     | Requerido | Validación                                                     |
| ------------ | -------- | --------- | -------------------------------------------------------------- |
| `email`      | `string` | Sí        | Formato email válido (se normaliza a minúsculas y trim)        |
| `password`   | `string` | Sí        | 10–100 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número |

**Respuesta 201:**

```json
{ "success": true, "message": "User created successfully", "userId": 1 }
```

**Errores:**
| Código | Causa |
|---|---|
| 400 | Body inválido (email mal formado, password no cumple regex/longitud) |
| 409 | El email ya está registrado (`Email alredy exists`) |
| 500 | Error interno no controlado |

---

### `POST /api/users/login`

**Auth:** no requerida.

| Campo (body) | Tipo     | Requerido | Validación           |
| ------------ | -------- | --------- | -------------------- |
| `email`      | `string` | Sí        | Formato email válido |
| `password`   | `string` | Sí        | No vacío             |

**Respuesta 200:**

```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": 1, "email": "...", "role": "USER" }
}
```

**Errores:**
| Código | Causa |
|---|---|
| 400 | Body inválido |
| 401 | Email o password incorrectos (mensaje genérico, no revela cuál campo falló) |
| 500 | Error interno no controlado |

---

## 2. Departamentos — `/api/departments`

**Auth:** requerida (cualquier rol). Todas las operaciones están scoped a `req.user.id`.

### `GET /api/departments`

Sin parámetros. Devuelve todos los departamentos del usuario autenticado, con `_count.positions`.

**Paginación:** ninguna. `prisma.department.findMany` no usa `skip`/`take` — todos los departamentos del usuario vuelven en una sola respuesta, siempre. En la práctica esta lista es pequeña y acotada (10 sembrados al registrarse + los que el usuario cree), así que hasta ahora no ha necesitado paginación.

### `POST /api/departments`

| Campo (body) | Tipo     | Requerido | Validación          |
| ------------ | -------- | --------- | ------------------- |
| `title`      | `string` | Sí        | mínimo 3 caracteres |

Respuesta 201 con el departamento creado.

### `GET /api/departments/:id`

| Parámetro   | Tipo                | Requerido |
| ----------- | ------------------- | --------- |
| `id` (path) | `number` (positivo) | Sí        |

### `PUT /api/departments/:id`

| Campo (body) | Tipo     | Requerido    | Validación                      |
| ------------ | -------- | ------------ | ------------------------------- |
| `title`      | `string` | No (parcial) | mínimo 3 caracteres si se envía |

### `DELETE /api/departments/:id`

Solo `id` en params.

**Errores comunes (los 4 endpoints con `:id`):**
| Código | Causa |
|---|---|
| 400 | `id` no es un entero positivo, o body inválido |
| 404 | Departamento no existe o no pertenece al usuario |
| 500 | Error interno |

> Nota: `updateDepartment` no usa la técnica de "solo actualizar campos definidos" porque el modelo solo tiene un campo (`title`) y ya es opcional en el schema — no hay riesgo de sobrescritura accidental como en Posiciones/Vacantes.

---

## 3. Posiciones — `/api/positions`

**Auth:** requerida. Todas las operaciones están scoped a `req.user.id`.

### `GET /api/positions`

Sin parámetros. Lista posiciones del usuario (campos seleccionados: `id, userId, departmentId, role, yearsOfExperience, technicalSkills, optionalTechnicalSkills, softSkills, languages, description, educationLevel, educationArea, createdAt` — **no incluye** `positionPdfUrl` ni `updatedAt`).

**Paginación:** ninguna. `prisma.position.findMany` no usa `skip`/`take` — devuelve **todas** las posiciones que el usuario haya creado, en un solo array, sin aceptar parámetros `limit`/`page`. Un usuario con cientos de posiciones recibe todas en una sola respuesta.

### `POST /api/positions`

Crea una posición. Valida que `departmentId` exista y pertenezca al usuario.

| Campo (body)              | Tipo                      | Requerido   | Validación                                            |
| ------------------------- | ------------------------- | ----------- | ----------------------------------------------------- |
| `role`                    | `string`                  | Sí          | mínimo 5 caracteres                                   |
| `yearsOfExperience`       | `number`                  | Sí          | entero ≥ 0 — acepta `0` para roles entry-level (coerción desde string) |
| `technicalSkills`         | `string[]`                | Sí          | mínimo 1 elemento                                     |
| `optionalTechnicalSkills` | `string[]`                | No          | —                                                     |
| `softSkills`              | `string[]`                | Sí          | mínimo 1 elemento — `"At least one soft skill is required"` |
| `languages`               | `string[]`                | Sí          | mínimo 1 elemento — `"At least one language is required"`   |
| `description`             | `string`                  | Sí          | mínimo 25 caracteres                                  |
| `educationLevel`          | `EducationLevel` (string) | Sí          | debe ser uno de los valores del enum                  |
| `educationArea`           | `string`                  | Condicional | **ver sección 8 — regla `NONE`**                      |
| `departmentId`            | `number`                  | Sí          | entero positivo, debe existir y pertenecer al usuario |

**Respuesta 201:** objeto `Position` completo creado (incluye `userId`, `positionPdfUrl: null`, timestamps).

**Errores:**
| Código | Causa |
|---|---|
| 400 | Body inválido (Zod) — incluye `educationArea` faltante cuando el nivel lo requiere |
| 404 | `departmentId` no existe o no pertenece al usuario |
| 500 | Error interno |

### `POST /api/positions/complete`

Extrae y autocompleta los datos de una posición a partir de un PDF, usando IA. **No persiste nada en base de datos.**
**Content-Type:** `multipart/form-data`, campo de archivo: `pdf` (un solo archivo).

**Respuesta 200:**

```json
{
  "success": true,
  "data": {
    /* PositionExtracted */
  },
  "cloudinaryPositionUrl": "https://...",
  "message": "..."
}
```

**Errores:**
| Código | Causa |
|---|---|
| 400 | No se subió archivo, o el texto extraído del PDF tiene menos de 300 caracteres |
| 500 | Error de extracción/IA/Cloudinary no controlado |

### `POST /api/positions/duplicate/:id`

Duplica una posición existente del usuario (agrega `" (Copy)"` al `role`). Sin body.

| Parámetro   | Tipo                | Requerido |
| ----------- | ------------------- | --------- |
| `id` (path) | `number` (positivo) | Sí        |

**Errores:** `400` id inválido · `404` posición no existe/no pertenece al usuario · `500`.

### `GET /api/positions/:id`

Igual selección de campos que el listado. `404` si no existe/no pertenece al usuario.

### `PUT /api/positions/:id`

**Actualización parcial real** — solo se modifican los campos presentes en el body; los omitidos conservan su valor actual (ver sección 8).

| Campo (body)                              | Tipo | Requerido             |
| ----------------------------------------- | ---- | --------------------- |
| Todos los campos de `POST /api/positions` | —    | No (todos opcionales) |

**Errores:** `400` body/id inválido · `404` no existe/no pertenece al usuario · `500`.

### `DELETE /api/positions/:id`

Solo `id`. `404` si no existe/no pertenece al usuario.

---

## 4. Vacantes — `/api/vacancies`

**Auth:** requerida. Scoped a `req.user.id`.

### `GET /api/vacancies`

Sin parámetros. Incluye `_count.candidates`, `candidates` completos, y `position: { id, role }` (**corregido 2026-07-13**: antes la respuesta solo traía el FK crudo `positionId`, sin datos anidados de la posición — el frontend no tenía forma de mostrar el rol de la posición sin una segunda request).

**Paginación:** ninguna, en ningún eje. `prisma.vacancy.findMany` devuelve **todas** las vacantes del usuario sin `skip`/`take`, y por cada vacante incrusta el array **completo** de `candidates` (cada registro `Candidate` vinculado a esa vacante — no solo `_count`, sino los registros completos con `rawApiPayload` incluido). Es la respuesta sin paginar más pesada de toda la API: el tamaño de la respuesta escala con la cantidad de vacantes **multiplicada** por candidatos-por-vacante. Una vacante con miles de CVs subidos hace que esta única respuesta crezca proporcionalmente — no existe parámetro `limit`/`page` para recortarla.

### `POST /api/vacancies`

Valida que `departmentId` pertenezca al usuario, que el departamento tenga al menos una posición, y que `positionId` pertenezca a ese departamento.

| Campo (body)     | Tipo                     | Requerido | Validación                                         |
| ---------------- | ------------------------ | --------- | -------------------------------------------------- |
| `title`          | `string`                 | Sí        | mínimo 1 carácter                                  |
| `availableSlots` | `number`                 | Sí        | entero positivo                                    |
| `startDate`      | `date` (ISO string)      | Sí        | debe ser anterior a `endDate`                      |
| `endDate`        | `date` (ISO string)      | Sí        | debe ser posterior a `startDate`                   |
| `status`         | `VacancyStatus` (string) | No        | default `ACTIVE` si se omite                       |
| `departmentId`   | `number`                 | Sí        | entero positivo                                    |
| `positionId`     | `number`                 | Sí        | entero positivo, debe pertenecer al `departmentId` |

**Errores:** `400` body inválido / departamento sin posiciones / posición no pertenece al departamento · `404` departamento no existe o no pertenece al usuario · `500`.

### `GET /api/vacancies/:id`

`404` si no existe/no pertenece al usuario. Incluye también `position: { id, role }` (**corregido 2026-07-13**, mismo fix que el endpoint de lista de arriba — este endpoint de un solo registro antes omitía `position` por completo, ni siquiera el FK).

### `GET /api/vacancies/:id/results`

Resultados de matching (IA) paginados.

| Parámetro       | Tipo     | Requerido | Default |
| --------------- | -------- | --------- | ------- |
| `id` (path)     | `number` | Sí        | —       |
| `page` (query)  | `number` | No        | 1       |
| `limit` (query) | `number` | No        | 20      |

**Respuesta 200:** `{ success, data: MatchResult[], meta: { total, page, limit, totalPages } }`. Cada `MatchResult` incluye el desglose completo (`hardSkillsScore`, `experienceScore`, `roleScore`, `languagesScore`, `educationScore`, `softSkillsScore`), el snapshot congelado `normalizedCandidate`, `summary`, `redFlags`, y un `candidate` anidado: `{ id, fullName, email, fileUrl, applications: [{ status }] }` — este es actualmente el único lugar donde se expone `ApplicationStatus` al cliente (solo lectura, sin endpoint dedicado `/api/applications` — ver §8.5).

> **Sin tope máximo en `limit`:** el controlador hace `parseInt(req.query.limit) || 20` sin ningún `Math.min`/clamp contra un tamaño de página máximo. Un cliente que envíe `?limit=100000` recibe todos los `MatchResult` de esa vacante en una sola "página". Usar `meta.total`/`meta.totalPages` para manejar la paginación real en la UI, en vez de asumir que 20 es un tope fijo.

### `POST /api/vacancies/:id/upload`

Sube uno o varios CVs en PDF, los procesa con IA (extracción + deduplicación por hash SHA-256) y crea registros `Candidate` asociados a la vacante.
**Content-Type:** `multipart/form-data`, campo: `pdfs` (array, máx. 100 archivos, máx. 5MB cada uno, solo `application/pdf`).

**Respuesta 201:**

```json
{ "success": true, "data": [ { "success": true, "data": { /* Candidate */ } } | { "success": false, "message": "...", "error": "...", "stack": "..." } ] }
```

Se procesa cada archivo de forma independiente (concurrencia máx. 5) — un archivo fallido no bloquea a los demás.

**Errores por archivo (dentro del array, no cambian el status HTTP global):**
| Causa | Resultado |
|---|---|
| Texto extraído < 500 caracteres | `{ success: false, message: "..." }` |
| Hash ya existe **para este usuario** (CV duplicado, posiblemente entre vacantes) | `{ success: true, data: <candidato existente> }` |
| Otro error de procesamiento/IA | `{ success: false, message, error, stack }` |

> **Reutilización entre vacantes (corregido 2026-07-13):** la deduplicación por `Candidate.hash` está scoped por usuario (`@@unique([userId, hash])`), no es global. Subir el mismo CV a una vacante **distinta** del mismo usuario reutiliza el registro `Candidate` existente (sin repetir la llamada a OpenAI/Cloudinary) y además crea/actualiza (`upsert`) un registro `Application(candidateId, vacancyId)` que lo vincula a la nueva vacante — esto es lo que hace que el candidato reutilizado aparezca como pendiente en `POST /:id/evaluations` también para esa vacante. Antes de este fix, el candidato reutilizado quedaba silenciosamente atado solo a la vacante de su subida *original* y nunca podía evaluarse para ninguna otra vacante (la request igual devolvía `success: true`, sin ningún error visible — ver la sección de "Inconsistencias Conocidas" para el incidente que esto cierra). Subir el mismo CV bajo **dos usuarios distintos** ya no choca en absoluto — cada usuario obtiene su propio registro `Candidate` independiente (la deduplicación por hash nunca cruza entre tenants).

**Errores globales:** `400` si no se envía ningún archivo · `404` vacante no existe/no pertenece al usuario (implícito por `id` inválido) · `500`.

### `POST /api/vacancies/:id/evaluations`

Ejecuta el motor de matching IA sobre cada `Application` de esta vacante que aún no tenga un `MatchResult` (**cambiado 2026-07-13**: antes obtenía los candidatos pendientes directamente de `Candidate.vacancyId`, lo que significaba que un candidato reutilizado entre vacantes vía deduplicación por hash era invisible para cualquier vacante excepto aquella a la que se subió originalmente). Sin body.

**Errores:** `404` vacante no encontrada o sin candidatos pendientes de evaluar (`400` si no hay candidatos) · `500`.

### `PATCH /api/vacancies/:id/status`

| Campo (body) | Tipo                     | Requerido |
| ------------ | ------------------------ | --------- |
| `status`     | `VacancyStatus` (string) | Sí        |

**Errores:** `400` status inválido/id inválido · `404` no existe/no pertenece al usuario · `500`.

### `PATCH /api/vacancies/:vacancyId/candidates/:candidateId/status`

**Agregado 2026-07-23.** Cambia el estado de una `Application` (es decir, el estado de contratación de un candidato para esta vacante puntual) y aplica el límite de `Vacancy.availableSlots` — ver **§8.6** para la regla de negocio completa. Es la única vía de escritura para `ApplicationStatus` hoy; sigue sin existir un CRUD genérico de `/api/applications` (ver §8.5).

| Parámetro              | Tipo                          | Requerido |
| ----------------------- | ----------------------------- | --------- |
| `vacancyId` (path)      | `number` (positivo)           | Sí        |
| `candidateId` (path)    | `number` (positivo)           | Sí        |
| `status` (body)         | `ApplicationStatus` (string)  | Sí        |

**Respuesta 200:**

```json
{
  "success": true,
  "data": {
    "application": { /* Application actualizada */ },
    "vacancy": { "id": 1, "availableSlots": 2, "status": "ACTIVE" }
  }
}
```

Nota: este endpoint **no** usa `sendResponseOr404` — la respuesta es `{ success, data }` directamente, sin doble envoltura (a diferencia de `PATCH /:id/status` arriba).

**Errores:**
| Código | Causa |
|---|---|
| 400 | Valor de `status` inválido, o `vacancyId`/`candidateId` inválido |
| 404 | La vacante no existe/no pertenece al usuario, o el candidato no tiene `Application` para esta vacante |
| 409 | La vacante ya está `CLOSED`, o se envía `status: "SELECCIONADO"` pero `availableSlots` ya está completo (ver §8.6) |
| 500 | Error interno no manejado |

### `PUT /api/vacancies/:id`

**Actualización parcial real** (mismo comportamiento que Posiciones — ver sección 8).

| Campo (body)                              | Tipo | Requerido             |
| ----------------------------------------- | ---- | --------------------- |
| Todos los campos de `POST /api/vacancies` | —    | No (todos opcionales) |

### `DELETE /api/vacancies/:id`

Solo `id`. `404` si no existe/no pertenece al usuario.

---

## 5. Candidatos — `/api/candidates`

**Auth:** requerida. Solo lectura — no hay endpoints de creación/edición/borrado directo (los candidatos se crean únicamente vía `POST /api/vacancies/:id/upload`).

### `GET /api/candidates`

Lista candidatos del usuario (campos seleccionados, incluye `rawApiPayload`).

**Paginación:** ninguna. `prisma.candidate.findMany` devuelve **todos** los candidatos subidos alguna vez por el usuario, sin `skip`/`take` y sin aceptar parámetros `page`/`limit`. Cada registro incluye además `rawApiPayload` (el JSON crudo que devolvió la IA por cada CV), que no es un campo pequeño — un usuario con historial extenso de candidatos recibe todo ese historial, payload incluido, en una sola respuesta.

### `GET /api/candidates/:id`

| Parámetro   | Tipo                | Requerido |
| ----------- | ------------------- | --------- |
| `id` (path) | `number` (positivo) | Sí        |

**Errores:** `400` id inválido · `404` no existe/no pertenece al usuario.

---

## 6. Administración — `/api/admin`

**Auth:** requerida + `role: "ADMIN"` (`403` si no).

### `GET /api/admin/stats`

Métricas **globales de toda la plataforma** (no filtradas por usuario, a diferencia del dashboard de la sección 7): `usersCount, candidatesCount, positionsCount, vacanciesCount, activeVacancies, closedVacancies`.

No es una lista — es un único objeto agregado (seis queries `count()` ejecutadas en paralelo). No aplica paginación; no hay nada que paginar.

### `GET /api/admin/users`

Lista paginada de todos los usuarios del sistema.

| Parámetro (query) | Tipo     | Requerido | Default |
| ----------------- | -------- | --------- | ------- |
| `page`            | `number` | No        | 1       |
| `limit`           | `number` | No        | 50      |

**Respuesta 200:** `{ success, data: { users: User[], meta: { totalCount, currentPage, totalPages } } }`.

> **Sin tope máximo en `limit`:** mismo patrón que los resultados de vacantes — `parseInt(req.query.limit, 10) || 50` sin clamp. `?limit=999999` devuelve a todos los usuarios del sistema en una sola página. Ordenado de forma determinista por `createdAt desc`, así que las páginas no se desordenan entre requests mientras no se cree un usuario nuevo en el medio.

### `PUT /api/admin/users/:id/role`

| Parámetro     | Tipo                | Requerido |
| ------------- | ------------------- | --------- |
| `id` (path)   | `number`            | Sí        |
| `role` (body) | `"ADMIN" \| "USER"` | Sí        |

**Errores:** `400` role inválido/id inválido · `403` si el solicitante no es ADMIN · `404` (Prisma lanza error si el usuario no existe — hoy no está capturado explícitamente, cae al manejador global) · `500`.

### `DELETE /api/admin/users/:id`

Solo `id`. Mismas consideraciones de error que arriba.

---

## 7. Dashboard — `/api/dashboard`

**Auth:** requerida. Scoped a `req.user.id` (a diferencia de `/api/admin/stats`, que es global).

### `GET /api/dashboard`

Sin parámetros.

**Respuesta 200:**

```json
{
  "total": {
    "positionsCount": 0,
    "departmentsCount": 0,
    "candidatesCount": 0,
    "openVacanciesCount": 0
  },
  "vacancyStatusBreakdown": [
    { "status": "ACTIVE", "count": 0, "percentage": 0 }
  ],
  "monthlyActivity": [
    {
      "month": "2026-01",
      "positionsCreated": 0,
      "cvUploads": 0,
      "vacanciesCreated": 0
    }
  ]
}
```

**Paginación y tamaño de los arrays — este endpoint no acepta parámetros `page`/`limit` en absoluto:**

- `total`: no es un array — cuatro queries independientes de `count()`/agregación, siempre exactamente estas 4 claves.
- `vacancyStatusBreakdown`: array de tamaño fijo, siempre 3 entradas (una por cada status "baseline" que el servicio hardcodea), sin importar cuántas vacantes tenga el usuario. **Inconsistencia detectada:** el baseline hardcodeado en `dashboard.service.ts` es `["ACTIVE", "CLOSED", "CONTACTING"]`, pero `VacancyStatus` en `prisma/schema.prisma` en realidad es `ACTIVE | PAUSED | CLOSED` — no existe ningún status `CONTACTING` en el schema, y `PAUSED` falta por completo de este breakdown. En la práctica: la entrada `"CONTACTING"` siempre reporta `count: 0, percentage: 0` (nunca puede matchear una fila real), y cualquier vacante que esté realmente en `PAUSED` queda excluida silenciosamente del breakdown (sí se cuenta en `total`, pero acá es invisible). No confiar en este array para reconciliar contra el status real de cada vacante hasta que esto se corrija.
- `monthlyActivity`: **sin límite, sin paginación** — una fila por cada mes calendario que tenga al menos un evento (position/CV/vacancy creado) desde el primer evento del usuario, calculado con un `GROUP BY DATE_FORMAT(createdAt, '%Y-%m')` en SQL crudo, ascendente. Para una cuenta de varios años, este array solo crece; no existe filtro de rango `from`/`to` ni tope de cuántos meses se devuelven.

---

## 8. Contratos de Integración (Reglas de Negocio)

### 8.1 Manejo del valor `"NONE"` en educación (Positions)

`EducationLevel` incluye `NONE` como valor **legítimo** del enum — no es un placeholder inválido, representa "sin requisito de educación formal" para la posición.

- Si `educationLevel` es `"NONE"` o `"HIGH_SCHOOL"`, **`educationArea` es opcional**. Si se omite, el backend asigna automáticamente `educationArea: "N/A"` antes de guardar (nunca queda `null`/`undefined`/`""` en base de datos).
- Si `educationLevel` es `"BACHELOR"`, `"TECHNICAL"`, `"UNIVERSITY"`, `"MASTER"` o `"DOCTORATE"`, **`educationArea` es obligatorio** — si falta, la API responde `400` con `"Education area is required for this education level"`.
- **Consumo recomendado para frontend:** al mostrar `educationArea` en pantallas de lectura, tratar el valor `"N/A"` como "No aplica" en la UI, no mostrarlo crudo.
- Esta regla aplica solo a `POST /api/positions` (creación). En `PUT /api/positions/:id` (actualización parcial), si no se envía `educationArea` simplemente no se toca el valor existente — el sentinel `"N/A"` no se re-aplica en update.

### 8.2 Actualización parcial (`PUT`) en Positions y Vacancies

Los endpoints `PUT /api/positions/:id` y `PUT /api/vacancies/:id` son **parches reales**: solo los campos presentes en el body se modifican en base de datos; cualquier campo omitido conserva su valor actual. Para vaciar un array opcional (ej. `optionalTechnicalSkills`) o cambiar un valor, debe enviarse explícitamente en el body — omitirlo nunca lo borra.

### 8.3 Validación de pertenencia (multi-tenant)

Todas las relaciones entre entidades (`Position.departmentId`, `Vacancy.departmentId`/`positionId`) se validan contra `req.user.id` antes de escribir. Un usuario no puede crear una posición en un departamento de otro usuario, ni una vacante sobre una posición que no le pertenece — la API responde `404`/`400` según el caso, nunca permite la operación cruzada.

### 8.4 Manejo de errores estandarizado

- Errores de validación de payload (Zod) → siempre `400` con `details` por campo.
- Errores de Prisma no capturados explícitamente en el controlador (`PrismaClientValidationError`, `PrismaClientKnownRequestError`) → `400` con mensaje genérico `"Invalid data sent to the database"` (no se expone el detalle interno de Prisma).
- Cualquier otro error no controlado → `500`. En producción (`NODE_ENV=production`) el mensaje siempre es `"Internal server error"`, sin detalle interno; en desarrollo se muestra el mensaje real para debugging.
- El frontend **no debe** parsear el texto de `error` en un `500` para tomar decisiones de negocio — solo para logging.

### 8.5 `Application` — sin CRUD genérico, pero escrita/leída activamente desde 2026-07-13

~~`Application` está definida en `prisma/schema.prisma` (con `ApplicationStatus`) pero no tiene rutas ni controlador activos en la API actual.~~ **Parcialmente superado (2026-07-13):** `Application(candidateId, vacancyId)` ahora se escribe internamente desde `POST /api/vacancies/:id/upload` (vinculando un candidato reutilizado a una nueva vacante) y se lee desde `POST /api/vacancies/:id/evaluations` (para saber qué candidatos están pendientes en una vacante) — ver sección 4. `GET /api/vacancies/:id/results` expone `ApplicationStatus` en modo lectura, anidado como `candidate.applications[0].status` (ver sección 4).

**Actualizado 2026-07-23:** `PATCH /api/vacancies/:vacancyId/candidates/:candidateId/status` (sección 4) ahora permite que el frontend cambie el `ApplicationStatus` de un candidato para una vacante puntual directamente — es la vía de escritura referenciada en §8.6. Sigue sin existir un recurso genérico `/api/applications` (sin listar/crear/borrar registros `Application` por su propio id) — este endpoint está acotado a un candidato dentro de una vacante, no es un CRUD completo.

### 8.6 Cupos de la vacante y auto-cierre (agregado 2026-07-23)

Esta es una regla deliberadamente mínima, **no pensada para escalar a alta concurrencia**, agregada para cerrar el vacío donde una vacante nunca se cerraba sola al llenarse todos sus `availableSlots`:

- Solo se verifica contra `Vacancy.availableSlots` la transición de `Application.status` **hacia** `"SELECCIONADO"`. Cualquier otra transición (`PENDIENTE`/`EN_PROCESO`/`RECHAZADO`, o reconfirmar a un candidato ya `SELECCIONADO`) nunca toca el conteo de cupos.
- El chequeo cuenta los registros `Application` existentes con `status: "SELECCIONADO"` para esa vacante. Si el conteo ya es `>= availableSlots`, la solicitud se rechaza con `409` y **no se escribe nada** — el estado del candidato queda igual que antes de la llamada.
- Si aceptar a este candidato completa `availableSlots`, el `status` de la vacante se pone en `"CLOSED"` en la **misma transacción** que la actualización de `Application` (`prisma.$transaction`, con la fila de `Vacancy` bloqueada vía `SELECT ... FOR UPDATE` durante toda la operación, para que dos intentos de contratación casi simultáneos sobre la misma vacante no puedan pasar ambos el chequeo de cupos).
- **Mientras la vacante esté `CLOSED`, este endpoint rechaza *cualquier* cambio de estado de candidato con `409`** — no solo nuevas selecciones — hasta que la vacante se reactive.
- **Nunca se reabre automáticamente.** Sacar a un candidato de `SELECCIONADO` (liberando un cupo) no reabre una vacante `CLOSED`. Reabrir siempre es una acción manual y explícita: `PATCH /api/vacancies/:id/status` (`ACTIVE`) — este endpoint nunca escribe `Vacancy.status` de vuelta a `ACTIVE`.
- **Subir `availableSlots` tampoco reabre una vacante `CLOSED`.** `PUT /api/vacancies/:id` puede aumentar `availableSlots` (es un patch real, §8.2), pero si la vacante está `CLOSED` eso debe acompañarse de un `PATCH .../status` → `ACTIVE` manual para poder aceptar a alguien en los nuevos cupos.

---

## 9. Notas Técnicas / Inconsistencias Conocidas

Documentado para que el frontend sepa a qué atenerse hoy, no a un comportamiento "ideal":

1. **Doble envoltura en `sendResponseOr404`:** los endpoints que usan este helper para el caso de éxito devuelven `{ "response": { "success": true, "data": ... } }` (un nivel extra respecto al patrón `{ success, data }` usado en el resto de controladores). Afecta a: `GET /positions`, `GET /positions/:id`, `GET /candidates`, `GET /candidates/:id`, `GET /departments/*`, `PUT /departments/:id`, `DELETE /departments/:id`, `GET /vacancies`, `GET /vacancies/:id` (¹), `PATCH /vacancies/:id/status`, `PUT /vacancies/:id`, `GET /dashboard`.
   (¹) `GET /vacancies/:id` en realidad no usa el helper — responde `{ success, data }` directo. Verificar caso por caso en esta tabla.
2. ~~**`success: "false"` (string) en el caso 404 de `sendResponseOr404`**, en vez de `false` (booleano) como en el resto de la API.~~ **Corregido (2026-07-07):** `sendResponseOr404` ahora devuelve `success: false` como booleano también en el caso 404, consistente con el resto de la API. Un chequeo estricto (`response.success === false`) en frontend ya funciona correctamente para este caso.
3. **Errores de tipo de archivo/tamaño en Multer no tienen `statusCode` asignado** (`multerConfig.js` lanza un `Error` genérico), por lo que hoy caen al branch de `500` del manejador global en vez de `400`, en `POST /positions/complete` y `POST /vacancies/:id/upload`.
4. **`GET /api/admin/stats` es global** (todos los usuarios de la plataforma), mientras que `GET /api/dashboard` es por usuario — no confundir ambos como la misma fuente de verdad.
5. ~~Existe un middleware `identifyUserDemo` (`demoTrialMiddleware.js`) para limitar cuentas demo a 5 días, pero no está enlazado a ninguna ruta activa.~~ **Eliminado (2026-07-04, #138):** el middleware de límite de cuentas demo (`demoTrialMiddleware.js`) fue borrado del repositorio junto con `matchRepository.js` por tratarse de código muerto. Ya no existe ninguna referencia a cuentas demo en el backend (la variable de entorno `DEMO_USER` quedó también sin uso).
6. **`GET /api/dashboard` hardcodea en `vacancyStatusBreakdown` un status `"CONTACTING"` que no existe en `VacancyStatus`** (`ACTIVE | PAUSED | CLOSED`), y omite `PAUSED` por completo — ver detalle completo en la sección 7. No tratar este array como un desglose exhaustivo del status real de cada vacante hoy en día.
7. **Ningún endpoint de listado de esta API impone un tamaño máximo de página.** Los dos endpoints paginados (`GET /api/vacancies/:id/results`, `GET /api/admin/users`) no hacen ningún clamp sobre `limit` — un valor suficientemente grande devuelve toda la tabla en una sola respuesta. Los endpoints de listado sin paginar (`GET /api/departments`, `GET /api/positions`, `GET /api/vacancies`, `GET /api/candidates`) no tienen ningún límite de tamaño, por diseño. Ver sección 10 para el detalle completo endpoint por endpoint.
8. ~~`Candidate.hash` era único a nivel global (`@unique`) en vez de estar scoped por usuario, lo que causaba dos bugs distintos: (a) subir el mismo CV a una segunda vacante del mismo usuario reutilizaba silenciosamente el `Candidate` existente sin nunca vincularlo a la nueva vacante — la subida reportaba `success: true` pero el candidato jamás podía evaluarse para esa segunda vacante, y (b) dos usuarios distintos subiendo un PDF byte-idéntico hacían que la request del segundo usuario devolviera transparentemente los datos confidenciales del `Candidate` del primero (fuga entre tenants).~~ **Corregido (2026-07-13):** `Candidate.hash` ahora es único por `(userId, hash)`. Los candidatos reutilizados se vinculan a vacantes adicionales vía `Application` (ver sección 8.5), y dos usuarios distintos ya pueden tener cada uno su propio registro `Candidate` independiente para el mismo CV subyacente. `GET /api/vacancies` y `GET /api/vacancies/:id` todavía listan `candidates` según `Candidate.vacancyId` únicamente (la vacante de la subida *original*) — un candidato vinculado a una segunda vacante solo vía `Application` todavía no aparece en el array `candidates` de esa vacante, aunque ya sea evaluable ahí. Queda pendiente como follow-up, no corregido todavía.

---

## 10. Paginación y Tamaño de Listas — Referencia Rápida

Respuesta consolidada a "¿cuánto devuelve realmente cada `GET`?" — ver la sección de cada endpoint arriba para el detalle completo.

| Endpoint | Devuelve | ¿Paginado? | Tamaño de página default | Máximo impuesto |
| --- | --- | --- | --- | --- |
| `GET /api/departments` | TODOS los departamentos del usuario | No | — | — |
| `GET /api/positions` | TODAS las posiciones del usuario | No | — | — |
| `GET /api/positions/:id` | Un solo registro | N/A | — | — |
| `GET /api/vacancies` | TODAS las vacantes del usuario, cada una con su array **completo** de `candidates` y `position: { id, role }` incrustados | No | — | — |
| `GET /api/vacancies/:id` | Un solo registro | N/A | — | — |
| `GET /api/vacancies/:id/results` | `MatchResult[]` de una vacante | Sí (`page`/`limit`) | `page=1`, `limit=20` | **Ninguno** — `limit` no tiene clamp |
| `GET /api/candidates` | TODOS los candidatos del usuario (incl. `rawApiPayload`) | No | — | — |
| `GET /api/candidates/:id` | Un solo registro | N/A | — | — |
| `GET /api/admin/stats` | Un único objeto agregado, de toda la plataforma | N/A (no es lista) | — | — |
| `GET /api/admin/users` | `User[]`, de toda la plataforma | Sí (`page`/`limit`) | `page=1`, `limit=50` | **Ninguno** — `limit` no tiene clamp |
| `GET /api/dashboard` | `total` (objeto único) + `vacancyStatusBreakdown` (3 filas fijas) + `monthlyActivity` (1 fila por mes calendario con actividad, crece con la antigüedad de la cuenta) | No | — | — |

**Conclusión práctica para el frontend:** si una cuenta acumula muchas posiciones, vacantes o candidatos, las cuatro filas marcadas "No" arriba van a devolver el dataset completo en una sola respuesta, sin forma de pedir un recorte — hay que planificar el renderizado del lado del cliente (virtualización, secciones lazy) en función de esto, en vez de asumir que el backend siempre va a devolver una página chica. Para los dos endpoints paginados, tampoco conviene hardcodear el tamaño de página default como un techo fijo, ya que un caller (o un futuro bug) puede pedir un `limit` sin límite.

---

_Documento generado analizando `src/routes/`, `src/controllers/`, `src/validations/` y `prisma/schema.prisma` en su estado actual del branch de trabajo. No se modificó ningún archivo de código para esta documentación._
