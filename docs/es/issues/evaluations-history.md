# Issue Plan — Evaluaciones (`src/pages/EvaluationsHistory.tsx`)

## Descripción general de la pantalla

La pantalla de Evaluaciones permite al usuario seleccionar una vacante activa y calcular el ranking de candidatos por IA (MatchScore). La pantalla opera como una máquina de estados con 4 fases: **idle** (selección de vacante), **calculating** (spinner de cálculo), **done** (resultados en cards) y **empty** (sin candidatos con suficientes datos). También permite recalcular y compartir los resultados como imagen.

---

## Arquitectura de datos

| Elemento | Fuente |
|---|---|
| Vacantes activas | `vacanciesApi.getAll()` → filtra `status === "ACTIVE"` con `useMemo` |
| Departamentos (para mostrar en resultados) | `departmentsApi.getAll()` → mapa id→name con `useMemo` |
| Evaluación/cálculo | `vacanciesApi.evaluateCandidates(vacancyId)` → `POST /vacancies/:id/evaluate` |
| Resultados top 10 | `vacanciesApi.getResults(vacancyId, 1, 10)` → `MatchResult[]` |
| Compartir como imagen | `html-to-image` → `toPng` → `navigator.clipboard.write` |

**Flujo de estado (máquina de estados `evalState`):**
1. **idle:** Carga vacantes + departamentos en paralelo. Muestra cards de vacante con botón "Calcular".
2. Al hacer clic en "Calcular": `evalState = "calculating"` → spinner oscuro centrado.
3. `runEvaluation`: llama `POST /evaluate` (ignora 400 — ya calculado), luego `GET /results`.
4. Con resultados: `evalState = "done"` → grilla de cards con CircleScore.
5. Sin resultados: `evalState = "empty"` → card de aviso.
6. **Recalcular:** No cambia `evalState` (permanece en "done"), activa `isRecalculating` → overlay oscuro sobre los resultados.
7. **Volver:** `handleBack()` resetea todo a estado inicial ("idle").

**Limpieza de efecto:** El `useEffect` inicial usa flag `cancelled` para evitar actualizaciones de estado en componente desmontado.

---

## Issues identificados

### UI — Márgenes y padding inconsistentes

1. **Wrapper de `idle` y `done`:** Usa `min-h-screen bg-[#f0f0f5] p-8` — hardcoded `p-8` sin responsivo y `min-h-screen` que añade altura extra innecesaria (el layout padre ya gestiona la altura). Las otras pantallas usan `p-4 md:p-8 max-w-*xl mx-auto`.

2. **Background duplicado:** `bg-[#f0f0f5]` está en el wrapper de cada estado (idle, calculating, done, empty). El layout padre `ProtectedRoute` ya tiene un fondo gris claro. Esto puede crear un bloque visual de color diferente. Verificar si el fondo es correcto contra Figma o si debe eliminarse y usar el del layout.

3. **`p-8` en mobile:** En el estado idle y done, el padding lateral de 32px en mobile (375px) solo deja ~311px de contenido. Las demás pantallas usan `p-4` en mobile.

4. **`max-w-3xl` en idle vs `max-w-5xl` en done:** El ancho máximo cambia entre estados. En idle el contenido está centrado en 768px, en done se expande a 1024px. Verificar si este cambio es intencional según el diseño de Figma.

5. **Estado `calculating`:** `p-8 w-full flex items-start pt-24` — el `pt-24` (96px de padding superior) puede dejar el spinner demasiado bajo en pantallas pequeñas.

6. **Action bar en `done`:** `border-b border-gray-200 pb-4 mb-6 flex-wrap bg-[#f0f0f5]` — el `bg-[#f0f0f5]` en la barra de acción puede verse mal si el scroll del usuario sube y la barra no queda sticky.

### UX — Estado de vacante en resultados

- En el estado `done`, el badge de estado siempre muestra "Activa" hardcodeado (`bg-green-100 text-green-700`). Si la vacante cambia de estado entre el cálculo y la visualización, el badge mostraría información incorrecta. No es crítico pero es una inconsistencia.

### Compartir imagen (Share)

- `navigator.clipboard.write` requiere que el contexto sea seguro (HTTPS) y que el usuario otorgue permiso. En `http://localhost:5000` puede fallar silenciosamente o mostrar el mensaje de error en el toast.
- El toast de éxito/error aparece en `fixed bottom-6 right-6` y desaparece tras 3.5 segundos. Verificar que sea legible en mobile.

### EvaluationCard (componente)

