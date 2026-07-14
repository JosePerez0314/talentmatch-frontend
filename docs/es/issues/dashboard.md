# Issue Plan — Dashboard (`src/pages/Dashboard.tsx`)

## Descripción general de la pantalla

El Dashboard es el punto de entrada principal tras el login. Muestra cuatro métricas clave (posiciones, departamentos, candidatos, vacantes abiertas), una gráfica SVG de actividad mensual y una tarjeta de distribución de estados de vacantes. Toda la data proviene de un único endpoint: `GET /dashboard/summary`.

---

## Arquitectura de datos

| Elemento | Fuente |
|---|---|
| Resumen de métricas | `dashboardService.getSummary()` → `DashboardSummary` |
| Gráfica de actividad mensual | `summary.monthlyActivity[]` (derivado con `useMemo`) |
| Distribución de estados | `summary.vacancyStatusBreakdown[]` (derivado con `useMemo`) |
| Navegación desde tarjetas | `METRIC_LINKS` (rutas estáticas) |

**Flujo de estado:**
1. `useEffect` dispara la carga al montar el componente.
2. `isLoading = true` → spinner centrado.
3. En éxito: `summary` se poblad y los derivados (`metrics`, `vacancyStatuses`, `monthlyData`) se recomputan.
4. En error: se muestra banner rojo con mensaje.
5. Si `summary` es `null` tras la carga: empty state con CTA.

**Gráfica SVG personalizada:**
Calcula coordenadas `x, y` normalizadas sobre 100×100 viewBox usando `getX(index)` y `getY(value)`. Dibuja 3 polilíneas (posiciones, CVs, vacantes) con áreas rellenas. El tooltip en hover usa `onMouseMove` sobre el SVG y `hoveredIndex` para mostrar valores en el punto más cercano.

---

## Issues identificados

### UI — Tamaños, fuentes y márgenes

1. **Border radius inconsistente:** Las tarjetas de la gráfica y distribución usan `rounded-[24px]` mientras que el resto de la app usa `rounded-2xl` (equivalente a 16px). Revisar con Figma si debe ser 24px o unificar a `rounded-2xl`.

2. **Padding extra en xl:** El wrapper usa `xl:p-10` además del estándar `p-4 md:p-8`. Confirmar con Figma si ese padding adicional en pantallas grandes es correcto o debe eliminarse.

3. **Título del header:** Usa escala de fuente `text-[22px] md:text-2xl xl:text-3xl`. Verificar si el tamaño en desktop (3xl = 30px) coincide con el diseño de Figma.

4. **Espaciado de sección:** `mb-6 xl:mb-8` entre header y grid de métricas. Confirmar con Figma.

5. **Gráfica — área de scroll horizontal en mobile:** En viewports pequeños la gráfica SVG puede comprimir las etiquetas de mes. Verificar que no se solapen en 320px–375px.

6. **MetricCard:** Revisar tamaño del ícono (actualmente `size={17} strokeWidth={2.5}`), tipografía del contador y del subtext contra Figma.

### Responsive design

- Grid de métricas: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — validar que en 2 columnas los cards no queden desproporcionados.
- Grid inferior: `lg:col-span-2` para la gráfica y `lg:col-span-1` para la distribución — en mobile ambos apilan verticalmente, confirmar orden correcto.
- SVG viewBox 0 0 100 100 con `preserveAspectRatio` — puede distorsionarse en aspect ratios extremos.

---

## Tests a realizar

### Carga y estados base

- [ ] **Spinner de carga:** Al abrir el dashboard debe aparecer el `Loader2` animado mientras se resuelve `getSummary()`.
- [ ] **Estado de error:** Simular fallo de red → debe mostrarse el banner rojo con el mensaje "No se pudo cargar el resumen del panel."
- [ ] **Empty state:** Si el backend devuelve datos vacíos (sin vacantes ni posiciones), debe mostrarse el estado "Sin actividad aún" con el CTA "Empieza hoy".
- [ ] **Estado con datos:** Verificar que las 4 MetricCard muestran los valores correctos del backend.

### Métricas y navegación

- [ ] Clic en cada MetricCard → navega a la ruta correcta (posiciones, departamentos, candidatos, vacantes).
- [ ] El conteo en cada tarjeta coincide con los datos reales del backend (cross-check manual).

### Gráfica de actividad

- [ ] Se renderizan las 3 líneas (posiciones, CVs, vacantes) sin errores de consola.
- [ ] Las etiquetas de mes en el eje X son correctas y legibles en desktop, tablet y mobile.
- [ ] El hover sobre la gráfica muestra el tooltip con los valores correctos.
- [ ] Si `monthlyActivity` está vacío, la gráfica no rompe (división por cero en `maxYValue` → protegido por `peak > 0 ? peak : 1`).
- [ ] Con un solo mes de data (`monthlyData.length === 1`), `getX` devuelve 50 (centrado) → verificar que no dibuja línea colgante.

### Distribución de estados

- [ ] Las barras de progreso suman correctamente según los porcentajes del backend.
- [ ] Las etiquetas Activas/Pausadas/Cerradas muestran los colores correctos (#447ECA, #F8C807, #EF5050).
- [ ] El total de vacantes (`totalVacancies`) se calcula sumando todos los estados.

### Responsive

- [ ] **320px (mobile S):** 1 columna, gráfica sin overflow, sin texto recortado.
- [ ] **768px (tablet):** 2 columnas en grid de métricas, gráfica ocupa ancho completo.
- [ ] **1024px (desktop):** 4 columnas en métricas, gráfica 2/3 + distribución 1/3.
- [ ] **1440px+ (xl):** `xl:p-10` y `xl:gap-6` activos, verificar proporciones.

### Consistencia visual

- [ ] Confirmar `rounded-[24px]` en tarjetas de gráfica vs `rounded-2xl` en el resto — alinear con Figma.
- [ ] No hay scroll horizontal en ningún viewport.
