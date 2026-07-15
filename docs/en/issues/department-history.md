# Issue Plan — Department History (`src/pages/DepartmentHistory.tsx`)

## Screen overview

Shows every department in the system as a card-style list. Each row can edit its name (modal) or delete the department (confirmation modal). The action menu is triggered by a 3-dot icon that appears on row hover.

---

## Data architecture

| Element | Source |
|---|---|
| Department list | `departmentsApi.getAll()` → `Department[]` |
| Edit name | `departmentsApi.update(id, { name })` → updates the local array with `map` |
| Delete department | `departmentsApi.delete(id)` → filters the local array |

**State flow:**
1. A `useEffect` calls `fetchDepartments()` on mount.
2. The kebab menu uses `openMenuId: string | null` — only one open at a time.
3. The wrapper has `onClick={closeMenu}` to close the menu on outside click.
4. Edit: opens `EditDepartmentModal` → on save calls `update` → updates `departments` locally.
5. Delete: opens `DeleteDepartmentModal` → on confirm calls `delete` → filters `departments` locally.

**Component tree:**
```
DepartmentHistory
  ├── EditDepartmentModal
  └── DeleteDepartmentModal
```

---

## Identified issues

### Critical bug — Kebab menu clipped by `overflow-hidden`

**Symptom:** Clicking the 3 dots on the last departments in the list renders the action dropdown clipped or invisible.

**Root cause:**
- The white container `div.bg-white.rounded-2xl.shadow-sm.overflow-hidden` (line 104) has `overflow-hidden`.
- Inside the container, each department row has `position: relative` (`div.relative`).
- The dropdown is positioned with `position: absolute; right: 4; top: 14` relative to the row's `div.relative`.
- For the last items in the list, the dropdown exceeds the container's bottom edge and gets clipped by `overflow-hidden`.

**Aggravating factor:** The 3-dot button has `opacity-0 group-hover:opacity-100`. On touch devices there's no hover, so the button is never visible either.

**Possible solutions:**
1. **Flip upward:** For the last N departments (or when overflow is detected), open the dropdown upward: `bottom-full mb-2` instead of `top-14`. Simple, no architecture changes needed.
2. **`position: fixed`:** Compute the button's position with `getBoundingClientRect` and position the dropdown with `fixed`. Works regardless of stacking context.
3. **React portal:** Render the dropdown outside the container's DOM tree via `createPortal`.

**Recommendation for this component:** Flip-upward is the most direct option, since the list has few items and it's easy to determine proximity to the container's end.

### Accessibility — 3-dot button hidden on touch

- The `MoreVertical` button has `opacity-0 group-hover:opacity-100`. On mobile devices (touch), hover doesn't exist, so the button never appears.
- **Solution:** always show the button below the `md` breakpoint (`md:opacity-0 md:group-hover:opacity-100`), use long-press, or simply always show it.

### UI — Margin review

1. **Header:** `mb-6` between the header and content (vs. `mb-5` on other history screens). Verify consistency.
2. **Card sub-header:** `px-5 py-3 border-b border-gray-100` with the department count. Verify the text size `text-xs text-gray-400 uppercase tracking-wide`.
3. **Department row:** `px-5 py-4 gap-4` — verify vertical padding against Figma.
4. **Department icon:** `w-9 h-9 rounded-xl` with `Layers size={16}` — verify against Figma.
5. **Position count:** `Clock size={11}` + date right-aligned. Verify they don't overlap the count badge on rows with long department names.

### Responsive design

- On mobile (375px), the row has: icon + name/subtitle + date + badge + 3-dot button. With a long department name it can get cramped.
- `truncate` on the name (`p.text-sm.text-gray-800.truncate`) prevents overflow, but can clip long department names.
- The invisible 3-dot button on mobile is a functional blocker (see the accessibility bug).
- The screen has no "New Department" button in the header (unlike PositionHistory and VacancyHistory). Access is from the sidebar or the wizard. Verify whether Figma includes this CTA.

---

## Tests to perform

### Loading and states

- [ ] **Loading spinner:** The sub-header shows "Cargando…" while `loading === true`.
- [ ] **Network error:** Simulate a failure → red banner with the error message.
- [ ] **Empty state:** No departments → card with the `Layers` icon and "No hay departamentos registrados." message.
- [ ] **With data:** The list shows every department with name, assigned positions, and date.

### Per-department information

- [ ] The department name displays correctly.
- [ ] The subtitle shows "Sin posiciones asignadas", "1 posición asignada", or "X posiciones asignadas" depending on `positionsCount`.
- [ ] The creation date formats as `DD/MM/YYYY`.
- [ ] The count badge (`positionsCount`) only appears if `positionsCount > 0`.

### Actions — Kebab menu

- [ ] The 3-dot button appears on row hover in desktop.
- [ ] Clicking the button opens the dropdown.
- [ ] Clicking another department closes the previous one and opens the new one.
- [ ] Clicking outside the dropdown closes it.
- [ ] **Edit name:** Click → opens `EditDepartmentModal` with the current name pre-filled → change the name → save → the name updates in the list without a re-fetch.
- [ ] **Edit with error:** Simulate a failure in `update` → the modal shows the error and the name doesn't change.
- [ ] **Delete:** Click → opens `DeleteDepartmentModal` → confirm → the department disappears from the list.
- [ ] **Delete with error:** Simulate a failure → the modal shows the error and the department doesn't disappear.

### Kebab overflow bug

- [ ] **Reproduce the bug:** With 5+ departments, click the 3 dots on the last department → verify whether the dropdown is fully visible.
- [ ] **Verify the fix:** After applying flip-upward or a portal, the last items' dropdown opens upward and is fully visible.
- [ ] **No regression:** The first items' dropdown still opens downward correctly.

### Mobile accessibility bug

- [ ] On mobile (375px), the 3-dot button is visible without needing hover.
- [ ] Clicking the button correctly opens the dropdown.

### Responsive

- [ ] **375px mobile:** The 3-dot button is visible. Long department names truncate. No horizontal scroll.
- [ ] **768px tablet:** Correct layout, date and badge visible.
- [ ] **1280px desktop:** Centered `max-w-3xl`. Rows have good spacing.
