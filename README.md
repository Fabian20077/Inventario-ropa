# Sistema de Inventario de Ropa

Sistema completo de gestión de inventario de ropa con autenticación, CRUD de productos, control de stock y registro de movimientos.

## Características

### Funcionalidades Principales

- **Autenticación y Autorización**: Sistema de login con OAuth de Manus, roles de usuario (admin/usuario)
- **Gestión de Categorías**: CRUD completo de categorías de productos
- **Gestión de Productos**: CRUD completo con SKU único, precio, stock y categorización
- **Control de Stock**: Registro de entradas y salidas con validación de stock disponible
- **Historial de Movimientos**: Registro completo de todos los movimientos de inventario
- **Gestión de Usuarios**: Panel de administración para gestionar usuarios (solo admin)
- **Dashboard**: Estadísticas y resumen del inventario

### Tecnologías Utilizadas

#### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- tRPC para comunicación tipo-segura con el backend
- Wouter para enrutamiento
- Shadcn/UI para componentes

#### Backend
- Node.js 22
- Express 4
- tRPC 11 para API tipo-segura
- Drizzle ORM para base de datos
- MySQL 8.0

#### Despliegue
- Docker y Docker Compose
- Multi-stage builds para optimización

## Estructura de Base de Datos

### Tablas

1. **users**: Usuarios del sistema con autenticación OAuth
2. **roles**: Roles del sistema (admin, usuario)
3. **categorias**: Categorías de productos
4. **productos**: Productos del inventario con SKU, precio y stock
5. **movimientos**: Registro de entradas y salidas de inventario

Ver `db_schema.sql` para el esquema completo.

## Instalación y Configuración

### Requisitos Previos

- Node.js 22+
- pnpm
- MySQL 8.0 (o usar Docker)

### Instalación Local

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   pnpm install
   ```

3. Configurar variables de entorno (ver `.env.example`)

4. Ejecutar migraciones de base de datos:
   ```bash
   pnpm db:push
   ```

5. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

La aplicación estará disponible en `http://localhost:3000`

### Despliegue con Docker

1. Construir y ejecutar los contenedores:
   ```bash
   docker-compose up -d
   ```

2. La aplicación estará disponible en `http://localhost:3000`

3. Para detener los contenedores:
   ```bash
   docker-compose down
   ```

4. Para ver logs:
   ```bash
   docker-compose logs -f app
   ```

### Configuración de Variables de Entorno

Editar `docker-compose.yml` y actualizar:

- `MYSQL_ROOT_PASSWORD`: Contraseña de root de MySQL
- `MYSQL_PASSWORD`: Contraseña del usuario de la base de datos
- `JWT_SECRET`: Clave secreta para JWT
- `OWNER_OPEN_ID`: OpenID del propietario/administrador principal
- Otras variables según necesidad

## Uso del Sistema

### Roles y Permisos

- **Admin**: Acceso completo a todas las funcionalidades incluyendo gestión de usuarios
- **Usuario**: Acceso a gestión de categorías, productos y movimientos

### Flujo de Trabajo Típico

1. **Login**: Autenticarse con OAuth de Manus
2. **Crear Categorías**: Definir categorías de productos (ej: Camisas, Pantalones)
3. **Registrar Productos**: Agregar productos con SKU, nombre, precio y categoría
4. **Registrar Movimientos**: 
   - **Entrada**: Agregar stock (compras, devoluciones)
   - **Salida**: Reducir stock (ventas, pérdidas)
5. **Monitorear**: Ver dashboard con estadísticas y movimientos recientes

### Validaciones de Negocio

- SKU único por producto
- Stock no puede ser negativo
- No se pueden eliminar categorías con productos asociados
- No se pueden eliminar productos con movimientos registrados

## Estructura del Proyecto

```
inventario-ropa/
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # Páginas de la aplicación
│   │   ├── components/ # Componentes reutilizables
│   │   └── lib/        # Utilidades y configuración
├── server/              # Backend Express + tRPC
│   ├── routers.ts      # Definición de procedimientos tRPC
│   ├── db.ts           # Funciones de base de datos
│   └── _core/          # Configuración del framework
├── drizzle/             # Esquema y migraciones de DB
│   └── schema.ts       # Definición de tablas
├── Dockerfile           # Configuración de Docker
├── docker-compose.yml   # Orquestación de servicios
└── db_schema.sql        # Script SQL de inicialización
```

## API (tRPC)

### Endpoints Principales

#### Categorías
- `categorias.list`: Listar todas las categorías
- `categorias.create`: Crear nueva categoría
- `categorias.update`: Actualizar categoría
- `categorias.delete`: Eliminar categoría (solo admin)

#### Productos
- `productos.list`: Listar todos los productos
- `productos.create`: Crear nuevo producto
- `productos.update`: Actualizar producto
- `productos.delete`: Eliminar producto (solo admin)

#### Movimientos
- `movimientos.list`: Listar todos los movimientos
- `movimientos.registrar`: Registrar entrada/salida de stock

#### Usuarios (Solo Admin)
- `usuarios.list`: Listar usuarios
- `usuarios.updateStatus`: Activar/desactivar usuario
- `usuarios.updateRole`: Cambiar rol de usuario

## Desarrollo

### Scripts Disponibles

- `pnpm dev`: Iniciar servidor de desarrollo
- `pnpm build`: Construir para producción
- `pnpm db:push`: Aplicar cambios de esquema a la base de datos
- `pnpm lint`: Ejecutar linter

### Agregar Nuevas Funcionalidades

1. Actualizar esquema en `drizzle/schema.ts`
2. Ejecutar `pnpm db:push`
3. Agregar funciones helper en `server/db.ts`
4. Crear procedimientos tRPC en `server/routers.ts`
5. Implementar UI en `client/src/pages/`

## Soporte y Contribuciones

Para reportar problemas o sugerir mejoras, por favor crear un issue en el repositorio.

## Licencia

Este proyecto está bajo licencia MIT.
