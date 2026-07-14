# Issue Plan — Historial de Departamentos (`src/pages/DepartmentHistory.tsx`)

## Descripción general de la pantalla

Muestra todos los departamentos del sistema en una lista tipo card. Desde cada fila se puede editar el nombre (modal) o eliminar el departamento (modal de confirmación). El menú de acciones se activa con el ícono de 3 puntos que aparece al hacer hover sobre la fila.

---

## Arquitectura de datos

| Elemento | Fuente |
|---|---|
| Lista de departamentos | `departmentsApi.getAll()` → `Department[]` |
| Editar nombre | `departmentsApi.update(id, { name })` → actualiza array local con `map` |
| Eliminar departamento | `departmentsApi.delete(id)` → filtra el array local |

**Flujo de estado:**
1. `useEffect` llama a `fetchDepartments()` al montar.
2. El menú kebab usa `openMenuId: string | null` — solo uno abierto a la vez.
3. El wrapper tiene `onClick={closeMenu}` para cerrar el menú al hacer clic fuera.
4. Editar: abre `EditDepartmentModal` → en guardar llama `update` → actualiza `departments` localmente.
5. Eliminar: abre `DeleteDepartmentModal` → en confirmar llama `delete` → filtra `departments` localmente.

**Árbol de componentes:**
```
DepartmentHistory
  ├── EditDepartmentModal
  └── DeleteDepartmentModal
```

---

## Issues identificados

### Bug crítico — Menú kebab cortado por `overflow-hidden`

**Síntoma:** Al hacer clic en los 3 puntos de los últimos departamentos de la lista, el dropdown de acciones aparece recortado o invisible.

**Causa raíz:**
- El contenedor blanco `div.bg-white.rounded-2xl.shadow-sm.overflow-hidden` (línea 104) tiene `overflow-hidden`.
- Dentro del contenedor, cada fila de departamento tiene `position: relative` (`div.relative`).
- El dropdown se posiciona con `position: absolute; right: 4; top: 14` relativo al `div.relative` de la fila.
- Para los últimos ítems de la lista, el dropdown excede el límite inferior del contenedor con `overflow-hidden` y queda recortado.

**Agravante:** El botón de 3 puntos tiene `opacity-0 group-hover:opacity-100`. En los dispositivos touch no hay hover, por lo que el botón tampoco es visible.

**Soluciones posibles:**
1. **Flip upward:** Para los últimos N departamentos (o cuando se detecte overflow), abrir el dropdown hacia arriba: `bottom-full mb-2` en lugar de `top-14`. Simple y no requiere cambios de arquitectura.
2. **`position: fixed`:** Calcular posición del botón con `getBoundingClientRect` y posicionar el dropdown con `fixed`. Funciona independientemente del contexto de stacking.
3. **Portal de React:** Renderizar el dropdown fuera del DOM del contenedor usando `createPortal`.

**Recomendación para este componente:** La opción más directa es flip upward, ya que la lista tiene pocos ítems y es fácil determinar cuándo se está cerca del final del contenedor.

### Accesibilidad — Botón de 3 puntos oculto en touch

- El botón `MoreVertical` tiene `opacity-0 group-hover:opacity-100`. En dispositivos móviles (touch), el hover no existe, por lo que el botón nunca aparece.
- **Solución:** Mostrar siempre el botón en viewports menores a `md` (`md:opacity-0 md:group-hover:opacity-100`), o usar un long-press, o simplemente siempre visible.

### UI — Revisión de márgenes

1. **Header:** `mb-6` entre el encabezado y el contenido (vs `mb-5` en otras pantallas de historial). Verificar consistencia.
2. **Sub-header del card:** `px-5 py-3 border-b border-gray-100` con el conteo de departamentos. Verificar tamaño del texto `text-xs text-gray-400 uppercase tracking-wide`.
3. **Fila de departamento:** `px-5 py-4 gap-4` — verificar padding vertical con Figma.
4. **Ícono del departamento:** `w-9 h-9 rounded-xl` con `Layers size={16}` — verificar contra Figma.
5. **Conteo de posiciones:** `Clock size={11}` + fecha alineados a la derecha. Verificar que no se solapen con el badge de conteo en filas con nombres de departamento largos.

### Responsive design

- En mobile (375px), la fila tiene: ícono + nombre/subtítulo + fecha + badge + botón 3 puntos. Con un nombre de departamento largo puede quedar comprimido.
- El `truncate` en el nombre (`p.text-sm.text-gray-800.truncate`) evita overflow, pero puede cortar departamentos con nombres largos.
- El botón de 3 puntos invisible en mobile es un bloqueante funcional (ver bug de accesibilidad).
- La pantalla no tiene botón "Nuevo Departamento" en el header (a diferencia de PositionHistory y VacancyHistory). El acceso es desde el sidebar o el wizard. Verificar si Figma incluye este CTA.

---

## Tests a realizar

### Carga y estados

- [ ] **Spinner de carga:** El sub-header muestra "Cargando…" mientras `loading === true`.
- [ ] **Error de red:** Simular fallo → banner rojo con el mensaje del error.
- [ ] **Empty state:** Sin departamentos → card con `Layers` icon y mensaje "No hay departamentos registrados."
- [ ] **Con datos:** La lista muestra todos los departamentos con nombre, posiciones asignadas y fecha.

### Información por departamento

- [ ] El nombre del departamento se muestra correctamente.
- [ ] El subtítulo muestra "Sin posiciones asignadas", "1 posición asignada" o "X posiciones asignadas" según el valor de `positionsCount`.
- [ ] La fecha de creación se formatea como `DD/MM/YYYY`.
- [ ] El badge de conteo (`positionsCount`) solo aparece si `positionsCount > 0`.

### Acciones — Menú kebab

- [ ] El botón de 3 puntos aparece al hacer hover sobre la fila en desktop.
- [ ] Clic en el botón → abre el dropdown.
- [ ] Clic en otro departamento → cierra el anterior y abre el nuevo.
- [ ] Clic fuera del dropdown → lo cierra.
- [ ] **Editar nombre:** Clic → abre `EditDepartmentModal` con el nombre actual pre-rellenado → cambiar nombre → guardar → el nombre actualiza en la lista sin re-fetch.
- [ ] **Editar con error:** Simular fallo en `update` → el modal muestra error y el nombre no cambia.
- [ ] **Eliminar:** Clic → abre `DeleteDepartmentModal` → confirmar → el departamento desaparece de la lista.
- [ ] **Eliminar con error:** Simular fallo → el modal muestra error y el departamento no desaparece.

### Bug de kebab overflow

- [ ] **Reproducir bug:** Con 5+ departamentos, hacer clic en los 3 puntos del último departamento → verificar si el dropdown es completamente visible.
- [ ] **Verificar fix:** Tras aplicar flip-upward o portal, el dropdown de los últimos ítems abre hacia arriba y es completamente visible.
- [ ] **No regresión:** El dropdown de los primeros ítems sigue abriendo hacia abajo correctamente.

### Bug de accesibilidad en mobile

- [ ] En mobile (375px), el botón de 3 puntos es visible sin necesidad de hover.
- [ ] El clic en el botón abre el dropdown correctamente.

### Responsive

- [ ] **375px mobile:** El botón de 3 puntos es visible. Los nombres largos de departamentos se truncan. No hay scroll horizontal.
- [ ] **768px tablet:** Layout correcto, fecha y badge visibles.
- [ ] **1280px desktop:** `max-w-3xl` centrado. Las filas tienen buen espaciado.
