# Issue Plan — Historial de Posiciones (`src/pages/PositionHistory.tsx`)

## Descripción general de la pantalla

Muestra todas las posiciones del sistema en una tabla con tabs de filtrado por departamento. Permite eliminar y duplicar posiciones. La tabla es un componente separado (`PositionHistoryTable`) que delega el menú de acciones a `ActionDropdown`.

---

## Arquitectura de datos

| Elemento | Fuente |
|---|---|
| Lista de posiciones | `positionService.getAll()` → `Position[]` |
| Tabs de departamento | Derivado de `positions` con `Array.from(new Set(...))` |
| Eliminar posición | `positionService.delete(id)` → optimistic UI (filtra el array local); muestra error FK ante un 400 |
| Duplicar posición | `positionService.duplicate(id)` → re-fetch completo (`fetchPositions()`) |
| Editar posición | Navega a `/position/edit/:id`; `Position.tsx` pre-rellena el formulario desde `positionService.getById(id)` |

**Flujo de estado:**
1. `useEffect` llama a `fetchPositions()` al montar.
2. Al cargar, extrae departamentos únicos para construir los tabs.
3. El tab activo filtra `positions` en `filteredPositions` (derivado síncrono, no `useMemo`).
4. Delete: optimistic — remueve del array local sin re-fetch.
5. Duplicate: no-optimistic — llama `fetchPositions()` para garantizar consistencia.

**Árbol de componentes:**
```
PositionHistory
  └── PositionHistoryTable
        └── ActionDropdown (menú kebab por fila)
```

---

## Issues identificados

### ~~Botón Editar sin conectar~~ — CORREGIDO (2026-08-01)

El botón Editar del menú kebab no tenía ruta configurada. Esto fue resuelto: se añadió `/position/edit/:id` a `App.tsx`, el botón Editar ahora navega a esa ruta, y `Position.tsx` maneja el modo edición leyendo `useParams().id` y pre-rellenando el formulario.

### ~~Mensaje de error 400 al eliminar ausente~~ — CORREGIDO (2026-08-01)

Cuando se elimina una posición que está referenciada por una vacante (restricción FK), el backend devuelve 400. `PositionHistory.tsx` ahora muestra un mensaje de error FK específico al usuario en ese caso, en lugar de un banner de error genérico.

### Bug crítico — Menú kebab cortado por `overflow-hidden`

**Síntoma:** Al hacer clic en los 3 puntos de las últimas posiciones de la lista, el dropdown de acciones aparece recortado o invisible.

**Causa raíz:**
- El contenedor blanco `div.bg-white.rounded-2xl.shadow-sm.overflow-hidden` en `PositionHistory.tsx` (línea 134) tiene `overflow-hidden` para que las esquinas redondeadas funcionen.
- `PositionHistoryTable` renderiza una `<table>` con filas `<tr>`.
- `ActionDropdown` (en `src/components/Sections/ActionDropdown.tsx`) usa `position: absolute; right: 0; mt-2` relativo a su contenedor `div.relative`.
- El dropdown se posiciona relativo al `<td>`, pero el `overflow-hidden` del ancestro lo recorta al exceder el límite inferior del card.

**Soluciones posibles:**
1. **`position: fixed` en el dropdown:** Calcular coordenadas del botón (`getBoundingClientRect`) y posicionar el dropdown con `fixed` para escapar del contexto de stacking del contenedor. Más complejo de mantener.
2. **Dirección dinámica (flip upward):** Para las últimas N filas, abrir el dropdown hacia arriba (`bottom-full mb-2`) en lugar de hacia abajo. Requiere conocer el índice de la fila o usar `IntersectionObserver`.
3. **Eliminar `overflow-hidden` del contenedor:** Usar `overflow-visible` y aplicar el border-radius con un pseudo-elemento o `clip-path`. Afecta el estilo visual del card.
4. **Portal de React:** Renderizar el dropdown fuera del árbol DOM del card usando `ReactDOM.createPortal`. Solución más limpia a largo plazo.

**Recomendación:** Opción 2 (flip upward) es la más simple sin refactorizar el sistema de dropdown. Opción 4 es la más correcta arquitectónicamente.

### UI — Revisión de márgenes

1. **Header:** `mb-5` entre el header y el contenido. Verificar si es correcto con Figma (otras pantallas usan `mb-5` o `mb-6` de forma inconsistente).
2. **Empty state:** `p-20` en el card de empty state y `p-10` en el loader. Confirmar padding vertical en Figma.
3. **Tabs:** `px-4 py-3.5` en cada tab — verificar que el indicador activo (`border-b-2`) no se corte por el `overflow-x-auto`.

### Responsive design

- Tabs desbordables en horizontal (`overflow-x-auto`) — verificar que en mobile sea evidente que hay más tabs.
- La tabla no tiene columnas ocultas en mobile (a diferencia de VacancyHistory que oculta "Posición" en sm). Revisar si la columna de "Departamento" es legible en 375px.
- El botón "Nueva Posición" en el header puede verse comprimido junto al título en mobile si el nombre de la posición es largo.

---

## Tests a realizar

### Carga y estados

- [ ] **Spinner de carga:** `Loader2` animado en el card blanco mientras se carga.
- [ ] **Error de red:** Simular fallo → banner rojo "No se pudieron cargar las posiciones desde el servidor."
- [ ] **Empty state:** Sin posiciones → card con ícono `Briefcase`, mensaje y botón "Crear Posición".
- [ ] **Con datos:** La tabla muestra todas las posiciones con nombre, departamento y fecha.

### Tabs de departamento

- [ ] El tab "Todos" muestra el total de posiciones.
- [ ] Cada tab de departamento muestra solo las posiciones de ese departamento.
- [ ] El contador en el badge del tab es correcto.
- [ ] Si se cambia de tab a uno vacío, muestra "Sin posiciones en este departamento".
- [ ] Los tabs son scrolleables horizontalmente si hay muchos departamentos.

### Acciones por posición

- [ ] **Eliminar:** Clic en eliminar → la posición desaparece del listado inmediatamente (optimistic). El tab contador actualiza.
- [ ] **Eliminar con error:** Simular fallo → se muestra el banner de error y la posición no desaparece.
- [ ] **Duplicar:** Clic en duplicar → se hace re-fetch y aparece la posición duplicada en la lista.
- [ ] **Duplicar con error:** Simular fallo → se muestra el banner de error.
- [ ] El clic en "Nueva Posición" navega a `/position`.

### Bug de kebab overflow

- [ ] **Reproducir bug:** Con al menos 6+ posiciones, desplazarse al final y hacer clic en los 3 puntos de la última posición → verificar si el dropdown se ve completo.
- [ ] **Verificar corrección:** Tras aplicar el fix (flip upward o portal), el dropdown de la última fila debe ser completamente visible.
- [ ] **Verificar no regresión:** El dropdown de la primera fila (apertura hacia abajo) sigue funcionando.

### Responsive

- [ ] **375px mobile:** La tabla es legible, no hay scroll horizontal dentro de cada celda.
- [ ] **768px tablet:** Los tabs y tabla funcionan correctamente.
- [ ] **1280px desktop:** `max-w-4xl` centrado, sin distorsiones.
- [ ] Botón "Nueva Posición" en el header se ve correctamente en todos los viewports.
