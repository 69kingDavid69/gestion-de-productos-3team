# Proyecto Final · Frontend Angular 22 — Sistema de Gestión de Productos

## 🎯 Objetivo del reto

Desarrollar, en equipos, una aplicación web en **Angular 22** que consuma la API de Gestión de Productos construida durante el curso.

El proyecto busca demostrar que comprenden cómo integrar **componentes, rutas, servicios, autenticación, guards e interceptores** dentro de una aplicación real, organizada y funcional.

> **Importante:** Se evaluará la comprensión de Angular, no la complejidad del diseño visual.

---

# 👥 Equipos

* Grupos de **4 coders**.
* Todos los integrantes deben participar en el desarrollo.
* El historial de Git debe evidenciar trabajo distribuido entre los cuatro.

---

# 📅 Cronograma

| Día           | Objetivo                                       |
| ------------- | ---------------------------------------------- |
| **Lunes**     | Planeación del proyecto y estructura Angular   |
| **Martes**    | Pantallas públicas y consumo inicial de la API |
| **Miércoles** | Autenticación, servicios y guards              |
| **Jueves**    | CRUD y funcionalidades protegidas              |
| **Viernes**   | Presentación final                             |

---

# 🧩 Funcionalidades obligatorias

## 1. Home (Pública)

Será la página principal de la aplicación.

Debe incluir:

* Listado de productos.
* Barra de búsqueda.
* Filtro por categorías.
* Indicador de carga mientras consulta la API.

### Endpoints

```text
GET /products
GET /products?search=
GET /categories
```

### Conceptos evaluados

* Components
* Services
* @for
* @if
* Property Binding
* Event Binding

---

## 2. Detalle de producto (Pública)

Al seleccionar un producto desde el Home se debe abrir su página de detalle.

Debe mostrar:

* Nombre
* Descripción
* Precio
* Stock
* Categoría
* Imágenes

### Endpoint

```text
GET /products/:id
```

**Si el usuario inició sesión**, debe aparecer un botón para agregar o quitar de favoritos.

```text
POST   /favorites/:productId
DELETE /favorites/:productId
```

---

## 3. Login y Registro

Dos pantallas independientes.

### Login

```text
POST /auth/login
```

### Registro

```text
POST /auth/register
```

### Requisitos

* Formularios con `[(ngModel)]`
* Validación básica antes de enviar
* Guardar el JWT recibido
* Redireccionar correctamente al finalizar

---

## 4. Productos (Protegida)

Pantalla administrativa.

Debe permitir:

* Listar productos
* Crear producto
* Editar producto
* Eliminar producto

### Endpoints

```text
GET    /products
POST   /products
PATCH  /products/:id
DELETE /products/:id
```

No es necesario implementar paginación.

---

## 5. Categorías (Protegida)

Debe permitir administrar categorías.

### Funcionalidades

* Listar
* Crear
* Editar
* Eliminar

### Endpoints

```text
GET    /categories
POST   /categories
PATCH  /categories/:id
DELETE /categories/:id
```

---

## 6. Favoritos (Protegida)

Debe mostrar únicamente los productos favoritos del usuario autenticado.

### Endpoint

```text
GET /favorites
```

Debe reutilizar el mismo componente de tarjeta de producto usado en Home.

---

## 7. Perfil (Protegida)

Debe mostrar la información del usuario autenticado.

### Endpoints

```text
GET   /users/me
PATCH /users/me/password
```

Debe incluir un formulario para cambiar la contraseña.

---

## 8. Logout

No será una página.

Debe existir un botón visible en el Navbar o Sidebar.

Debe realizar:

```text
POST /auth/logout
```

Luego:

* eliminar el JWT local
* limpiar la sesión
* redirigir al Home

---

# 🔐 Autenticación y seguridad

## Route Guard

Las siguientes rutas deben estar protegidas mediante un **Auth Guard**.

```text
/products
/categories
/favorites
/profile
```

Si un usuario intenta acceder manualmente a cualquiera de ellas sin iniciar sesión:

```text
http://localhost:4200/profile
```

Debe ser redirigido automáticamente a:

```text
/login
```

> El Guard protege únicamente la navegación del frontend. La API continúa validando el JWT.

---

## HTTP Interceptor

La aplicación debe utilizar un interceptor para agregar automáticamente el token JWT.

El componente o servicio **no debe escribir manualmente**:

```text
Authorization: Bearer ...
```

El interceptor debe hacerlo por todos.

Además, si la API responde:

```text
401 Unauthorized
```

Debe:

1. eliminar el token
2. redirigir al login

---

# 🧱 Arquitectura esperada

Se recomienda una estructura similar a esta.

