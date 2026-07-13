# Estado actual — depuración de resultados de vacante (`fix/vacancy-results-ui`)

> Documento de estado, no un reporte de bug puntual. Resume qué se hizo, qué se arregló, y qué sigue pendiente antes de dar por cerrada esta rama. **Trabajo en progreso — todavía no está terminado.**

---

## Resumen

Esta rama partió de un rediseño de `src/pages/AdvancedResults.tsx` (pantalla de resultados de vacante) inspirado en un export de Figma, y durante las pruebas fueron apareciendo varios bugs reales de datos que se fueron arreglando uno por uno. Este documento deja constancia de en qué quedó cada cosa.

## Arreglado en el frontend (este sesión)

1. **Estado de candidato compartido entre todas las filas.** El selector "No Contratado/Contactado/Contratado" usaba `m.candidateId` como llave de un `Map`, pero ese campo nunca viene en la respuesta real de `GET /vacancies/:id/results` (solo viene anidado en `candidate.id`). Como `m.candidateId` era `undefined` en todas las filas, cambiar el estado de un candidato cambiaba el de todos. Se cambió la llave a `m.id` (el id propio del `MatchResult`, garantizado único). `MatchResult.candidateId` se marcó opcional en `api.types.ts` para reflejar la realidad del payload.
2. **Rediseño visual** siguiendo el mockup de Figma: overlay oscuro mientras se recalcula, avatares con paleta de colores rotativa, número de ranking por fila, badge de score sólido, botón para limpiar la búsqueda, checklist de progreso por archivo al subir CVs, scroll acotado en la lista de candidatos.
3. **Candidatos previamente subidos no aparecían / botón "Recalcular" bloqueado.** `loadData` solo llamaba a `getById`, que no trae `candidates` según la documentación (`GET /vacancies` sí lo trae, `GET /vacancies/:id` no). Se cambió para tomar la vacante de `vacanciesApi.getAll()` como fuente de los candidatos.
4. **Estado obsoleto al navegar entre vacantes.** `AdvancedResults` se reutiliza como la misma instancia de componente al cambiar de `/advanced-results/:id`, así que el estado de una vacante se quedaba pegado al entrar a otra (candidatos, búsqueda, estado de contratación, modal abierto). Se resetea todo explícitamente cuando cambia `id`.
5. **Mensaje de error de subida de CV mostraba siempre el mismo texto genérico.** El código priorizaba `r.message` (string fijo del backend) sobre `r.error` (el detalle real). Se invirtió la prioridad para mostrar `r.error` primero.

## Pendiente / responsabilidad del backend

Ver `REPORTE_BUG_BACKEND.md` para el detalle completo. En resumen:

- **Confirmado con evidencia real:** subir un CV cuyo hash ya existe (mismo archivo, ya asociado a otra vacante) responde `success: true`, pero el candidato devuelto sigue con el `vacancyId` de la vacante original — nunca queda asociado a la vacante nueva. El frontend lo muestra de forma optimista, pero desaparece al recargar y el botón "Recalcular" queda sin nada que evaluar. Es comportamiento del backend (deduplicación por hash), no un bug de frontend.
- **Todavía sin confirmar:** hay casos de subida que fallan con un mensaje genérico (`"Error processing file <nombre>"`) sin ningún detalle adicional en `error`. No se ha podido determinar si es Multer, `pdf-parse`, OpenAI o `assertCandidateIsCv` — falta que backend revise logs del servidor para esas requests puntuales.
- **Ya resuelto (confirmado por backend, fuera de este documento):** el campo `Posición` que aparecía como "—" — no requiere más seguimiento de frontend.

## Qué falta para cerrar esta rama

1. Backend debe revisar y responder los dos puntos de `REPORTE_BUG_BACKEND.md`.
2. Verificación manual en navegador de todos los flujos tocados (subida, recálculo, cambio de estado, navegación entre vacantes) — no se pudo automatizar en este entorno por falta de herramienta de navegador.
3. Decidir si el frontend necesita manejar explícitamente el caso "CV ya asociado a otra vacante" (hoy se ve como un falso éxito) una vez el backend confirme cómo quiere resolverlo.
