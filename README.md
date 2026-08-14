# Sistema de Gestión de Productos

Proyecto final del curso. Aplicación web completa para administrar un catálogo
de productos: autenticación con JWT, categorías, productos con imágenes,
búsqueda, favoritos y perfil de usuario.

El repositorio contiene el backend (NestJS) y el frontend (Angular) en carpetas
separadas.

## Integrantes

| Integrante | Responsabilidad |
| --- | --- |
| David (s4turn) | Backend, autenticación, login/registro, navbar |
| jpgcano | Catálogo, detalle de producto, CRUD de productos/categorías, favoritos, perfil |
| [Nombre] | |
| [Nombre] | |

## Estructura del repositorio

```text
.
├── gestion-de-productos/   # Backend — NestJS + TypeORM + PostgreSQL (Supabase)
├── fronted/                # Frontend — Angular 22 (SPA)
├── stitch/                 # Mockups de referencia usados como guía visual
└── .github/workflows/      # CI del frontend (build + tests en cada push)
```

## Stack

**Backend:** NestJS, TypeORM, PostgreSQL (Supabase), JWT (Passport), Swagger
**Frontend:** Angular 22 (standalone components, signals, `@if`/`@for`), RxJS, CSS con design tokens, Vitest
**Infra:** Docker + nginx para el frontend, GitHub Actions para CI, Vercel para el deploy del backend

## Enlaces

- API en producción: <https://gestion-de-productos-three.vercel.app>
- Documentación interactiva (Swagger): <https://gestion-de-productos-three.vercel.app/api/docs>
- Guía de endpoints para frontend: [FRONTEND_GUIDE.md](gestion-de-productos/FRONTEND_GUIDE.md)

## Cómo levantar el proyecto

### 1. Backend

```bash
cd gestion-de-productos
npm install
cp .env.example .env        # completar DATABASE_URL y JWT_SECRET
npm run migration:run       # crea las tablas (solo la primera vez)
npm run start:dev           # http://localhost:3000
```

Detalle completo en [gestion-de-productos/README.md](gestion-de-productos/README.md).

### 2. Frontend

```bash
cd fronted
npm install
npm start                   # http://localhost:4200
```

La URL de la API se configura en `fronted/src/environments/environment.ts`.
Por defecto apunta a la API desplegada, así que el frontend funciona aunque no
tengas el backend corriendo localmente.

Detalle completo en [fronted/README.md](fronted/README.md).

### 3. (Opcional) Cargar datos de ejemplo

```bash
cd gestion-de-productos
node scripts/seed.mjs                                                    # contra localhost:3000
API_URL=https://gestion-de-productos-three.vercel.app node scripts/seed.mjs   # contra el deploy
```

Crea 5 categorías y 15 productos. Es idempotente: si lo corrés dos veces no
duplica nada.

## Pantallas

| Pantalla | Acceso | Endpoints que usa |
| --- | --- | --- |
| Home (listado + búsqueda + filtro) | Pública | `GET /products`, `GET /categories` |
| Detalle de producto | Pública | `GET /products/:id`, `POST`/`DELETE /favorites/:productId` |
| Login / Registro | Pública | `POST /auth/login`, `POST /auth/register` |
| Productos (CRUD) | Requiere sesión | `GET`/`POST`/`PATCH`/`DELETE /products` |
| Categorías (CRUD) | Requiere sesión | `GET`/`POST`/`PATCH`/`DELETE /categories` |
| Favoritos | Requiere sesión | `GET`/`POST`/`DELETE /favorites` |
| Perfil | Requiere sesión | `GET /users/me`, `PATCH /users/me/password` |

## Arquitectura del frontend

- **Componentes** — presentacionales (`ProductCard`, `SearchBar`, `Sidebar`, `Loading`) y de layout (`Navbar`, `Footer`).
- **Páginas** — componentes contenedores, uno por ruta, cargados con lazy loading.
- **Servicios** — toda la comunicación HTTP; los componentes nunca llaman a `HttpClient` directamente.
- **Guard** (`authGuard`) — bloquea las rutas privadas y redirige al login conservando el `returnUrl`.
- **Interceptor** (`authInterceptor`) — agrega el `Bearer` token a cada request y fuerza logout ante un 401.
- **Modelos** — interfaces TypeScript alineadas con los DTOs de la API.

## Tests

```bash
cd fronted && npm test      # 35 tests unitarios (servicios, guard, interceptor, componentes)
```

## Docker

```bash
cd fronted
docker build -t gestion-productos-front .
docker run -p 8080:80 gestion-productos-front
```