```text
src/app/

├── pages/
│   ├── home/
│   ├── login/
│   ├── register/
│   ├── products/
│   ├── categories/
│   ├── favorites/
│   └── profile/
│
├── components/
│   ├── layout/
│   │   ├── navbar/
│   │   ├── sidebar/
│   │   └── footer/
│   │
│   └── ui/
│       ├── product-card/
│       ├── loading/
│       └── search-bar/
│
├── services/
│   ├── auth.service.ts
│   ├── product.service.ts
│   └── category.service.ts
│
├── guards/
│   └── auth.guard.ts
│
├── interceptors/
│   └── auth.interceptor.ts
│
├── models/
│
├── app.routes.ts
├── app.config.ts
└── app.ts
```

No es obligatorio copiar exactamente esta estructura, pero sí mantener una separación clara de responsabilidades.

---

# 📚 Requisitos técnicos

| Tema                | Evidencia esperada                                               |
| ------------------- | ---------------------------------------------------------------- |
| **Pages**           | Home, Login, Register, Products, Categories, Favorites y Profile |
| **Componentes**     | Navbar, Sidebar, Footer, ProductCard, Loading y SearchBar        |
| **Data Binding**    | Uso de los 4 tipos de binding                                    |
| **Two-way Binding** | Formularios con `[(ngModel)]`                                    |
| **Directivas**      | Uso de `@if` y `@for` con `track`                                |
| **Rutas**           | Navegación completa mediante Angular Router                      |
| **Services**        | Toda comunicación HTTP vive en Services                          |
| **DI moderna**      | Uso de `inject()` cuando corresponda                             |
| **Pipes**           | `currency`, `date` u otro pipe integrado                         |
| **Guards**          | Protección de rutas privadas                                     |
| **Interceptor**     | JWT automático y manejo de 401                                   |

---

# 🧠 Buenas prácticas esperadas

Se espera que el proyecto tenga:

* Componentes pequeños y reutilizables.
* Services dedicados a la comunicación con la API.
* Nombres claros para métodos y variables.
* Separación entre Pages y Components.
* Manejo básico de errores.
* Estados de carga visibles.
* Evitar manipulación manual del DOM (`document.getElementById`, etc.).

---

# ⚠️ Manejo de errores

Los errores de la API deben mostrarse al usuario.

Como mínimo deben manejar:

| Código | Acción esperada                   |
| ------ | --------------------------------- |
| 400    | Mostrar mensaje de validación     |
| 401    | Redirigir al Login                |
| 404    | Informar que el recurso no existe |
| 409    | Mostrar conflicto (duplicados)    |

No basta con imprimir el error en consola.

---

# 📦 Entregables

## Repositorio Git

Debe contener:

* Código fuente
* Historial de commits
* README

## README mínimo

* Nombre del proyecto
* Integrantes
* Tecnologías utilizadas
* Cómo instalar
* Cómo ejecutar
* URL de la API

---

# 🎤 Presentación (10–12 minutos)

Cada equipo deberá demostrar el siguiente flujo completo:

1. Registro o Login
2. Navegación entre páginas
3. Búsqueda de productos
4. Crear un producto
5. Editar un producto
6. Agregar un favorito
7. Acceder al perfil
8. Cerrar sesión
9. Intentar entrar nuevamente a una ruta protegida (debe actuar el Guard)

Todos los integrantes deberán explicar al menos una parte del código.

---

# 📊 Rúbrica de evaluación (100 puntos)

| Criterio                                      | Puntos |
| --------------------------------------------- | :----: |
| Arquitectura y organización del proyecto      | **20** |
| Consumo correcto de la API mediante Services  | **20** |
| Navegación, Guards e Interceptor              | **20** |
| CRUD y funcionamiento general                 | **25** |
| Presentación, comprensión y trabajo en equipo | **15** |

---

# 🚫 No es necesario implementar

Para mantener el reto alcanzable, **NO se exige**, pero habrá bonus para quien haga:

* NgRx o Redux
* Formularios reactivos
* Refresh Tokens
* Lazy Loading
* Unit Tests
* Docker
* CI/CD
* Animaciones
* Arquitecturas complejas (DDD, Clean, Hexagonal)

La prioridad es construir una aplicación Angular **clara, funcional y bien organizada**.

---

# 🎯 Resultado esperado

Al finalizar el proyecto, cada equipo debería poder explicar este flujo completo:

```text
Usuario
   │
   ▼
Angular Page
   │
   ▼
Data Binding
   │
   ▼
Angular Router
   │
   ▼
Auth Guard
   │
   ▼
Service
   │
   ▼
HTTP Interceptor
   │
   ▼
JWT
   │
   ▼
NestJS API
```

Si pueden explicar qué responsabilidad tiene cada una de esas piezas, habrán alcanzado el objetivo del proyecto.

Github: https://github.com/carlosdcastano/gestion-de-productos.git
