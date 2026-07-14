# Issue Plan — Historial de Vacantes (`src/pages/VacancyHistory.tsx`)

## Descripción general de la pantalla

Muestra todas las vacantes en una tabla con acciones de edición, cambio de estado (Activa/Pausada/Cerrada) y eliminación. El cambio de estado usa un modal de confirmación (`VacancyActionModal`). Desde cada fila se puede navegar a los resultados de la vacante.

---

## Arquitectura de datos

| Elemento | Fuente |
|---|---|
| Lista de vacantes | `vacanciesApi.getAll()` → `Vacancy[]` (invertido con `.reverse()`) |
| Cambio de estado | `vacanciesApi.updateStatus(id, status)` → optimistic UI (actualiza array local) |
| Eliminar vacante | `vacanciesApi.delete(id)` → optimistic UI (filtra el array local) |
| Ver resultados | `navigate(\`/advanced-results/${id}\`)` + guarda en `localStorage` |

**Flujo de estado:**
1. `useEffect` llama a `fetchVacancies()` al montar.
2. El array se invierte (`.reverse()`) para mostrar las más recientes primero.
3. El menú kebab por fila se maneja con `openMenuId: number | null` — solo uno abierto a la vez.
4. Clic en cualquier parte del wrapper `onClick={closeMenu}` cierra el menú activo.
5. Cambio de estado: abre `VacancyActionModal` → en confirmación llama `updateStatus` → actualiza estado local con `map`.
6. Eliminar: `window.confirm()` nativo → en confirmación llama `delete` → filtra del array local.

---

## Issues identificados

### Bug crítico — Menú kebab cortado por `overflow-x-auto`

**Síntoma:** Al hacer clic en los 3 puntos de las últimas vacantes de la tabla, el dropdown de acciones aparece recortado o invisible.

**Causa raíz:**
- El dropdown se renderiza con `position: absolute; right: 4; top: 12` dentro del `<td>` de la columna "Acciones".
- El contenedor exterior tiene `overflow-x-auto` (`div.overflow-x-auto`), que recorta el contenido vertical cuando el dropdown excede la altura de la tabla.
- Adicionalmente, el card exterior `div.bg-white.rounded-2xl.shadow-sm.overflow-hidden` también limita el desbordamiento.

**Soluciones posibles (mismas que PositionHistory):**
1. **Flip upward:** Para filas en la parte inferior de la lista, el dropdown abre hacia arriba (`bottom-full mb-2`). Requiere detectar la posición relativa de la fila.
2. **`position: fixed`:** Usar `getBoundingClientRect` del botón para posicionar el dropdown fuera del contexto de stacking. Más robusto.
3. **Portal de React:** Montar el dropdown fuera del DOM de la tabla usando `ReactDOM.createPortal`. La solución más limpia.

**Diferencia con PositionHistory:** El dropdown aquí tiene 5 opciones (editar, eliminar, marcar activa, pausar, cerrar), por lo que la altura del dropdown es mayor (~180px) y el recorte es más pronunciado.

### UI — Revisión de márgenes y estilos

1. **Badges de estado:** Usan `style={getStatusStyle(vac.status)}` (inline style con colores `#447ECA`, `#F8C807`, `#EF5050`) en lugar de clases Tailwind. Es inconsistente con el resto de la app donde los badges usan clases — pero es intencional por los colores exactos de marca.
2. **Columna "Posición":** `hidden sm:table-cell` — en mobile esta columna no se muestra. Verificar si el layout de las columnas restantes es suficientemente informativo en 375px.
3. **Header spacing:** `mb-5` entre header y card. Consistente con otras pantallas de historial.
4. **Empty state padding:** `p-20` — revisar con Figma.

### UX — `window.confirm()` para eliminar

La confirmación de eliminación usa `window.confirm()` nativo en lugar del patrón modal del resto de la app (`VacancyActionModal`). Es inconsistente y en algunos navegadores/contextos el diálogo nativo tiene aspecto diferente al resto de la UI.

**Solución propuesta:** Reutilizar el patrón de `VacancyActionModal` o crear un `DeleteConfirmModal` genérico similar al `DeleteDepartmentModal` que existe en la app.

### Responsive design

- Tabla con `overflow-x-auto` — en mobile las columnas se comprimen. Verificar que las columnas "ID", "Título" y "Estado" sean legibles en 375px.
- El botón "Resultados" (`<Eye> Resultados`) ocupa espacio en una columna propia — en mobile puede comprimir otras columnas.
- El botón "Nueva Vacante" en el header: verificar en 375px que no se solape con el título.

---

## Tests a realizar

### Carga y estados

- [ ] **Spinner de carga:** `Loader2` centrado mientras se resuelve `getAll()`.
- [ ] **Error de red:** Simular fallo → banner rojo "No se pudieron cargar las vacantes."
- [ ] **Empty state:** Sin vacantes → card con `ClipboardList` icon, mensaje y botón "Crear Vacante".
- [ ] **Con datos:** La tabla muestra las vacantes en orden inverso (más recientes primero).

### Tabla de vacantes

- [ ] El ID se formatea como `Vac-001`, `Vac-002`, etc.
- [ ] La fecha de inicio se formatea correctamente en formato `DD/MM/YYYY`.
- [ ] Los badges de estado muestran el color correcto: azul (Activa), amarillo (Pausada), rojo (Cerrada).
- [ ] La columna "Posición" se oculta en viewports `< sm`.

### Acciones desde el menú kebab

- [ ] El clic en el ícono `MoreVertical` abre el dropdown de esa fila.
- [ ] Abrir el dropdown de otra fila cierra el anterior.
- [ ] Clic en cualquier parte fuera del dropdown (el wrapper del componente) lo cierra.
- [ ] **Editar vacante:** Clic → navega a `/vacancy/edit/{id}`.
- [ ] **Eliminar vacante:** Aparece `window.confirm()` → confirmar → la vacante desaparece. Cancelar → no pasa nada.
- [ ] **Marcar como Activa:** Abre `VacancyActionModal` con la acción correcta. Confirmar → `updateStatus` llamado → badge cambia a azul.
- [ ] **Pausar vacante:** Misma lógica → badge cambia a amarillo.
- [ ] **Cerrar vacante:** Misma lógica → badge cambia a rojo.
- [ ] Las opciones ya seleccionadas están `disabled` en el menú (ej. si ya está "Activa", "Marcar como Activa" está deshabilitado).

### Bug de kebab overflow

- [ ] **Reproducir bug:** Con 6+ vacantes, hacer clic en los 3 puntos de la última fila → el dropdown debe ser completamente visible.
- [ ] **Verificar fix:** El dropdown completo (5 opciones) es visible sin scroll ni recorte.
- [ ] **No regresión:** El dropdown de la primera fila sigue abriendo hacia abajo correctamente.

### Navegación a resultados

- [ ] Clic en botón "Resultados" → `localStorage.setItem("lastVacancyId", id)` → navega a `/advanced-results/{id}`.

### Responsive

- [ ] **375px mobile:** La tabla muestra ID, Título, Fecha, Estado, Ver y Acciones. No hay texto cortado crítico.
- [ ] **768px tablet:** Aparece la columna "Posición".
- [ ] **1280px desktop:** `max-w-5xl` centrado, tabla tiene proporciones correctas.
- [ ] Sin scroll horizontal innecesario en desktop.
