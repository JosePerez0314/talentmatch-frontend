# Issue Plan — Evaluations (`src/pages/EvaluationsHistory.tsx`)

## Screen overview

The Evaluations screen lets the user pick an active vacancy and compute the AI candidate ranking (MatchScore). The screen operates as a state machine with 4 phases: **idle** (vacancy selection), **calculating** (computation spinner), **done** (results as cards), and **empty** (no candidates with enough data). It also supports recalculating and sharing the results as an image.

---

## Data architecture

| Element | Source |
|---|---|
| Active vacancies | `vacanciesApi.getAll()` → filtered to `status === "ACTIVE"` with `useMemo` |
| Departments (shown in results) | `departmentsApi.getAll()` → id→name map with `useMemo` |
| Evaluate/compute | `vacanciesApi.evaluateCandidates(vacancyId)` → `POST /vacancies/:id/evaluate` |
| Top-10 results | `vacanciesApi.getResults(vacancyId, 1, 10)` → `MatchResult[]` |
| Share as image | `html-to-image` → `toPng` → `navigator.clipboard.write` |

**State flow (`evalState` state machine):**
1. **idle:** Loads vacancies + departments in parallel. Shows vacancy cards with a "Calcular" button.
2. Clicking "Calcular": `evalState = "calculating"` → centered dark spinner.
3. `runEvaluation`: calls `POST /evaluate` (ignores a 400 — already computed), then `GET /results`.
4. With results: `evalState = "done"` → results grid with a CircleScore.
5. Without results: `evalState = "empty"` → warning card.
6. **Recalculate:** doesn't change `evalState` (stays "done"), activates `isRecalculating` → dark overlay over the results.
7. **Back:** `handleBack()` resets everything to the initial ("idle") state.

**Effect cleanup:** The initial `useEffect` uses a `cancelled` flag to avoid state updates on an unmounted component.

---

## Identified issues

### UI — Inconsistent margins and padding

1. **`idle` and `done` wrapper:** Uses `min-h-screen bg-[#f0f0f5] p-8` — a hardcoded, non-responsive `p-8` and a `min-h-screen` that adds unnecessary extra height (the parent layout already manages height). Other screens use `p-4 md:p-8 max-w-*xl mx-auto`.

2. **Duplicated background:** `bg-[#f0f0f5]` is set in every state's wrapper (idle, calculating, done, empty). The parent layout `ProtectedRoute` already has a light-gray background. This can create a visually different color block. Verify against Figma whether the background is correct or should be removed in favor of the layout's.

3. **`p-8` on mobile:** In the idle and done states, 32px of lateral padding on mobile (375px) leaves only ~311px of content. Other screens use `p-4` on mobile.

4. **`max-w-3xl` in idle vs. `max-w-5xl` in done:** The max width changes between states. In idle content is centered at 768px, in done it expands to 1024px. Verify whether this change is intentional per the Figma design.

5. **`calculating` state:** `p-8 w-full flex items-start pt-24` — the `pt-24` (96px top padding) can leave the spinner too low on small screens.

6. **Action bar in `done`:** `border-b border-gray-200 pb-4 mb-6 flex-wrap bg-[#f0f0f5]` — the `bg-[#f0f0f5]` on the action bar can look off if the user scrolls and the bar isn't sticky.

### UX — Vacancy status in results

- In the `done` state, the status badge always shows a hardcoded "Activa" (`bg-green-100 text-green-700`). If the vacancy's status changes between computation and viewing, the badge would show stale info. Not critical, but an inconsistency.

### Share as image

- `navigator.clipboard.write` requires a secure context (HTTPS) and user permission. On `http://localhost:5000` it may fail silently or show the error message in the toast.
- The success/error toast appears at `fixed bottom-6 right-6` and disappears after 3.5 seconds. Verify it's legible on mobile.

### EvaluationCard (component)