- `EvaluationCard` no está definido en este análisis pero es el componente que muestra cada vacante activa en el estado idle. Verificar que sus márgenes y botón "Calcular" sean consistentes con el resto de la UI.

### Responsive design

- El grid de resultados: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` — en 375px una sola columna, cada card ocupa el ancho completo. Verificar que el CircleScore (`w-20 h-20`) no quede demasiado pequeño.
- El status dropdown en las cards de candidato abre hacia **arriba** (`bottom-full mb-1`) — correcto para evitar recorte en la parte inferior del viewport. Verificar en la primera card (parte superior) que no quede fuera de pantalla hacia arriba.
- El botón "Compartir" oculta el texto en mobile (`<span className="hidden sm:inline">`), solo muestra el ícono. Verificar que sea reconocible.

---

## Tests a realizar

### Estado idle — Selección de vacante

- [ ] **Carga inicial:** Spinner o texto "Cargando vacantes..." mientras se resuelven las peticiones.
- [ ] **Error de carga:** Simular fallo → mensaje "No pudimos cargar las vacantes."
- [ ] **Sin vacantes activas:** `activeVacancies.length === 0` → empty state con ícono `FileSearch` y CTA "Nueva Vacante".
- [ ] **Con vacantes activas:** Se muestran las cards de `EvaluationCard` con el botón "Calcular".
- [ ] El conteo de candidatos en la card coincide con `v._count?.candidates`.
- [ ] El código de vacante se formatea como `Vac-001`.

### Flujo de cálculo

- [ ] Clic en "Calcular" → spinner oscuro con `evalState = "calculating"`.
- [ ] Si el backend devuelve 400 (ya calculado): se ignora el error y se consultan los resultados de todas formas.
- [ ] Con resultados: `evalState = "done"` → grilla de cards de candidatos.
- [ ] Sin resultados: `evalState = "empty"` → card "Sin resultados".
- [ ] Error crítico (non-400): `evalState = "idle"` → mensaje de error en el banner amarillo.

### Estado done — Resultados

- [ ] Las cards de candidatos muestran: iniciales avatar, nombre, email, `CircleScore`, niche tag, status dropdown, botón "Ver perfil".
- [ ] `CircleScore` muestra el porcentaje correcto y el color adecuado: verde (≥80%), amarillo (≥50%), rojo (<50%).
- [ ] El badge de posición (#1, #2...) es correcto.
- [ ] El dropdown de status tiene 3 opciones: "No Contratado", "Contactado", "Contratado".
- [ ] Cambiar el status en el dropdown se refleja inmediatamente en la card (estado local, sin API call).
- [ ] El dropdown se abre hacia arriba (`bottom-full`). Verificar que no quede fuera del viewport en la primera card.
- [ ] Clic en "Ver perfil" → abre `CandidateDetailsModal` con los datos del candidato.
- [ ] El modal se cierra con el botón de cerrar.

### Recalcular

- [ ] Clic en "Recalcular MatchScore" → overlay oscuro con spinner sobre los resultados (`isRecalculating = true`).
- [ ] Al terminar, los resultados se actualizan y el overlay desaparece.
- [ ] El botón "Recalcular" muestra spinner y texto "Calculando…" durante el proceso.
- [ ] Si falla el recálculo: el overlay desaparece pero los resultados anteriores se conservan.

### Compartir imagen

- [ ] Clic en "Compartir" → botón muestra "Capturando…".
- [ ] Si el permiso es otorgado: toast "¡Imagen copiada al portapapeles!" → desaparece a los 3.5s.
- [ ] Si el permiso es denegado: toast de error → desaparece a los 3.5s.
- [ ] La imagen capturada incluye las cards de candidatos completas.

### Navegación

- [ ] "Volver al historial" en estado `done` y `empty` resetea a idle correctamente (limpia resultados, vacante seleccionada y estados UI).

### Responsive

- [ ] **375px mobile:** 1 columna en el grid de resultados. CircleScore legible. Sin overflow horizontal.
- [ ] **768px tablet:** 2 columnas. El action bar en el estado `done` no se desborda con `flex-wrap`.
- [ ] **1024px desktop:** 3 columnas. `max-w-5xl` centrado.
- [ ] **1440px+ (xl):** 4 columnas.
- [ ] El estado `calculating`: el spinner oscuro centrado se ve bien en todos los viewports. El `pt-24` no deja el spinner invisible en pantallas pequeñas.
- [ ] El `p-8` hardcoded vs `p-4 md:p-8` del estándar — verificar visualmente que el contenido no toque los bordes en mobile.
