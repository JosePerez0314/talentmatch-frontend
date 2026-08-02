# Issue Plan — Vacancy History (`src/pages/VacancyHistory.tsx`)

## Screen overview

Shows all vacancies in a table with edit, status-change (Active/Paused/Closed), and delete actions. The status change uses a confirmation modal (`VacancyActionModal`). Each row can navigate to that vacancy's results.

---

## Data architecture

| Element | Source |
|---|---|
| Vacancy list | `vacanciesApi.getAll()` → `Vacancy[]` (reversed with `.reverse()`) |
| Status change | `vacanciesApi.updateStatus(id, status)` → optimistic UI (updates the local array) |
| Delete vacancy | `vacanciesApi.delete(id)` → optimistic UI (filters the local array) |
| View results | `navigate(\`/advanced-results/${id}\`)` + saves to `localStorage` |

**State flow:**
1. A `useEffect` calls `fetchVacancies()` on mount.
2. The array is reversed (`.reverse()`) to show the most recent first.
3. The per-row kebab menu is tracked with `openMenuId: number | null` — only one open at a time.
4. Clicking anywhere on the wrapper `onClick={closeMenu}` closes the active menu.
5. Status change: opens `VacancyActionModal` → on confirm calls `updateStatus` → updates local state with `map`.
6. Delete: native `window.confirm()` → on confirm calls `delete` → filters the local array.

---

## Identified issues

### Backend bug — `DELETE /api/vacancies/:id` always returns 400

**Note:** Every vacancy delete attempt fails with `400 "Invalid data sent to the database"`. This is a **backend bug** (BUG-001 in `docs/backend-bugs.md`), not a frontend issue. Root cause: `req.params.id` is passed directly to Prisma without `parseInt`, causing `PrismaClientValidationError`. The frontend correctly calls `vacanciesApi.delete(id)` — the fix belongs on the backend.

### Critical bug — Kebab menu clipped by `overflow-x-auto`

**Symptom:** Clicking the 3-dot icon on the last rows of the table renders the action dropdown clipped or invisible.

**Root cause:**
- The dropdown renders with `position: absolute; right: 4; top: 12` inside the "Actions" column's `<td>`.
- The outer container has `overflow-x-auto` (`div.overflow-x-auto`), which clips vertical overflow once the dropdown exceeds the table's height.
- Additionally, the outer card `div.bg-white.rounded-2xl.shadow-sm.overflow-hidden` also limits overflow.

**Possible solutions (same as PositionHistory):**
1. **Flip upward:** For rows near the bottom of the list, open the dropdown upward (`bottom-full mb-2`). Requires detecting the row's relative position.
2. **`position: fixed`:** Use `getBoundingClientRect` on the button to position the dropdown outside the container's stacking context. More robust.
3. **React portal:** Mount the dropdown outside the table's DOM tree via `ReactDOM.createPortal`. The cleanest solution.

**Difference from PositionHistory:** The dropdown here has 5 options (edit, delete, mark active, pause, close), so it's taller (~180px) and the clipping is more pronounced.

### UI — Margin and style review

1. **Status badges:** Use `style={getStatusStyle(vac.status)}` (inline style with colors `#447ECA`, `#F8C807`, `#EF5050`) instead of Tailwind classes. Inconsistent with the rest of the app where badges use classes — but intentional, for the exact brand colors.
2. **"Position" column:** `hidden sm:table-cell` — hidden on mobile. Verify whether the remaining columns' layout is informative enough at 375px.
3. **Header spacing:** `mb-5` between the header and the card. Consistent with other history screens.
4. **Empty-state padding:** `p-20` — review against Figma.

### UX — `window.confirm()` for deletion

Delete confirmation uses the native `window.confirm()` instead of the app's modal pattern (`VacancyActionModal`). This is inconsistent, and in some browsers/contexts the native dialog looks different from the rest of the UI.

**Proposed solution:** Reuse the `VacancyActionModal` pattern, or create a generic `DeleteConfirmModal` similar to the existing `DeleteDepartmentModal`.

### Responsive design

- Table with `overflow-x-auto` — columns compress on mobile. Verify the "ID", "Title", and "Status" columns are legible at 375px.
- The "Results" button (`<Eye> Resultados`) takes up its own column — on mobile it can compress other columns.
- The "New Vacancy" header button: verify at 375px it doesn't overlap the title.

---

## Tests to perform

### Loading and states

- [ ] **Loading spinner:** Centered `Loader2` while `getAll()` resolves.
- [ ] **Network error:** Simulate a failure → red banner "No se pudieron cargar las vacantes."
- [ ] **Empty state:** No vacancies → card with the `ClipboardList` icon, message, and "Create Vacancy" button.
- [ ] **With data:** The table shows vacancies in reverse order (most recent first).

### Vacancy table

- [ ] The ID formats as `Vac-001`, `Vac-002`, etc.
- [ ] The start date formats correctly as `DD/MM/YYYY`.
- [ ] Status badges show the correct color: blue (Active), yellow (Paused), red (Closed).
- [ ] The "Position" column is hidden below the `sm` breakpoint.

### Kebab menu actions

- [ ] Clicking the `MoreVertical` icon opens that row's dropdown.
- [ ] Opening another row's dropdown closes the previous one.
- [ ] Clicking anywhere outside the dropdown (the component's wrapper) closes it.
- [ ] **Edit vacancy:** Click → navigates to `/vacancy/edit/{id}`.
- [ ] **Delete vacancy:** `window.confirm()` appears → confirm → the vacancy disappears. Cancel → nothing happens.
- [ ] **Mark as Active:** Opens `VacancyActionModal` with the right action. Confirm → `updateStatus` called → badge turns blue.
- [ ] **Pause vacancy:** Same logic → badge turns yellow.
- [ ] **Close vacancy:** Same logic → badge turns red.
- [ ] Already-selected options are `disabled` in the menu (e.g. if already "Active", "Mark as Active" is disabled).

### Kebab overflow bug

- [ ] **Reproduce the bug:** With 6+ vacancies, click the 3 dots on the last row → the dropdown should be fully visible.
- [ ] **Verify the fix:** The full dropdown (5 options) is visible with no scrolling or clipping.
- [ ] **No regression:** The first row's dropdown still opens downward correctly.

### Navigation to results

- [ ] Clicking "Resultados" → `localStorage.setItem("lastVacancyId", id)` → navigates to `/advanced-results/{id}`.

### Responsive

- [ ] **375px mobile:** The table shows ID, Title, Date, Status, View, and Actions. No critically clipped text.
- [ ] **768px tablet:** The "Position" column appears.
- [ ] **1280px desktop:** Centered `max-w-5xl`, correct table proportions.
- [ ] No unnecessary horizontal scroll on desktop.
