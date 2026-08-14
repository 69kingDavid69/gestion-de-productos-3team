# Gestión de productos — Frontend (Angular 22)

Proyecto final del curso: SPA en Angular que consume la [API de Gestión de
Productos](../gestion-de-productos) (NestJS + PostgreSQL/Supabase + JWT).

Permite explorar un catálogo de productos, filtrarlo por categoría y
buscarlo, ver el detalle de cada producto, autenticarse, gestionar
productos/categorías, marcar favoritos y editar el perfil.

## Integrantes

- David (s4turn) — auth, login, registro, navbar
- jpgcano — catálogo, detalle de producto, gestión de productos/categorías, favoritos, perfil
- [Nombre]
- [Nombre]

## Tecnologías

- Angular 22 (standalone components, signals, `@if`/`@for`)
- TypeScript
- RxJS
- Formularios con `[(ngModel)]` (login/registro) y Reactive Forms (admin)
- CSS con variables (design tokens), sin frameworks de UI
- npm
- Vitest (unit tests)

## Cómo instalar

```bash
npm install
```

## Configuración de la API

La URL del backend se define en `src/environments/`:

- `environment.ts` (desarrollo, usado por `npm start`): `http://localhost:3000`
- `environment.prod.ts` (build de producción): `https://gestion-de-productos-three.vercel.app`

## Cómo ejecutar

```bash
npm start
```

Abrí `http://localhost:4200`. Necesitás el backend corriendo (local en
`localhost:3000`, o cambiar `environment.ts` para usar el desplegado).

## Build de producción

```bash
npm run build
```

## Tests

```bash
npm test
```

## URL de la API

- Producción: <https://gestion-de-productos-three.vercel.app>
- Documentación interactiva (Swagger): <https://gestion-de-productos-three.vercel.app/api/docs>

## Estructura del proyecto

```text
src/app/
├── pages/            # Home, Login, Register, Products, Categories, Favorites, Profile, ProductDetail
├── components/        # Navbar, Sidebar, Footer, ProductCard, Loading, SearchBar
├── services/          # AuthService, ProductService, CategoryService, FavoriteService, UserService
├── guards/            # authGuard (protege /products, /categories, /favorites, /profile)
├── interceptors/      # authInterceptor (agrega el JWT y maneja 401)
└── models/            # Interfaces TypeScript alineadas con la API
```

## Funcionalidades

- **Home** (pública): listado de productos, búsqueda y filtro por categoría.
- **Detalle de producto** (pública): galería, precio, stock, botón de favorito si hay sesión.
- **Login / Registro**: formularios con `[(ngModel)]`, guardan el JWT y redirigen.
- **Productos / Categorías** (protegidas): CRUD completo.
- **Favoritos** (protegida): agregar/quitar productos.
- **Perfil** (protegida): datos de la cuenta y cambio de contraseña.
- **Logout**: botón en el navbar, borra el token y redirige al Home.
- **Auth Guard** + **HTTP Interceptor**: rutas protegidas y JWT automático en cada request, con logout forzado en un 401.
