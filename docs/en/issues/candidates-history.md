# Issue Plan — Candidates History (`src/pages/CandidatesHistory.tsx`)

## Screen overview

Shows every candidate in the system grouped by vacancy. Each group is an expandable accordion (`VacancyGroup`) listing candidate rows with avatar, name, email, upload date, status (Hired/Available), and a CV link. Candidates are fetched indirectly through vacancies (which include a nested `candidates[]`).

---

## Data architecture

| Element | Source |
|---|---|
| Vacancies with nested candidates | `vacanciesApi.getAll()` → `Vacancy[]` (each vacancy includes `candidates[]`) |
| Filtering vacancies with candidates | `useMemo` → filters `vacancies` where `candidates.length > 0` |
| Total candidate count | `useMemo` → sum of `candidates.length` per vacancy |
| Navigation to results | `navigate(\`/advanced-results/${id}\`)` |

**State flow:**
1. A `useEffect` with cleanup (a `cancelled` flag) triggers `vacanciesApi.getAll()` on mount.
2. Only vacancies with candidates are filtered in for display.
3. Each `VacancyGroup`'s accordion is independent — `open` state local to the component.
4. No pagination; all candidates load in a single request.

**Design note:** The screen doesn't use `GET /candidates` directly (which would be flat, without grouping by vacancy). It uses `GET /vacancies`, which includes nested candidates — correct for this grouped view.

---

## Identified issues

### UI — Margin review

1. **Header:** The subtitle shows `X candidatos · Y vacantes` with `text-sm text-gray-400 mt-0.5`. Verify size and weight against Figma.
2. **VacancyGroup card:** `border border-gray-100 rounded-xl` — the rest of the app uses `rounded-2xl` on cards. Confirm whether `rounded-xl` is correct for this sub-card component.
3. **Candidate rows:** `px-5 py-3` — verify vertical padding against Figma.
4. **Group (vacancy) avatar:** `w-8 h-8 rounded-lg` — confirm the size.
5. **Candidate avatar:** `w-8 h-8 rounded-full` — confirm size and that the color palette is consistent.

### Possible bug — Case-sensitive status comparison

**Symptom:** The "Contratado" (Hired) badge might not show even when the candidate has a hired status.

**Cause:** The logic is `candidate.status === "CONTRATADO"` (uppercase), but if the backend returns `"Contratado"` (capitalized) or `"contratado"` (lowercase), the comparison fails and it always shows "Disponible" (Available).

**Verification:** Check what value the backend actually returns in `candidate.status` for hired candidates.

### Accessibility — Hover-only affordances on mobile

- The `ExternalLink` icon (view vacancy results) has `p-1.5 rounded-lg hover:bg-[#DCF9FF]` and is always visible. ✓ Correct.
- The "View CV" link (`Eye`) has `opacity-0 group-hover:opacity-100` — on touch devices it never appears because there's no hover. This can prevent mobile users from viewing the CV.

### Responsive design

- The candidate's `niche` field is hidden on mobile (`hidden sm:block`) — acceptable, but verify the row doesn't look empty.
- No pagination — if an organization has hundreds of candidates, the list could get very long. Pending a decision on whether to add pagination or virtual scroll.
- The `VacancyGroup` accordion opens by default (`useState(true)`). With many vacancies on mobile this can get very long. Consider closing by default.

---

## Tests to perform

### Loading and states

- [ ] **Loading spinner:** Centered `Loader2` in a white card while loading.
- [ ] **Network error:** Simulate a failure → red banner "No pudimos cargar los candidatos."
- [ ] **Empty state (no candidates):** All vacancies with no candidates → shows a card with the `Users` icon and "Sin candidatos aún" message.
- [ ] **With data:** All vacancy groups with at least one candidate are shown.

### VacancyGroup accordion

- [ ] By default the accordion is **open** (`open = true`).
- [ ] Clicking the group header collapses the candidate list.
- [ ] Clicking again re-expands it.
- [ ] Pressing Enter on the header also toggles it open/closed (accessibility via `onKeyDown`).
- [ ] The candidate count in the header is correct.

### Candidate rows

- [ ] The candidate name resolves correctly: `fullName` > `firstName + lastName` > `email`.
- [ ] The avatar initials are generated from the first two words of the name.
- [ ] The email is truncated with `truncate` if long.
- [ ] The "Subido: DD/MM/YYYY" date formats correctly.
- [ ] Candidates with `status === "CONTRATADO"` show the green "Contratado" badge.
- [ ] Candidates without that status show the gray "Disponible" badge.
- [ ] **Status bug:** Confirm the uppercase comparison matches the backend's real value.

### CV link

- [ ] If the candidate has a `fileUrl`, the `Eye` icon appears on row hover.
- [ ] Clicking `Eye` opens the CV in a new tab.
- [ ] If there's no `fileUrl`, the icon doesn't appear.
- [ ] On mobile (no hover): verify whether the CV is accessible some other way.

### Navigation to results

- [ ] Clicking the group header's `ExternalLink` button → navigates to `/advanced-results/{vacancyId}`.
- [ ] `stopPropagation()` works: clicking `ExternalLink` doesn't collapse the accordion.

### Responsive

- [ ] **375px mobile:** Candidate rows aren't clipped. The hidden `niche` doesn't leave empty space.
- [ ] **768px tablet:** The accordion looks correct. Avatar + name + email on one or two well-formatted lines.
- [ ] **1280px desktop:** Centered `max-w-4xl`, aligned rows.
- [ ] With 50+ candidates in a vacancy, the list scrolls without issues.
