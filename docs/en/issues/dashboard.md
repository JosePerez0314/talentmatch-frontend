# Issue Plan — Dashboard (`src/pages/Dashboard.tsx`)

## Screen overview

The Dashboard is the main entry point after login. It shows four key metrics (positions, departments, candidates, open vacancies), an SVG monthly-activity chart, and a vacancy status-breakdown card. All data comes from a single endpoint: `GET /dashboard/summary`.

---

## Data architecture

| Element | Source |
|---|---|
| Metrics summary | `dashboardService.getSummary()` → `DashboardSummary` |
| Monthly activity chart | `summary.monthlyActivity[]` (derived with `useMemo`) |
| Status breakdown | `summary.vacancyStatusBreakdown[]` (derived with `useMemo`) |
| Navigation from cards | `METRIC_LINKS` (static routes) |

**State flow:**
1. A `useEffect` triggers the load on mount.
2. `isLoading = true` → centered spinner.
3. On success: `summary` is populated and the derived values (`metrics`, `vacancyStatuses`, `monthlyData`) recompute.
4. On error: a red banner with the message is shown.
5. If `summary` is `null` after loading: an empty state with a CTA.

**Custom SVG chart:**
Computes normalized `x, y` coordinates over a 100×100 viewBox using `getX(index)` and `getY(value)`. Draws 3 polylines (positions, CVs, vacancies) with filled areas. The hover tooltip uses `onMouseMove` over the SVG and `hoveredIndex` to show values at the nearest point.

---

## Identified issues

### UI — Sizes, fonts, and margins

1. **Inconsistent border radius:** The chart and breakdown cards use `rounded-[24px]` while the rest of the app uses `rounded-2xl` (equivalent to 16px). Check with Figma whether it should be 24px or unified to `rounded-2xl`.

2. **Extra padding at xl:** The wrapper uses `xl:p-10` in addition to the standard `p-4 md:p-8`. Confirm with Figma whether that extra padding on large screens is correct or should be removed.

3. **Header title:** Uses a font scale of `text-[22px] md:text-2xl xl:text-3xl`. Verify whether the desktop size (3xl = 30px) matches the Figma design.

4. **Section spacing:** `mb-6 xl:mb-8` between the header and the metrics grid. Confirm with Figma.

5. **Chart — horizontal scroll area on mobile:** On small viewports the SVG chart may compress the month labels. Verify they don't overlap at 320px–375px.

6. **MetricCard:** Review the icon size (currently `size={17} strokeWidth={2.5}`), and the counter/subtext typography against Figma.

### Responsive design

- Metrics grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — validate that in 2-column layouts the cards aren't disproportionate.
- Bottom grid: `lg:col-span-2` for the chart and `lg:col-span-1` for the breakdown — on mobile both stack vertically, confirm the correct order.
- SVG viewBox 0 0 100 100 with `preserveAspectRatio` — can distort at extreme aspect ratios.

---

## Tests to perform

### Base loading and states

- [ ] **Loading spinner:** Opening the dashboard should show the animated `Loader2` while `getSummary()` resolves.
- [ ] **Error state:** Simulate a network failure → the red banner "No se pudo cargar el resumen del panel." should appear.
- [ ] **Empty state:** If the backend returns empty data (no vacancies or positions), the "Sin actividad aún" state with the "Empieza hoy" CTA should show.
- [ ] **State with data:** Verify the 4 MetricCards show the correct backend values.

### Metrics and navigation

- [ ] Clicking each MetricCard → navigates to the correct route (positions, departments, candidates, vacancies).
- [ ] The count on each card matches the real backend data (manual cross-check).

### Activity chart

- [ ] All 3 lines render (positions, CVs, vacancies) with no console errors.
- [ ] The month labels on the X axis are correct and legible on desktop, tablet, and mobile.
- [ ] Hovering over the chart shows the tooltip with correct values.
- [ ] If `monthlyActivity` is empty, the chart doesn't break (division by zero in `maxYValue` → guarded by `peak > 0 ? peak : 1`).
- [ ] With a single month of data (`monthlyData.length === 1`), `getX` returns 50 (centered) → verify it doesn't draw a dangling line.

### Status breakdown

- [ ] The progress bars sum correctly according to the backend percentages.
- [ ] The Active/Paused/Closed labels show the correct colors (#447ECA, #F8C807, #EF5050).
- [ ] The total vacancy count (`totalVacancies`) is computed by summing all statuses.

### Responsive

- [ ] **320px (mobile S):** 1 column, chart with no overflow, no clipped text.
- [ ] **768px (tablet):** 2 columns in the metrics grid, chart spans full width.
- [ ] **1024px (desktop):** 4 columns in metrics, chart 2/3 + breakdown 1/3.
- [ ] **1440px+ (xl):** `xl:p-10` and `xl:gap-6` active, verify proportions.

### Visual consistency

- [ ] Confirm `rounded-[24px]` on chart cards vs. `rounded-2xl` elsewhere — align with Figma.
- [ ] No horizontal scroll at any viewport.
