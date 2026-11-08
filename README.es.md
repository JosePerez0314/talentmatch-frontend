TalentMatch AI — Frontend
=========================

[🇬🇧 English](./README.md) · 🇪🇸 Español

SPA tipo dashboard para equipos de RRHH y reclutadores: sube CVs, gestiona vacantes y obtén un ranking de candidatos explicable asistido por IA. Repo del backend: [talentmatch-backend](https://github.com/JosePerez0314/talentmatch-backend/).

---

Qué hace
--------

- **Gestión de la jerarquía:** CRUD completo de **Departamentos → Posiciones → Vacantes**, incluyendo los requisitos de la posición (skills técnicas, soft skills, idiomas, años de experiencia, educación), duplicación de posiciones y edición mediante rutas compartidas (`/vacancy/edit/:id`, `/position/edit/:id`).
- **Subida masiva de CVs:** envía hasta 100 PDFs (máx. 5 MB c/u) a una vacante y muestra el resultado por archivo.
- **Evaluación explícita + ranking explicable:** la evaluación es un paso separado de la subida. Los resultados muestran el puntaje 0–100 de cada candidato con su desglose, y el reclutador cambia el estado de cada aplicación (`PENDIENTE`, `EN_PROCESO`, `SELECCIONADO`, `RECHAZADO`) con actualizaciones optimistas.
- **Dashboard e historiales:** métricas por usuario y tablas de historial de CVs, candidatos, posiciones, vacantes, departamentos y evaluaciones (los resultados se pueden copiar como imagen).
- **Panel de administración (rol `ADMIN`):** estadísticas globales, lista paginada de usuarios, creación de usuarios, cambio de rol y eliminación.

Arquitectura
------------

```
Usuario ──► Navegador (SPA React, Vite)
                │  fetch + Authorization: Bearer <JWT>
                ▼
          API Express (/api) ──► MySQL (Prisma)
                ├──► OpenAI API   (texto del CV → perfil estructurado)
                └──► Cloudinary   (almacenamiento de PDFs)
```

El frontend solo habla con la API Express. Subir CVs envía una petición `multipart/form-data` (campo `pdfs`) a `POST /vacancies/:id/upload`; el backend extrae y estructura cada perfil. Después el reclutador lanza `POST /vacancies/:id/evaluations` y lee el ranking en `GET /vacancies/:id/results`. Los puntajes los calcula un motor determinístico en el backend: la IA nunca los asigna.

Stack tecnológico
-----------------

| Área | Tecnología |
| --- | --- |
| UI | React 19.2 |
| Lenguaje | TypeScript 6 (migración JS → TS en curso) |
| Build / servidor dev | Vite 5.4 + `vite-plugin-checker` (los errores de tipos hacen fallar `dev` y `build`) |
| Estilos | Tailwind CSS 4.2 (`@tailwindcss/vite`) |
| Routing | react-router-dom 7.13 |
| Estado global | React Context (`AuthContext`) |
| HTTP | Cliente `fetch` propio (`apiClient.ts`) |
| Iconos | lucide-react, react-icons, SVGs locales |
| Otros | html-to-image (copiar resultados como imagen) |
| Lint | ESLint 9 + typescript-eslint |

Primeros pasos
--------------

**Prerrequisitos:** Node.js 20+ y un backend en ejecución.

```bash
git clone https://github.com/JosePerez0314/talentmatch-frontend.git
cd talentmatch-frontend
npm install
cp .env.example .env     # luego edita VITE_API_URL si hace falta
```

1. Levanta el backend siguiendo su [README](https://github.com/JosePerez0314/talentmatch-backend/#getting-started). En local escucha en `http://localhost:3000`.
2. Asegúrate de que `http://localhost:5173` esté en el `ALLOWED_ORIGINS` del backend.
3. Corre el frontend:

```bash
npm run dev
```

La app se sirve en `http://localhost:5173`. El puerto es estricto: si está ocupado, Vite falla en vez de moverse a otro, porque un origen distinto rompería en silencio la whitelist de CORS del backend.

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite con chequeo de tipos en el mismo proceso |
| `npm run build` | Build de producción (falla ante errores de tipos) |
| `npm run lint` | ESLint |
| `npm run preview` | Sirve el `dist/` generado |

Variables de entorno
--------------------

| Nombre | Qué es | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API del backend, incluyendo el prefijo `/api`. Obligatoria: no hay valor por defecto. | `http://localhost:3000/api` |

> ⚠️ **Toda variable `VITE_*` se incrusta en el bundle del navegador y es públicamente legible.** Nunca pongas secretos, claves de API ni credenciales en ellas. Los archivos `.env` reales están ignorados por git; solo se versiona `.env.example`.

Estructura del proyecto
-----------------------

```
src/
├── pages/            # Pantallas por ruta (Login, Dashboard, Vacancy, Resultados, AdminPanel…)
├── components/
│   ├── admin/        # Módulos del panel admin (stats, tabla de usuarios, roles, borrado, creación)
│   ├── cards/        # Tarjetas de métricas y candidatos
│   ├── context/      # AuthContext (useAuth)
│   ├── modals/       # Diálogos reutilizables
│   ├── routes/       # Guard AdminRoute
│   ├── Sections/     # Secciones de página y pantallas de éxito
│   └── ui/           # Inputs, formulario de login, SessionTimeoutGuard…
├── layouts/          # Sidebar, Footer
├── services/
│   ├── api/          # apiClient + un servicio *.api.ts por dominio
│   └── session.ts    # Utilidades de sesión en localStorage
├── types/            # Contratos de la API (*.types.ts)
├── utils/
└── assets/icons/
docs/                 # Documentación bilingüe (en/, es/)
```

Integración con el backend
--------------------------

- **Auth:** el login devuelve un JWT. El token y el usuario (`tm_user`) se guardan en `localStorage`; `apiClient` inyecta `Authorization: Bearer <token>` en cada petición excepto en las rutas públicas (`/users/login`, `/users`). Un usuario sin token (o con el usuario guardado corrupto) se trata como sesión cerrada.
- **Expiración / 401:** un 401 en una petición autenticada limpia la sesión y redirige a `/login`. Un 401 en el login se muestra como error del formulario. Además, `SessionTimeoutGuard` avisa a los 9 minutos de inactividad y cierra sesión a los 10.
- **Rate limit (429):** el cliente reintenta hasta 3 intentos con backoff exponencial y jitter, respetando `Retry-After`.
- **Envoltorio de respuesta:** `apiClient` desempaqueta `{ success, data }`; `{ success: false, error, details? }` o cualquier estado no OK lanza un `ApiError` que la UI puede capturar (los errores de validación traen `details[]`).
- **CORS:** el backend usa whitelist de orígenes; el origen del frontend debe estar en su `ALLOWED_ORIGINS` (`http://localhost:5173` en local).
- **Aislamiento por tenant:** los recursos de otro usuario devuelven `404`, no `403`.
- **Subida de archivos:** `FormData` con una entrada `pdfs` por archivo; el boundary del `Content-Type` lo define el navegador.

Decisiones de diseño y tradeoffs
--------------------------------

**React Context en lugar de Redux o una librería de datos.** El único estado realmente global es la sesión, así que `AuthContext` basta; lo demás es `useState`/`useEffect` local por pantalla. Esto mantiene las dependencias al mínimo y el flujo de datos fácil de seguir. El costo: no hay caché de peticiones, deduplicación ni estado de servidor compartido; las pantallas vuelven a pedir los datos al montarse.

**Cliente `fetch` propio.** `apiClient.ts` centraliza la URL base, el token, el desempaquetado del envoltorio, `ApiError`, el cierre de sesión por 401 y el backoff de 429 en un archivo pequeño, sin añadir Axios. El costo es que interceptores, cancelación o reintentos para otros estados hay que escribirlos a mano.

**Un objeto de servicio por dominio.** Los componentes nunca llaman a `fetch`; llaman a servicios (`vacanciesApi`, `departmentsApi`…) que además normalizan las formas del backend (p. ej. `_id` estilo Mongo → `id`). Esto aísla los cambios de contrato de la UI, a cambio de algo de código defensivo de mapeo.

**Utilidades de Tailwind v4 en línea, sin librería de componentes.** Los estilos viven en el JSX, con un conjunto pequeño de componentes `ui/` y modales reutilizables. Es rápido de iterar, pero no hay un sistema de design tokens y algunos valores arbitrarios (`bg-[#F0F0F5]`) se repiten.

**Pantallas compartidas mediante parámetros de URL.** Crear y editar reutilizan la misma página (`Vacancy`, `Position`) y se bifurcan con `useParams`. Evita duplicar formularios, pero las páginas cargan la lógica de ambos modos.

**Migración progresiva JS → TS y tipado estricto en build.** El código nuevo es TypeScript con los contratos en `src/types/`, y `vite-plugin-checker` hace que los errores de tipos fallen `dev` y `build`. Quedan algunos `.jsx` legacy. Los formularios son componentes controlados simples sin librería de validación; los errores `details[]` del backend son la fuente de verdad.

Tests
-----

No hay test runner configurado. Los cambios se verifican con `npm run build` (chequeo de tipos), `npm run lint` y QA manual en el servidor de desarrollo.

Estado
------

- **Hecho:** todas las pantallas están conectadas a la API real (auth, dashboard, departamentos, posiciones, vacantes, subida de CVs, evaluaciones, estado de candidatos, panel admin).
- **Pendiente:** algunos bugs menores y archivos `.jsx` legacy (ver [`docs/es/bugs.md`](./docs/es/bugs.md)), tests automatizados y el resto de la migración JS → TS.
- **Qué haría distinto:** empezar con **Next.js** en lugar de una SPA con Vite, para tener de entrada routing, layouts, renderizado en servidor y una capa de datos más estructurada, en vez de construir muchas de esas piezas desde cero.

Documentación
-------------

- [Documentación del frontend](./docs/es/front-documentation.md)
- [Contrato de la API](./docs/es/api-documentation.md)
- [Bugs conocidos](./docs/es/bugs.md) · [Issues](./docs/es/issues.md) · [Changelog](./docs/es/last-changes.md)
- Versiones en inglés en [`docs/en/`](./docs/en/).

Equipo
------

| Nombre | Rol |
| --- | --- |
| **José Gabriel Pérez Calcaño** — [LinkedIn](https://www.linkedin.com/in/im-jose/) | Tech Lead. Arquitectura, backend completo y supervisión del trabajo del equipo. |
| Justin Antonio Sánchez Melo | Frontend |
| Bryam Smith Pérez Hernández | Prompts de IA y apoyo en frontend |

Licencia
--------

Privado / propietario. Todos los derechos reservados.
