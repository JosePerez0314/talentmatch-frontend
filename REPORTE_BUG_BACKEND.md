# Reporte de bug para revisión en el backend (`talentmatch-backend`)

> Generado desde el frontend (`talentmatch-frontend`, rama `fix/vacancy-results-ui`) tras depurar la pantalla de resultados de vacante (`AdvancedResults.tsx`). No se puede resolver del lado del frontend — requiere revisar código/logs del backend.

---

## La subida de CV falla y el candidato nunca se persiste/asocia a la vacante

### Qué pasó

Al subir un CV a una vacante desde `POST /api/vacancies/:id/upload`, el archivo fue rechazado. La respuesta HTTP fue `200 OK` (`success: true` a nivel de request), pero dentro del array `data` ese archivo vino marcado como fallido, con un mensaje genérico sin ningún detalle de la causa real:

```json
{
  "success": true,
  "data": [
    {
      "success": false,
      "message": "Error processing file CV___Harvard_like (1).pdf"
    }
  ]
}
```

Esto se reprodujo **dos veces, con dos archivos y dos vacantes distintas**, por lo que no es un caso aislado de un PDF puntual.

### Consecuencia confirmada

Como la subida falla, el candidato **nunca se crea ni se asocia a la vacante** en la base de datos:

1. El frontend mostraba el candidato de forma optimista en "Candidatos de esta Vacante" (estado en memoria de React durante la sesión).
2. Al recargar la página (pidiendo todo de cero al backend vía `GET /vacancies`), el candidato **desaparecía** — el array `candidates` de esa vacante en la respuesta solo traía el candidato que ya existía antes, nunca el nuevo.
3. Al intentar `POST /api/vacancies/:id/evaluations`, el backend respondía correctamente `400 "No candidates to evaluate"` — porque, en efecto, no había ningún candidato nuevo pendiente: la subida nunca llegó a persistirse.

Es decir, el frontend está reflejando fielmente el estado real del backend una vez se refresca; el problema de raíz es que la subida del CV falla silenciosamente sin persistir nada.

### Problema

El mensaje de error no trae ningún detalle sobre la causa real del fallo (no hay `error`, stack, código, ni motivo específico) — solo repite el nombre del archivo. Esto impide diagnosticar si el problema es:

- Un error de **Multer** (tamaño de archivo o `mimetype` rechazado por el `fileFilter`).
- Un fallo de **`pdf-parse`** al extraer texto (por ejemplo, si el PDF es una plantilla exportada como imagen escaneada, sin capa de texto).
- Un fallo de la llamada a **OpenAI** (Prompt 1 — extractor) para ese archivo puntual (rate limit, timeout, respuesta inválida).
- El resultado esperado de `assertCandidateIsCv` (rechazo por "no parece un CV"), pero con un mensaje mal etiquetado.

### Qué revisar en el backend

1. **Buscar el string literal `"Error processing file"`** en el código (probablemente dentro de un `catch` genérico en el loop `for (const cv of cvs) { ... }` del pipeline de subida). Confirmar si ese `catch` hace `console.error(err)` con el error original — de ser así, revisar los logs del servidor para esas requests y obtener el mensaje real.
2. **Issue ya documentado en `api-documentation.md §9.3`:**
   > *"File type/size errors in Multer have no `statusCode` assigned (`multerConfig` throws a generic `Error`), so today they fall into the global handler's `500` branch instead of `400`, in `POST /positions/complete` and `POST /vacancies/:id/upload`."*

   Es el candidato más probable dado que se repite con distintos archivos. Verificar:
   - El tamaño real de los archivos que fallaron contra el límite configurado en `multerConfig`.
   - El `mimetype` con el que el navegador envía el archivo (a veces no es exactamente `application/pdf` aunque la extensión lo sea).
3. Si Multer no es la causa, revisar si `pdf-parse` lanza excepción o devuelve texto vacío para esos archivos específicos.
4. Como última opción, revisar logs de la llamada a OpenAI para esas requests.
5. Confirmar que, cuando la subida falla, no quede ningún registro parcial/huérfano en la base de datos (ej. un `Candidate` creado sin `MatchResult` ni asociación completa a la vacante).

### Comportamiento esperado

Que el `UploadResult` fallido incluya un campo `error`/`message` con el motivo real y accionable (p. ej. `"El archivo excede el tamaño máximo permitido (10MB)"` o `"No se pudo extraer texto del PDF"`), en vez de un mensaje genérico que solo repite el nombre del archivo. El frontend ya muestra ese mensaje tal cual venga del backend (`r.message ?? r.error`), así que basta con enriquecerlo del lado del backend.

---

## Nota para quien retome esto

El frontend seguirá funcionando con los datos que el backend efectivamente envíe — no hay ningún workaround adicional planeado del lado del frontend hasta tener confirmación de la causa real del fallo de procesamiento.