- `EvaluationCard` isn't covered in this analysis but is the component showing each active vacancy in the idle state. Verify its margins and "Calcular" button are consistent with the rest of the UI.

### Responsive design

- Results grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` — at 375px, a single column, each card takes full width. Verify the CircleScore (`w-20 h-20`) isn't too small.
- The candidate cards' status dropdown opens **upward** (`bottom-full mb-1`) — correct to avoid clipping at the bottom of the viewport. Verify on the first card (top of the page) that it doesn't go off-screen upward.
- The "Compartir" button hides its text on mobile (`<span className="hidden sm:inline">`), showing only the icon. Verify it's still recognizable.

---

## Tests to perform

### Idle state — Vacancy selection

- [ ] **Initial load:** Spinner or "Cargando vacantes..." text while requests resolve.
- [ ] **Load error:** Simulate a failure → "No pudimos cargar las vacantes." message.
- [ ] **No active vacancies:** `activeVacancies.length === 0` → empty state with the `FileSearch` icon and "Nueva Vacante" CTA.
- [ ] **With active vacancies:** `EvaluationCard` cards show with the "Calcular" button.
- [ ] The candidate count on the card matches `v._count?.candidates`.
- [ ] The vacancy code formats as `Vac-001`.

### Calculation flow

- [ ] Clicking "Calcular" → dark spinner with `evalState = "calculating"`.
- [ ] If the backend returns a 400 (already computed): the error is ignored and results are fetched anyway.
- [ ] With results: `evalState = "done"` → candidate results grid.
- [ ] Without results: `evalState = "empty"` → "Sin resultados" card.
- [ ] Critical error (non-400): `evalState = "idle"` → error message in the yellow banner.

### Done state — Results

- [ ] Candidate cards show: avatar initials, name, email, `CircleScore`, niche tag, status dropdown, "Ver perfil" button.
- [ ] `CircleScore` shows the correct percentage and color: green (≥80%), yellow (≥50%), red (<50%).
- [ ] The position badge (#1, #2...) is correct.
- [ ] The status dropdown has 3 options: "No Contratado", "Contactado", "Contratado".
- [ ] Changing the status in the dropdown reflects immediately in the card (local state, no API call).
- [ ] The dropdown opens upward (`bottom-full`). Verify it doesn't go off-screen on the first card.
- [ ] Clicking "Ver perfil" → opens `CandidateDetailsModal` with the candidate's data.
- [ ] The modal closes with the close button.

### Recalculate

- [ ] Clicking "Recalcular MatchScore" → dark overlay with a spinner over the results (`isRecalculating = true`).
- [ ] On completion, results update and the overlay disappears.
- [ ] The "Recalcular" button shows a spinner and "Calculando…" text during the process.
- [ ] If the recalculation fails: the overlay disappears but the previous results are kept.

### Share as image

- [ ] Clicking "Compartir" → the button shows "Capturando…".
- [ ] If permission is granted: "¡Imagen copiada al portapapeles!" toast → disappears after 3.5s.
- [ ] If permission is denied: error toast → disappears after 3.5s.
- [ ] The captured image includes the full candidate cards.

### Navigation

- [ ] "Volver al historial" in the `done` and `empty` states correctly resets to idle (clears results, selected vacancy, and UI states).

### Responsive

- [ ] **375px mobile:** 1 column in the results grid. CircleScore legible. No horizontal overflow.
- [ ] **768px tablet:** 2 columns. The `done` state's action bar doesn't overflow with `flex-wrap`.
- [ ] **1024px desktop:** 3 columns. Centered `max-w-5xl`.
- [ ] **1440px+ (xl):** 4 columns.
- [ ] The `calculating` state: the centered dark spinner looks good at every viewport. The `pt-24` doesn't leave the spinner invisible on small screens.
- [ ] The hardcoded `p-8` vs. the standard `p-4 md:p-8` — visually verify content doesn't touch the edges on mobile.
