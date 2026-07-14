# Issue Plan — Historial de Candidatos (`src/pages/CandidatesHistory.tsx`)

## Descripción general de la pantalla

Muestra todos los candidatos del sistema agrupados por vacante. Cada grupo es un acordeón expandible (`VacancyGroup`) que lista las filas de candidatos con avatar, nombre, email, fecha de subida, estado (Contratado/Disponible) y link al CV. Los candidatos se obtienen indirectamente a través de las vacantes (que incluyen `candidates[]` en su respuesta).

---

## Arquitectura de datos

| Elemento | Fuente |
|---|---|
| Vacantes con candidatos anidados | `vacanciesApi.getAll()` → `Vacancy[]` (cada vacante incluye `candidates[]`) |
| Filtrado de vacantes con candidatos | `useMemo` → filtra `vacancies` donde `candidates.length > 0` |
| Conteo total de candidatos | `useMemo` → suma de `candidates.length` por vacante |
| Navegación a resultados | `navigate(\`/advanced-results/${id}\`)` |

**Flujo de estado:**
1. `useEffect` con cleanup (`cancelled` flag) dispara `vacanciesApi.getAll()` al montar.
2. Se filtran solo vacantes con candidatos para mostrar en pantalla.
3. El acordeón de cada `VacancyGroup` es independiente — estado `open` local al componente.
4. No hay paginación; carga todos los candidatos en una sola petición.

**Nota de diseño:** La pantalla no usa `GET /candidates` directamente (que sería plano y sin agrupación por vacante). Usa `GET /vacancies` que incluye candidatos anidados — esto es correcto para la vista agrupada.

---

## Issues identificados

### UI — Revisión de márgenes

1. **Header:** El subtítulo muestra `X candidatos · Y vacantes` con `text-sm text-gray-400 mt-0.5`. Verificar tamaño y peso de fuente contra Figma.
2. **VacancyGroup card:** `border border-gray-100 rounded-xl` — el resto de la app usa `rounded-2xl` en cards. Confirmar si `rounded-xl` es correcto para este componente sub-card.
3. **Filas de candidato:** `px-5 py-3` — verificar padding vertical con Figma.
4. **Avatar del grupo (vacante):** `w-8 h-8 rounded-lg` — confirmar tamaño.
5. **Avatar del candidato:** `w-8 h-8 rounded-full` — confirmar tamaño y que la paleta de colores es consistente.

### Posible bug — Comparación de status con mayúsculas/minúsculas

**Síntoma:** El badge "Contratado" podría no aparecer aunque el candidato tenga status de contratado.

**Causa:** La lógica es `candidate.status === "CONTRATADO"` (en mayúsculas), pero si el backend devuelve `"Contratado"` (capitalizado) o `"contratado"` (minúsculas), la comparación falla y siempre muestra "Disponible".

**Verificación:** Revisar qué valor devuelve el backend en `candidate.status` para candidatos contratados.

### Accesibilidad — 3 puntos/hover en mobile

- El ícono de `ExternalLink` (ver resultados de vacante) tiene `p-1.5 rounded-lg hover:bg-[#DCF9FF]` y es siempre visible. ✓ Correcto.
- El link de "Ver CV" (`Eye`) tiene `opacity-0 group-hover:opacity-100` — en touch devices nunca aparece porque no hay hover. Esto puede impedir que usuarios mobile vean el CV.

### Responsive design

- El campo `niche` del candidato está oculto en mobile (`hidden sm:block`) — aceptable pero verificar que la fila no quede vacía.
- Sin paginación — si una organización tiene cientos de candidatos, la lista puede ser muy larga. Pendiente de decidir si se agrega paginación o virtual scroll.
- El acordeón `VacancyGroup` abre por defecto (`useState(true)`). Con muchas vacantes en mobile puede ser muy largo. Considerar cerrar por defecto.

---

## Tests a realizar

### Carga y estados

- [ ] **Spinner de carga:** `Loader2` centrado en card blanco durante la carga.
- [ ] **Error de red:** Simular fallo → banner rojo "No pudimos cargar los candidatos."
- [ ] **Empty state (sin candidatos):** Todas las vacantes sin candidatos → muestra card con `Users` icon y mensaje "Sin candidatos aún".
- [ ] **Con datos:** Se muestran todos los grupos de vacantes que tienen al menos un candidato.

### Acordeón VacancyGroup

- [ ] Por defecto el acordeón está **abierto** (`open = true`).
- [ ] Clic en el header del grupo → colapsa la lista de candidatos.
- [ ] Clic de nuevo → vuelve a expandirse.
- [ ] Tecla Enter en el header también abre/cierra (accesibilidad con `onKeyDown`).
- [ ] El contador de candidatos en el header es correcto.

### Filas de candidato

- [ ] El nombre del candidato se resuelve correctamente: `fullName` > `firstName + lastName` > `email`.
- [ ] Las iniciales del avatar se generan de las primeras dos palabras del nombre.
- [ ] El email se muestra truncado con `truncate` si es largo.
- [ ] La fecha "Subido: DD/MM/YYYY" se formatea correctamente.
- [ ] Candidatos con `status === "CONTRATADO"` muestran badge verde "Contratado".
- [ ] Candidatos sin ese status muestran badge gris "Disponible".
- [ ] **Bug de status:** Confirmar que la comparación de mayúsculas coincide con el valor real del backend.

### Link al CV

- [ ] Si el candidato tiene `fileUrl`, el ícono `Eye` aparece al hacer hover en la fila.
- [ ] Clic en `Eye` abre el CV en nueva pestaña.
- [ ] Si no tiene `fileUrl`, el ícono no aparece.
- [ ] En mobile (sin hover): verificar si el CV es accesible de alguna manera.

### Navegación a resultados

- [ ] Clic en el botón `ExternalLink` de la cabecera del grupo → navega a `/advanced-results/{vacancyId}`.
- [ ] `stopPropagation()` funciona: el clic en `ExternalLink` no colapsa el acordeón.

### Responsive

- [ ] **375px mobile:** Filas de candidato no se cortan. El `niche` oculto no deja espacio vacío.
- [ ] **768px tablet:** El acordeón se ve correctamente. Avatar + nombre + email en una sola línea o dos líneas bien formateadas.
- [ ] **1280px desktop:** `max-w-4xl` centrado, filas alineadas.
- [ ] Con 50+ candidatos en una vacante, la lista es scrolleable sin problemas.
