# Issue Plan — Position History (`src/pages/PositionHistory.tsx`)

## Screen overview

Shows every position in the system in a table with department filter tabs. Supports deleting and duplicating positions. The table is a separate component (`PositionHistoryTable`) that delegates the action menu to `ActionDropdown`.

---

## Data architecture

| Element | Source |
|---|---|
| Position list | `positionService.getAll()` → `Position[]` |
| Department tabs | Derived from `positions` with `Array.from(new Set(...))` |
| Delete position | `positionService.delete(id)` → optimistic UI (filters the local array) |
| Duplicate position | `positionService.duplicate(id)` → full re-fetch (`fetchPositions()`) |

**State flow:**
1. A `useEffect` calls `fetchPositions()` on mount.
2. On load, it extracts unique departments to build the tabs.
3. The active tab filters `positions` into `filteredPositions` (synchronous derived value, not `useMemo`).
4. Delete: optimistic — removes from the local array without a re-fetch.
5. Duplicate: non-optimistic — calls `fetchPositions()` to guarantee consistency.

**Component tree:**
```
PositionHistory
  └── PositionHistoryTable
        └── ActionDropdown (per-row kebab menu)
```

---

## Identified issues

### Critical bug — Kebab menu clipped by `overflow-hidden`

**Symptom:** Clicking the 3 dots on the last positions in the list renders the action dropdown clipped or invisible.

**Root cause:**
- The white container `div.bg-white.rounded-2xl.shadow-sm.overflow-hidden` in `PositionHistory.tsx` (line 134) has `overflow-hidden` so the rounded corners work.
- `PositionHistoryTable` renders a `<table>` with `<tr>` rows.
- `ActionDropdown` (in `src/components/Sections/ActionDropdown.tsx`) uses `position: absolute; right: 0; mt-2` relative to its `div.relative` container.
- The dropdown positions itself relative to the `<td>`, but the ancestor's `overflow-hidden` clips it once it exceeds the card's bottom edge.

**Possible solutions:**
1. **`position: fixed` on the dropdown:** Compute the button's coordinates (`getBoundingClientRect`) and position the dropdown with `fixed` to escape the container's stacking context. More complex to maintain.
2. **Dynamic direction (flip upward):** For the last N rows, open the dropdown upward (`bottom-full mb-2`) instead of downward. Requires knowing the row index or using `IntersectionObserver`.
3. **Remove `overflow-hidden` from the container:** Use `overflow-visible` and apply the border-radius with a pseudo-element or `clip-path`. Affects the card's visual style.
4. **React portal:** Render the dropdown outside the card's DOM tree via `ReactDOM.createPortal`. The cleanest long-term solution.

**Recommendation:** Option 2 (flip upward) is the simplest without refactoring the dropdown system. Option 4 is the most architecturally correct.

### UI — Margin review

1. **Header:** `mb-5` between the header and content. Verify against Figma if this is correct (other screens use `mb-5` or `mb-6` inconsistently).
2. **Empty state:** `p-20` on the empty-state card and `p-10` on the loader. Confirm vertical padding against Figma.
3. **Tabs:** `px-4 py-3.5` per tab — verify the active indicator (`border-b-2`) isn't clipped by `overflow-x-auto`.

### Responsive design

- Horizontally overflowing tabs (`overflow-x-auto`) — verify it's obvious on mobile that there are more tabs.
- The table doesn't hide any columns on mobile (unlike VacancyHistory, which hides "Position" at `sm`). Review whether the "Department" column is legible at 375px.
- The "New Position" header button may look cramped next to the title on mobile if the position name is long.

---

## Tests to perform

### Loading and states

- [ ] **Loading spinner:** Animated `Loader2` in the white card while loading.
- [ ] **Network error:** Simulate a failure → red banner "No se pudieron cargar las posiciones desde el servidor."
- [ ] **Empty state:** No positions → card with the `Briefcase` icon, message, and "Crear Posición" button.
- [ ] **With data:** The table shows every position with name, department, and date.

### Department tabs

- [ ] The "Todos" tab shows the total position count.
- [ ] Each department tab shows only that department's positions.
- [ ] The count badge on each tab is correct.
- [ ] Switching to an empty tab shows "Sin posiciones en este departamento".
- [ ] Tabs scroll horizontally if there are many departments.

### Per-position actions

- [ ] **Delete:** Clicking delete → the position disappears from the list immediately (optimistic). The tab counter updates.
- [ ] **Delete with error:** Simulate a failure → the error banner shows and the position doesn't disappear.
- [ ] **Duplicate:** Clicking duplicate → a re-fetch happens and the duplicated position appears in the list.
- [ ] **Duplicate with error:** Simulate a failure → the error banner shows.
- [ ] Clicking "New Position" navigates to `/position`.

### Kebab overflow bug

- [ ] **Reproduce the bug:** With at least 6+ positions, scroll to the end and click the 3 dots on the last position → verify whether the dropdown shows fully.
- [ ] **Verify the fix:** After applying the fix (flip upward or portal), the last row's dropdown must be fully visible.
- [ ] **Verify no regression:** The first row's dropdown (opening downward) still works.

### Responsive

- [ ] **375px mobile:** The table is legible, no horizontal scroll within each cell.
- [ ] **768px tablet:** Tabs and table work correctly.
- [ ] **1280px desktop:** Centered `max-w-4xl`, no distortion.
- [ ] "New Position" button in the header looks correct at every viewport.
