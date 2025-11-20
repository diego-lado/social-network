# Social Network

Una aplicación de red social construida con React, TypeScript y Radix UI.

## Características

- ✅ Lista de posts con diseño responsive
- ✅ Vista detallada de posts con comentarios
- ✅ Sistema de comentarios anidados (árbol)
- ✅ CRUD completo para Posts y Comentarios
- ✅ Sistema de notificaciones con toasts (Radix UI)
- ✅ Manejo de errores con feedback visual al usuario
- ✅ Estados de carga (LoadingState, LoadingOverlay)
- ✅ Diseño moderno y responsive con Tailwind CSS
- ✅ Componentes accesibles con Radix UI
- ✅ Gestión de estado con React Query
- ✅ Optimización de peticiones al backend
- ✅ Code splitting con lazy loading
- ✅ Infinite scroll para posts
- ✅ Manejo de formularios con React Hook Form
- ✅ Cliente HTTP con Axios

## Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite 7** - Build tool
- **Radix UI** - Componentes headless accesibles
- **Tailwind CSS 4** - Estilos utilitarios
- **React Router 7** - Navegación
- **React Query (TanStack Query)** - Gestión de estado del servidor
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **Vitest** - Testing
- **Docker** - Containerización
- **Nginx** - Servidor web para producción

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Ejecutar tests
npm test
```

## Docker

```bash
# Construir la imagen (con variable de entorno opcional)
docker build --build-arg VITE_API_BASE_URL=https://665de6d7e88051d60408c32d.mockapi.io -t social-network .

# O usar el valor por defecto del .env
docker build -t social-network .

# Ejecutar el contenedor
docker run -p 8080:80 social-network
```

La aplicación estará disponible en `http://localhost:8080`

### Variables de Entorno

El proyecto usa variables de entorno para configuración. Crea un archivo `.env` en la raíz del proyecto:

```bash
# .env
VITE_API_BASE_URL=https://665de6d7e88051d60408c32d.mockapi.io
```

**Variables disponibles:**
- `VITE_API_BASE_URL`: URL base de la API (default: https://665de6d7e88051d60408c32d.mockapi.io)

**Para producción:**
- **Docker**: Usa `--build-arg VITE_API_BASE_URL=...` al construir la imagen
- **GitHub Pages**: Configura `VITE_API_BASE_URL` en los secrets del repositorio
- **Otros servicios**: Configura las variables de entorno según la plataforma

## Estructura del Proyecto

```
src/
├── components/          # Componentes de la aplicación
│   ├── __tests__/      # Tests de componentes
│   ├── CommentForm.tsx
│   ├── CommentFormModal.tsx
│   ├── CommentItem.tsx
│   ├── CommentTree.tsx
│   ├── PostCard.tsx
│   └── PostForm.tsx
├── pages/              # Páginas de la aplicación
│   ├── PostDetail.tsx
│   └── PostsList.tsx
├── services/           # Servicios de API
│   ├── __tests__/      # Tests del servicio API
│   │   └── api.test.ts
│   └── api.ts         # Cliente API con Axios
├── shared/             # Componentes y utilidades compartidas
│   ├── icons/          # Iconos SVG
│   ├── layout/         # Componentes de layout
│   └── ui/             # Componentes UI reutilizables
│       ├── Button.tsx
│       ├── ConfirmDialog.tsx
│       ├── ErrorState.tsx
│       ├── FormField.tsx
│       ├── Input.tsx
│       ├── LoadingOverlay.tsx
│       ├── LoadingState.tsx
│       ├── OptionsMenu.tsx
│       ├── Textarea.tsx
│       ├── Toast.tsx
│       ├── ToastContext.tsx
│       ├── ToastProvider.tsx
│       └── useToast.ts
├── styles/             # Estilos globales
│   └── index.css
├── test/               # Configuración de tests
│   └── setup.ts
├── types/              # Definiciones TypeScript
│   └── index.ts
└── utils/              # Utilidades y helpers
    ├── __tests__/      # Tests de utilidades
    ├── commentTree.ts
    └── date.ts
```

## API

La aplicación consume la API de MockAPI usando **Axios** como cliente HTTP:
- Base URL: `https://665de6d7e88051d60408c32d.mockapi.io`

### Endpoints

**Posts:**
- `GET /post` - Obtener todos los posts (con paginación y ordenamiento)
- `GET /post/:id` - Obtener un post específico
- `POST /post` - Crear un post
- `PUT /post/:id` - Actualizar un post
- `DELETE /post/:id` - Eliminar un post

**Comentarios:**
- `GET /post/:id/comment` - Obtener comentarios de un post
- `POST /post/:id/comment` - Crear un comentario
- `PUT /post/:id/comment/:commentId` - Actualizar un comentario
- `DELETE /post/:id/comment/:commentId` - Eliminar un comentario

### Cliente HTTP (Axios)

El proyecto utiliza **Axios** como cliente HTTP con las siguientes características:

- ✅ Instancia configurada con `baseURL` y headers por defecto
- ✅ Manejo automático de errores HTTP
- ✅ Transformación automática de JSON
- ✅ Soporte para parámetros de query

## Tests

El proyecto incluye tests unitarios para:
- ✅ Utilidades (`utils/date.ts`, `utils/commentTree.ts`)
- ✅ Componentes (`components/PostCard.tsx`)
- ✅ Servicio API (`services/api.ts`) - 30 tests cubriendo todos los métodos

```bash
# Ejecutar tests
npm test

# Tests con UI
npm run test:ui

# Ejecutar tests específicos
npm test -- src/services/__tests__/api.test.ts

# Linting
npm run lint
```

## Analisis de Lighthouse

![Lighthouse Analisis](https://i.postimg.cc/7hL82KSv/lighthouse-analysis.png)

