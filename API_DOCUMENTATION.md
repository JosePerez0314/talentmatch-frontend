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

### `POST /api/positions`

Crea una posición. Valida que `departmentId` exista y pertenezca al usuario.

| Campo (body)              | Tipo                      | Requerido   | Validación                                            |
| ------------------------- | ------------------------- | ----------- | ----------------------------------------------------- |
| `role`                    | `string`                  | Sí          | mínimo 5 caracteres                                   |
| `yearsOfExperience`       | `number`                  | Sí          | entero positivo (acepta coerción desde string)        |
| `technicalSkills`         | `string[]`                | Sí          | mínimo 1 elemento                                     |
| `optionalTechnicalSkills` | `string[]`                | No          | —                                                     |
| `softSkills`              | `string[]`                | Sí          | —                                                     |
| `languages`               | `string[]`                | No          | —                                                     |
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

Sin parámetros. Incluye `_count.candidates` y `candidates` completos.

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

`404` si no existe/no pertenece al usuario.

### `GET /api/vacancies/:id/results`

Resultados de matching (IA) paginados.

| Parámetro       | Tipo     | Requerido | Default |
| --------------- | -------- | --------- | ------- |
| `id` (path)     | `number` | Sí        | —       |
| `page` (query)  | `number` | No        | 1       |
| `limit` (query) | `number` | No        | 20      |

**Respuesta 200:** `{ success, data: MatchResult[], meta: { total, page, limit, totalPages } }`.

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
| Hash ya existe (CV duplicado) | `{ success: true, data: <candidato existente> }` |
| Otro error de procesamiento/IA | `{ success: false, message, error, stack }` |

**Errores globales:** `400` si no se envía ningún archivo · `404` vacante no existe/no pertenece al usuario (implícito por `id` inválido) · `500`.

### `POST /api/vacancies/:id/evaluations`

Ejecuta el motor de matching IA sobre todos los candidatos de la vacante que aún no tengan `MatchResult`. Sin body.

**Errores:** `404` vacante no encontrada o sin candidatos pendientes de evaluar (`400` si no hay candidatos) · `500`.

### `PATCH /api/vacancies/:id/status`

| Campo (body) | Tipo                     | Requerido |
| ------------ | ------------------------ | --------- |
| `status`     | `VacancyStatus` (string) | Sí        |

**Errores:** `400` status inválido/id inválido · `404` no existe/no pertenece al usuario · `500`.

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

### `GET /api/admin/users`

Lista paginada de todos los usuarios del sistema.

| Parámetro (query) | Tipo     | Requerido | Default |
| ----------------- | -------- | --------- | ------- |
| `page`            | `number` | No        | 1       |
| `limit`           | `number` | No        | 50      |

**Respuesta 200:** `{ success, data: { users: User[], meta: { totalCount, currentPage, totalPages } } }`.

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

### 8.5 Entidades del schema sin endpoint expuesto

`Application` está definida en `prisma/schema.prisma` (con `ApplicationStatus`) pero **no tiene rutas ni controlador activos** en la API actual — no debe asumirse ningún endpoint `/api/applications`.

---

## 9. Notas Técnicas / Inconsistencias Conocidas

Documentado para que el frontend sepa a qué atenerse hoy, no a un comportamiento "ideal":

1. **Doble envoltura en `sendResponseOr404`:** los endpoints que usan este helper para el caso de éxito devuelven `{ "response": { "success": true, "data": ... } }` (un nivel extra respecto al patrón `{ success, data }` usado en el resto de controladores). Afecta a: `GET /positions`, `GET /positions/:id`, `GET /candidates`, `GET /candidates/:id`, `GET /departments/*`, `PUT /departments/:id`, `DELETE /departments/:id`, `GET /vacancies`, `GET /vacancies/:id` (¹), `PATCH /vacancies/:id/status`, `PUT /vacancies/:id`, `GET /dashboard`.
   (¹) `GET /vacancies/:id` en realidad no usa el helper — responde `{ success, data }` directo. Verificar caso por caso en esta tabla.
2. **`success: "false"` (string) en el caso 404 de `sendResponseOr404`**, en vez de `false` (booleano) como en el resto de la API. Un chequeo estricto (`response.success === false`) en frontend fallaría ahí.
3. **Errores de tipo de archivo/tamaño en Multer no tienen `statusCode` asignado** (`multerConfig.js` lanza un `Error` genérico), por lo que hoy caen al branch de `500` del manejador global en vez de `400`, en `POST /positions/complete` y `POST /vacancies/:id/upload`.
4. **`GET /api/admin/stats` es global** (todos los usuarios de la plataforma), mientras que `GET /api/dashboard` es por usuario — no confundir ambos como la misma fuente de verdad.
5. Existe un middleware `identifyUserDemo` (`demoTrialMiddleware.js`) para limitar cuentas demo a 5 días, pero **no está enlazado a ninguna ruta activa** actualmente — es código presente pero no ejecutado.

---

_Documento generado analizando `src/routes/`, `src/controllers/`, `src/validations/` y `prisma/schema.prisma` en su estado actual del branch de trabajo. No se modificó ningún archivo de código para esta documentación._
