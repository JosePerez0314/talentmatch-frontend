# 🐞 Inventario de Bugs — TalentMatch Frontend

> **Premisa:** el backend está terminado y correcto. Por lo tanto **todos los ítems de este documento son responsabilidad del frontend** (el front consume/mapea mal un backend que sí funciona, o directamente no está conectado).
>
> Barrido realizado sobre **todas las rutas** definidas en `src/App.tsx`. Fecha: 2026-07-04.

## Estado de conexión por ruta

| Ruta                       | Estado       | Nota                                      |
| -------------------------- | ------------ | ----------------------------------------- |
| `/login`                   | ✅ Conectado | OK                                        |
| `/dashboard`               | ❌ 100% mock | `MOCK_DATA` + no responsive               |
| `/position`                | ⚠️ Bug       | Dropdown de departamentos vacío + IA      |
| `/uploadcv`                | ✅ Conectado | OK                                        |
| `/cv-history`              | ✅ Conectado | OK                                        |
| `/position-history`        | ✅ Conectado | OK                                        |
| `/vacancy` (+ `/edit/:id`) | ⚠️ Bug       | Navega a ruta inexistente `/history`      |
| `/vacancy-history`         | ✅ Conectado | OK                                        |
| `/department`              | ✅ Conectado | OK                                        |
| `/department-history`      | ✅ Conectado | OK                                        |
| `/resultados/:id`          | ⚠️ Bug       | Estado `FILLED` inválido + parsing frágil |
| `/candidates-history`      | ❌ 100% mock | Acciones = `alert()`                      |
| `/evaluations-history`     | ❌ 100% mock | Botón "Calcular" sin acción               |
| `/advanced-results/:id`    | ❌ 100% mock | Todos los botones inertes                 |
| `/admin`                   | ❌ 100% mock | Loader simulado, sin API de usuarios      |

---

## 1. Bugs funcionales críticos

### 1.1 — Vacancy navega a una ruta que no existe (`/history`)

- **Archivo:** `src/pages/Vacancy.tsx:183` y `:202`
- **Detalle:** usa `navigate("/history")` al volver del historial y tras el éxito en modo edición. Esa ruta **no está registrada** en `App.tsx` (la real es `/vacancy-history`), así que cae en el comodín `*` y rebota a `/dashboard`.
- **Fix:** reemplazar `/history` por `/vacancy-history`.

### 1.2 — Dropdown de departamentos vacío en "Nueva Posición"

- **Archivo:** `src/pages/Position.tsx:51-62` (fetch) y `:247-249` (render)
- **Detalle:** hace fetch crudo con `apiClient('/departments')` en vez de usar `departmentsApi.getAll()`. La extracción `Array.isArray(res) ? res : res?.data` **no contempla la forma real** que sí maneja el servicio (`res.response.data`), y renderiza `dept.id` / `dept.name` cuando el backend entrega `_id` / `title`. Resultado: lista vacía o con etiquetas en blanco.
- **Fix:** usar `departmentsApi.getAll()` (ya normaliza `id`/`name`) y eliminar el fetch manual.

### 1.3 — Autocompletar con IA no funciona

- **Archivo:** `src/pages/Position.tsx:88-117` + `src/services/api/positions.api.ts:52-61`
- **Detalle:** `completeWithAI` hace `POST /positions/complete` con `FormData` (campo `file`) y `processWithAI` asume que la respuesta es un `Partial<CreatePositionInput>` plano. Como el backend es correcto, la falla está en el **front**: alinear el nombre del campo del archivo y el parsing de la respuesta al contrato real (posible envelope anidado como en departamentos).
- **Fix:** verificar contra el contrato real el nombre del campo (`file`) y desempaquetar la respuesta igual que el resto de servicios.

### 1.4 — Estado de vacante `FILLED` inválido

- **Archivo:** `src/pages/Resultados.jsx:62`
- **Detalle:** al contratar llama `vacanciesApi.updateStatus(id, "FILLED")`, pero el tipo `VacancyStatus` del front es `ACTIVE | PAUSED | CLOSED`. `"FILLED"` no está contemplado → el cambio no se refleja de forma consistente con el resto de la app (VacancyHistory usa `CLOSED`).
- **Fix:** unificar el valor (enviar `CLOSED`, o agregar `FILLED` al union tipado si ese es el estado válido del backend).

### 1.5 — Desempaquetado frágil de resultados

- **Archivo:** `src/pages/Resultados.jsx:30`
- **Detalle:** valida `response.status === "success"`, pero `apiClient` ya desenvuelve `.data` y el envelope usa `success`, no `status`. El chequeo casi nunca es verdadero; funciona solo por los fallbacks posteriores.
- **Fix:** alinear el parsing a la forma real que retorna `getResults` tras pasar por `apiClient`.

### 1.6 — Sidebar: "Administración" mal ubicado y con ícono equivocado

- **Archivo:** `src/layouts/Sidebar.tsx:55-60`
- **Detalle:** está en el último grupo ("CONFIGURACIÓN") y usa `Icons.sidebar.dashboard` (el mismo ícono que Dashboard). Según el mockup debe ir **de primero** y con **ícono propio** (ej. `Shield`).
- **Fix:** mover el item de admin al primer grupo del menú y asignarle un ícono distintivo.

### 1.7 — Pantalla de éxito de vacante muestra un código fijo

- **Archivo:** `src/components/Sections/VacancySuccess.jsx:7` + `src/pages/Vacancy.tsx:177-188`
- **Detalle:** `VacancySuccess` usa `vacancyCode = "Vac-009"` por defecto, y `Vacancy.tsx` lo renderiza **sin pasarle** `vacancyCode`. Siempre muestra "Vac-009" sin importar la vacante creada.
- **Fix:** pasar el código/ID real de la vacante creada al componente de éxito.

