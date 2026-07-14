# Issue Plan — Panel Admin (`src/pages/AdminPanel.tsx`)

## Descripción general de la pantalla

El Panel de Administración permite gestionar usuarios del sistema: ver listado paginado, crear nuevos usuarios, cambiar roles y eliminar cuentas. Solo es visible para usuarios con `role === "ADMIN"` (el sidebar oculta el acceso a roles no-admin). La página está compuesta de módulos independientes: `StatsModule`, `UserTableModule`, `CreateUserModule`, `RoleUpdateModule`, `UserDeleteModule`.

---

## Arquitectura de datos

| Elemento | Fuente |
|---|---|
| Lista paginada de usuarios | `adminService.getUsers(page, 10)` → `{ users[], meta }` |
| Usuario autenticado (para header) | `useAuth()` → `user.username` |
| Estadísticas generales | `StatsModule` (tiene su propio fetch interno) |
| Crear usuario | `CreateUserModule` → callback `onCreated` re-fetch |
| Cambio de rol | `RoleUpdateModule` → callback `onSaved` re-fetch |
| Eliminación | `UserDeleteModule` → callback `onDeleted` re-fetch |

**Flujo de estado:**
1. `useEffect` llama a `fetchUsers(page)` al montar y en cada cambio de página.
2. `fetchUsers` es memoizado con `useCallback` para estabilidad en dependencias.
3. Cada módulo hijo que muta data llama su callback (`onCreated`, `onSaved`, `onDeleted`) → dispara `refetch()` que refresca la página actual.
4. La paginación se maneja en `UserTableModule` via `onPageChange(setPage)`.

---

## Issues identificados

### Bug crítico — Nombre de usuario en blanco

**Síntoma:** La línea `Sesión: <strong>{displayName}</strong>` muestra el marcador `—` o aparece en blanco.

**Causa probable:** La interfaz `User` en `src/types/api.types.ts` define `username: string` (línea 13), pero el token JWT decodificado que `AuthContext` guarda en `localStorage` bajo la clave `tm_user` puede contener el campo con un nombre distinto (ej. `name`, `email`, o sub-claim). Si la respuesta de login no incluye `username`, `user?.username` devuelve `undefined` y el operador `??` lo coerciona a `'—'`.

**Pasos para investigar:**
1. Hacer login y abrir DevTools → Application → localStorage → revisar el objeto `tm_user`.
2. Verificar si el campo `username` existe en el payload o si el backend usa otro nombre de campo.
3. Si el campo es diferente (ej. `name`), actualizar la interfaz `User` en `api.types.ts` y/o el `displayName` en `AdminPanel.tsx`.

**Nota:** Este mismo campo puede afectar la inicial del avatar en `Sidebar.tsx` (`user?.username || "Acme Corp"`).

### UI — Revisión de márgenes

1. **Header del panel:** `flex items-center gap-3` con ícono `Shield` en contenedor `w-9 h-9 rounded-xl bg-[#EFF6FF]`. Verificar alineación vertical con el texto a la derecha.
2. **Espaciado entre módulos:** `space-y-6` entre todos los módulos. Confirmar si en Figma existe un separador visual más pronunciado entre secciones o si `space-y-6` es suficiente.
3. **Badge "admin":** `text-[10px] px-2.5 py-1` con Shield `size={9}`. Verificar que se lea con claridad en todos los viewports.

### StatsModule

- Nota del CLAUDE.md: actualmente corre en un **temporizador simulado** y no está conectado a una API real de usuarios. Verificar si ya tiene endpoint propio o sigue siendo simulado.
- Si sigue siendo simulado, documentarlo como deuda técnica en los tests.

### Responsive design

- `max-w-4xl mx-auto` → en pantallas menores a 768px, los módulos apilan verticalmente.
- `UserTableModule`: la tabla de usuarios puede necesitar scroll horizontal en mobile.
- `RoleUpdateModule` y `UserDeleteModule`: verificar que los selectores de usuario no se corten en pantallas angostas.

---

## Tests a realizar

### Bug de nombre de usuario

- [ ] **Reproducir bug:** Hacer login con un usuario admin → navegar a `/admin` → verificar si `displayName` muestra el nombre correcto o `—`.
- [ ] **Inspeccionar localStorage:** Confirmar la estructura del objeto `tm_user` y qué campos devuelve el backend.
- [ ] **Verificar sidebar:** La inicial del avatar en Sidebar también usa `user?.username` — el fix debe aplicarse en ambos lugares de forma consistente.

### Carga y paginación de usuarios

- [ ] Al cargar la página debe mostrarse el spinner mientras `isLoading === true`.
- [ ] Si hay error en `getUsers()`, aparece el banner rojo con "No se pudo cargar la lista de usuarios."
- [ ] Con datos: la tabla `UserTableModule` muestra la lista paginada (10 por página).
- [ ] La paginación funciona: avanzar de página 1 → 2 → volver a 1 y verificar re-fetch.
- [ ] El total de páginas (`meta.totalPages`) coincide con la cantidad real de usuarios.

### Crear usuario

- [ ] Llenar el formulario en `CreateUserModule` con datos válidos → el usuario aparece en la tabla tras el re-fetch.
- [ ] Intentar crear usuario con email duplicado → debe mostrarse error del backend.
- [ ] Campos requeridos vacíos → no se envía el formulario.

### Cambio de rol

- [ ] Seleccionar un usuario en `RoleUpdateModule` y cambiar de USER → ADMIN → guardar → el rol se refleja en `UserTableModule`.
- [ ] No se puede cambiar el rol del propio usuario admin activo (validar si existe esta restricción).

### Eliminar usuario

- [ ] Seleccionar usuario en `UserDeleteModule` → confirmar eliminación → el usuario desaparece de la tabla.
- [ ] Intentar eliminar al usuario actualmente autenticado → debe bloquearse o mostrar advertencia.

### StatsModule

- [ ] Verificar si muestra datos reales o simulados (temporizador).
- [ ] Si es simulado, documentar como pendiente de conexión a API.

### Responsive

- [ ] **Mobile (375px):** Todos los módulos apilan, tabla tiene scroll horizontal si es necesario.
- [ ] **Tablet (768px):** Verificar que los selectores de rol/delete no se desborden.
- [ ] **Desktop (1280px):** Layout con `max-w-4xl` centrado, sin espacios vacíos excesivos.

### Seguridad de acceso

- [ ] Navegar a `/admin` con un usuario con `role === "USER"` → debe redirigir o mostrar acceso denegado (verificar si `ProtectedRoute` maneja esto o solo el sidebar oculta el enlace).
