# Assetly
<img width="256" height="256" alt="icon2" src="https://github.com/user-attachments/assets/2180d49c-30d2-4bd9-8e5f-27a0d249fb4f" />

**Assetly** es una biblioteca web de assets para videojuegos. Permite a los usuarios explorar, descargar y subir recursos como sprites 2D, modelos 3D, audio, fuentes, shaders, etc.

---

## Tecnologías y arquitectura

### Stack principal

| Tecnología | Rol | Por qué |
|---|---|---|
| **Next.js** (App Router) | Framework frontend + routing | SSR nativo, rutas basadas en carpetas, Server Components para queries directas a Supabase sin exponer lógica al usuario |
| **TypeScript** | Tipado estático | Reduce errores en tiempo de desarrollo, mejora el autocompletado y hace el código más mantenible |
| **Supabase** | Base de datos con auth y storage | BaaS que provee Postgres, autenticación con sesiones, Row Level Security y almacenamiento de archivos |
| **Tailwind CSS** | Utilidades CSS | Clases utilitarias para layout y tipografía base |

### Arquitectura

La app sigue el modelo de App Router de Next.js con una separación clara entre Server y Client Components:

- **Server Components** (`page.tsx` de rutas protegidas): consultan Supabase directamente en el servidor, verifican sesión y redirigen si no hay autorización.
- **Client Components** (`'use client'`): manejan estado interactivo: filtros, búsqueda, paginación, formularios de upload y auth.
- **Proxy (middleware)**: intercepta requests y protege rutas `/upload`, `/admin` y `/asset/[id]/edit` redirigiendo a `/login` si no hay sesión activa.

### Base de datos

<img width="900" height="429" alt="image" src="https://github.com/user-attachments/assets/d27fabe2-44c4-4b7b-b786-0d89d272197d" />

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con policies explícitas:
- Cualquiera puede leer assets y perfiles
- Solo usuarios autenticados pueden subir assets
- Solo el dueño del asset o un admin puede editarlo o eliminarlo
- Solo admins pueden eliminar archivos del Storage

---

## Funcionalidades

- **Exploración pública**: listado de assets con búsqueda por nombre, filtro por categoría (2D, 3D, Audio, UI, Fuentes, Shaders), ordenamiento (más recientes, más descargas, A→Z, etc.) y paginación
- **Autenticación**: registro, login y logout con sesión persistente via Supabase Auth
- **Subida de assets**: formulario con nombre, descripción, categoría, archivo principal e imagen de preview
- **Descarga con contador**: cada descarga incrementa el contador via función RPC en Postgres
- **Detalle de asset**: vista individual con preview, metadata y botón de descarga
- **Edición y eliminación**: disponible para el dueño del asset o un administrador
- **Panel de administración**: listado completo con búsqueda, filtros, ordenamiento y eliminación (accesible solo para usuarios con `is_admin = true`)

---

## Herramientas de IA utilizadas

El uso de IA fue central en el desarrollo, tal como lo requiere el challenge.

### Claude (Anthropic) — Asistente principal de desarrollo

Claude fue el copiloto principal durante todo el proyecto. Se usó para:

- **Scaffolding inicial**: estructura de carpetas, configuración de Supabase con Next.js, setup del cliente browser/server y el proxy de autenticación
- **Generación de componentes**: cada página y componente fue desarrollado en colaboración. Yo definía el comportamiento esperado y los criterios de calidad, Claude generaba el código, y yo auditaba, integraba y corregía los problemas que surgían
- **Debugging**: errores de hidratación, conflictos de RLS, bugs de estado en React, problemas de CORS y configuración de Next.js
- **Decisiones de arquitectura**: Server vs Client Components, estructura de policies de RLS, manejo de sesión en middleware
- **Design system**: paleta de colores, variables CSS, animaciones, layout responsivo de cada vista
- **SQL**: schema de tablas, policies de RLS, triggers para creación automática de perfiles, función RPC para incremento de descargas

Mi rol fue guiar a Claude con criterio técnico: definir qué construir, en qué orden, detectar cuando el output generado tenía bugs o no se adaptaba al contexto del proyecto, e integrar las partes de forma coherente.

### ChatGPT / DALL-E — Generación del ícono

Se usó ChatGPT con DALL-E para generar el ícono de la aplicación.

---

## Instalación y ejecución local

### Requisitos

- Node.js
- Una cuenta en [Supabase](https://supabase.com)

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/alexxe1/assetly.git
cd assetly
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Estos valores se encuentran en Supabase -> Project Settings -> Data API.

**4. Configurar la base de datos**

En el SQL Editor de Supabase, ejecutar los scripts en este orden:

- `supabase/schema.sql` - crea las tablas `profiles` y `assets` con RLS
- `supabase/triggers.sql` - trigger para crear perfil automáticamente al registrarse
- `supabase/functions.sql` - función RPC `increment_download`
- `supabase/storage.sql` - policies del bucket `assets`

**5. Crear el bucket de Storage**

En Supabase -> Storage -> New bucket: crear un bucket llamado `assets` marcado como **Public**.

**6. Correr el servidor de desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Crear un usuario administrador

Registrarse normalmente desde la app y luego ejecutar en el SQL Editor:

- `supabase/make_admin.sql` - hacer administrador a la cuenta que desees

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Página principal (listado de assets)
│   ├── login/page.tsx        # Login
│   ├── register/page.tsx     # Registro
│   ├── upload/page.tsx       # Subida de assets
│   ├── asset/[id]/
│   │   ├── page.tsx          # Detalle del asset
│   │   ├── edit/page.tsx     # Edición del asset
│   │   ├── DownloadButton.tsx
│   │   └── DeleteAssetButton.tsx
│   └── admin/
│       ├── page.tsx          # Panel de administración
│       └── DeleteButton.tsx
├── components/
│   ├── Navbar.tsx
│   └── FooterLogo.tsx
└── lib/
    ├── supabase/
    │   ├── client.ts         # Cliente browser
    │   └── server.ts         # Cliente server
    └── categoryColors.ts     # Colores por categoría
```

---

## Decisiones técnicas destacadas

**¿Por qué inline styles en lugar de Tailwind puro?**
El design system usa variables CSS (`--accent`, `--surface`, `--border`, etc.) definidas en `globals.css`. Esto permite un control fino sobre la paleta sin depender del compilador de Tailwind para variables dinámicas.

**¿Por qué Server Components para las páginas protegidas?**
Las páginas como `/admin` y `/asset/[id]` verifican la sesión y los permisos en el servidor antes de renderizar. Esto evita flashes de contenido no autorizado y reduce el JS enviado al cliente.

**¿Por qué RPC para el contador de descargas?**
Usar una función SQL `increment_download` en lugar de un UPDATE directo desde el cliente evita race conditions cuando múltiples usuarios descargan simultáneamente, ya que Postgres maneja el incremento de forma atómica.
