# Reporte de Bugs del Backend — TalentMatch API

Generado: 2026-08-01
Fuente: análisis de sesión + `docs/en/api-documentation.md` §9

---

## Críticos (bloquean funcionalidad)

### BUG-001 · `DELETE /api/vacancies/:id` devuelve 400 — falta `parseInt`

**Síntoma:** Todo intento de eliminar una vacante falla con `400 "Invalid data sent to the database"`.
**Causa raíz:** `req.params.id` siempre es un `string` en Express. Si el controlador lo pasa directamente a Prisma sin `parseInt`, Prisma lanza `PrismaClientValidationError` (esperaba `Int`, recibió `String`), que el manejador global de errores convierte en 400.
**Corrección:**
```js
const id = parseInt(req.params.id, 10);
if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid id" });
await prisma.vacancy.delete({ where: { id } });
```
**Afecta:** `VacancyHistory.tsx` — el botón de eliminar siempre falla.

---

### BUG-002 · `PATCH /api/vacancies/:vacancyId/candidates/:candidateId/status` devuelve 404 para datos anteriores al 2026-07-13

**Síntoma:** Al cambiar el estado de un candidato se devuelve 404 y se muestra "Este candidato no tiene un registro activo para esta vacante."
**Causa raíz:** Las filas `Application(candidateId, vacancyId)` solo se introdujeron el 2026-07-13. Los candidatos subidos y evaluados antes de esa fecha tienen filas `MatchResult` pero no tienen fila `Application`. El endpoint PATCH (añadido el 2026-07-23) requiere que exista la fila `Application`.
**Corrección:** Migración de backfill:
```sql
INSERT INTO applications (candidateId, vacancyId, status)
SELECT DISTINCT mr.candidateId, mr.vacancyId, 'PENDIENTE'
FROM match_results mr
WHERE NOT EXISTS (
  SELECT 1 FROM applications a
  WHERE a.candidateId = mr.candidateId AND a.vacancyId = mr.vacancyId
);
```
**Afecta:** `AdvancedResults.tsx` y `Resultados.tsx` — el selector de estado y el botón de contratar devuelven 404 en datos antiguos.

---

## Altos (comportamiento incorrecto, sin crash)

### BUG-003 · `GET /api/vacancies` omite candidatos vinculados solo vía `Application`

**Síntoma:** Un candidato reutilizado en múltiples vacantes (vía dedup por hash) solo aparece en el array `candidates` de la vacante donde se subió originalmente. Para cualquier otra vacante a la que esté vinculado vía `Application`, no aparece en `vacancy.candidates` — aunque sea evaluable y aparezca en `GET /api/vacancies/:id/results`.
**Causa raíz:** `GET /api/vacancies` consulta `Candidate` por `Candidate.vacancyId` (la FK de la subida original), no por `Application.vacancyId`.
**Corrección:** Hacer el join a través de `Application` en lugar de `Candidate.vacancyId` al cargar `vacancy.candidates`.
**Seguimiento de la corrección del 2026-07-13.**

---

### BUG-004 · `vacancyStatusBreakdown` del Dashboard usa el estado inexistente `"CONTACTING"` en duro

**Síntoma:** `GET /api/dashboard` → `vacancyStatusBreakdown` siempre tiene una entrada `"CONTACTING"` con `count: 0, percentage: 0`. El estado `PAUSED` nunca aparece en el desglose aunque existan vacantes en ese estado.
**Causa raíz:** `dashboard.service.ts` define la línea base de forma hardcodeada como `["ACTIVE", "CLOSED", "CONTACTING"]`. `VacancyStatus` en el esquema de Prisma es `ACTIVE | PAUSED | CLOSED` — `CONTACTING` no existe.
**Corrección:** Cambiar la línea base hardcodeada a `["ACTIVE", "PAUSED", "CLOSED"]`.
**Afecta:** Cualquier widget del frontend que renderice este desglose (estadísticas del dashboard).

---

### BUG-005 · Los errores de validación de tipo/tamaño de archivo devuelven 500 en lugar de 400

**Síntoma:** Subir un archivo demasiado grande o que no sea PDF a `POST /api/positions/complete` o `POST /api/vacancies/:id/upload` devuelve 500 en lugar de 400.
**Causa raíz:** `multerConfig` lanza un `Error` genérico sin `statusCode` asignado. El manejador global lo captura en la rama de 500 en lugar de la de validación 400.
**Corrección:** Lanzar un error tipado con `statusCode: 400` desde `multerConfig`, o capturar `MulterError` explícitamente en el controlador y devolver 400.

---

### BUG-006 · `DELETE /api/admin/users/:id` — un usuario inexistente llega al manejador global con 500

**Síntoma:** Eliminar un usuario que no existe (ej. ya eliminado, UI obsoleta) lanza un error de Prisma no manejado en lugar de devolver un 404 limpio.
**Causa raíz:** `prisma.user.delete` sobre un registro inexistente lanza `PrismaClientKnownRequestError P2025`, que no se captura explícitamente en el controlador de admin — llega al manejador global.
**Corrección:** Capturar `P2025` explícitamente y devolver 404.

---

## Bajos (diseño / escalabilidad)

### BUG-007 · Sin paginación forzada en los endpoints de listado — tamaño de respuesta ilimitado

**Síntoma:** `GET /api/vacancies` devuelve todas las vacantes con su array `candidates` completo (incluido `rawApiPayload`) en una sola respuesta. Para usuarios con muchas vacantes y candidatos, esta respuesta crece sin límite.
**También afecta:** `GET /api/positions`, `GET /api/departments`, `GET /api/candidates` (todos sin paginación). Los dos endpoints paginados (`GET /api/vacancies/:id/results`, `GET /api/admin/users`) aceptan `limit` sin restricción — cualquier valor devuelve la tabla completa.
**Corrección:** Añadir `skip`/`take` con un máximo configurable (ej. 100) y hacer cumplir un tope en `limit` en los endpoints paginados.

---

### BUG-008 · `sendResponseOr404` envuelve las respuestas de éxito de forma inconsistente

**Síntoma:** Los endpoints que usan este helper devuelven `{ response: { success, data } }` en lugar de `{ success, data }`. El `apiClient` del frontend lo compensa, pero cualquier nuevo consumidor que llame a estos endpoints directamente recibirá un nivel de anidado inesperado adicional.
**Endpoints afectados:** `GET /positions`, `GET /positions/:id`, `GET /candidates`, `GET /candidates/:id`, `GET /departments/*`, `PUT /departments/:id`, `DELETE /departments/:id`, `GET /vacancies`, `PATCH /vacancies/:id/status`, `PUT /vacancies/:id`, `GET /dashboard`.
**Corrección:** Refactorizar `sendResponseOr404` para responder directamente con `{ success, data }` (misma forma que el resto de la API), o migrar los llamadores fuera de este helper.

---

## Corregidos (para referencia)

| ID | Issue | Corregido |
|----|-------|-----------|
| — | `success: "false"` (string) en el caso 404 de `sendResponseOr404` | 2026-07-07 |
| — | Middleware de demo trial con código muerto (`demoTrialMiddleware.js`) | 2026-07-04 |
| — | `Candidate.hash` globalmente único → fuga de CV entre tenants + reutilización entre vacantes rota | 2026-07-13 |
| — | `GET /vacancies` sin `position: { id, role }` en los datos de vacante anidados | 2026-07-13 |
| — | `POST /evaluations` obtenía candidatos de `Candidate.vacancyId` en lugar de `Application` | 2026-07-13 |