---

## 2. Pantallas sin conectar (100% mock)

### 2.1 — Dashboard

- **Archivo:** `src/pages/Dashboard.tsx:9-28`
- **Detalle:** toda la data proviene de `MOCK_DATA`. No usa `dashboardService.getSummary()`. Métricas, gráfica y estados de vacantes son ficticios.

### 2.2 — Resultados Avanzados

- **Archivo:** `src/pages/AdvancedResults.tsx:20-25, 125`
- **Detalle:** usa `MOCK_RESULTS`, `useParams` fue removido, y los botones "Compartir", "Recalcular MatchScore" y "Ver perfil" no hacen nada. Título/depto/código hardcodeados.

### 2.3 — Historial de Candidatos

- **Archivo:** `src/pages/CandidatesHistory.tsx:5-22`
- **Detalle:** `MOCK_VACANCIES`. Todas las acciones son `alert()`. El cargo se muestra hardcodeado como "Frontend Developer" (`:124`). No usa `candidateService`.

### 2.4 — Evaluaciones

- **Archivo:** `src/pages/EvaluationsHistory.tsx:16-53` + `src/components/EvaluationCard.tsx:63`
- **Detalle:** `MOCK_EVALUATIONS`. El botón "Calcular" de cada tarjeta **no tiene `onClick`**. La ruta `/evaluations-history/:id` recibe `:id` pero nunca se usa.

### 2.5 — Panel de Administración

- **Archivo:** `src/pages/AdminPanel.tsx:11-15` + `src/components/admin/*`
- **Detalle:** loader simulado con `setTimeout`. Los módulos usan `mockUsers` (`UserTableModule.tsx:6`), el buscador de usuarios no tiene `onChange`, y **no existe** una API de usuarios (`users.api.ts`). Roles/eliminar/stats no están conectados.

---

## 3. UI / UX / Responsive

### 3.1 — Dashboard no se adapta a pantallas pequeñas

- **Archivo:** `src/pages/Dashboard.tsx:49, 79`
- **Detalle:** padding fijo y `min-h-[350px] xl:min-h-[450px]` rígidos dentro de un `<main>` con `overflow-y-auto`. En pantallas de baja altura el contenido desborda y obliga a scrollear (los márgenes "se dañan").
- **Fix:** revisar el layout responsive (alturas flexibles, breakpoints, evitar `min-h` fijos).

### 3.2 — Tarjetas de métricas del Dashboard sin navegación ("accesos rápidos")

- **Archivo:** `src/components/cards/MetricCard.tsx` + `src/pages/Dashboard.tsx:63-72`
- **Detalle:** cada `MetricCard` dibuja una flecha "→" que sugiere navegación, pero no tiene `onClick` ni enlace. Ningún acceso rápido del dashboard funciona.
- **Fix:** definir el destino de cada tarjeta y conectarlas (o implementar la sección de accesos rápidos del mockup).
- **Pendiente de confirmar:** exactamente qué son los "accesos rápidos" esperados.

### 3.3 — Estados de candidato inconsistentes entre pantallas

- **Archivos:** `src/components/ui/StatusDropdown.jsx:9` vs `src/pages/AdvancedResults.tsx:8, 92`
- **Detalle:** en resultados los estados son `"No contratado" | "Contratado" | "Contactar"`, y en AdvancedResults `"No Contratado" | "Contactado" | "Contratado"`. Difieren en el texto ("Contactar" vs "Contactado") y en el casing ("No contratado" vs "No Contratado").
- **Fix:** unificar los valores de estado en toda la app.

### 3.4 — Ícono de mostrar/ocultar contraseña invertido

- **Archivo:** `src/components/ui/LoginForm.tsx:58`
- **Detalle:** cuando la contraseña está visible muestra `Eye` (abierto) y cuando está oculta muestra `EyeOff`; la convención habitual es la inversa.
- **Fix:** intercambiar los íconos.

---

## 4. Calidad de código / menores

- **4.1 — Rama de error muerta:** `src/pages/CreateDepartment.tsx:34` maneja un error con propiedad `serverData` que `apiClient` nunca agrega (solo lanza `Error` con mensaje). Ese bloque nunca se ejecuta.
- **4.2 — Código muerto tras `export`:** `src/pages/Login.tsx:98-109` deja un bloque JSX/comentario después de `export default`.
- **4.3 — `any` explícito:** `src/pages/Position.tsx:38` usa `useState<any[]>` para departamentos, rompiendo la regla `@typescript-eslint/no-explicit-any` (marcada como _error_).
- **4.4 — `console.log`/`alert` de depuración:** quedan en `CreateDepartment.tsx`, `AdvancedResults.tsx`, `Resultados.jsx` (console) y varias pantallas usan `alert()` como placeholder de acciones reales.
- **4.5 — Estado individual del candidato no se persiste:** al cambiar el estado en resultados solo se actualiza el UI local (y, si es "Contratado", el estado de la vacante). No hay endpoint/servicio para persistir el estado por candidato (ver nota en `candidates.api.ts`).

---

## Resumen ejecutivo

| Categoría                     | Cantidad |
| ----------------------------- | -------- |
| Bugs funcionales críticos     | 7        |
| Pantallas sin conectar (mock) | 5        |
| UI / UX / Responsive          | 4        |
| Calidad / menores             | 5        |

**Prioridad sugerida:** 1) rutas y flujos rotos (§1), 2) conectar pantallas mock a la API (§2), 3) responsive y consistencia (§3), 4) limpieza (§4).
