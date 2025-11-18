# Sistema de Inventario de Ropa - TODO

## Base de Datos
- [x] Crear tabla ROL (id, nombre, descripcion)
- [x] Crear tabla CATEGORIA (id, nombre)
- [x] Crear tabla PRODUCTO (id, sku, nombre, descripcion, precio_venta, stock_actual, categoria_id)
- [x] Crear tabla MOVIMIENTO (id, producto_id, tipo, cantidad, fecha_movimiento, usuario_id)
- [x] Extender tabla USUARIO con campos adicionales (activo, rol_id)
- [x] Generar script SQL de creación de tablas (db_schema.sql)

## Backend API (tRPC)
- [x] Implementar procedimientos para gestión de roles
- [x] Implementar procedimientos para gestión de usuarios (CRUD, activar/desactivar)
- [x] Implementar procedimientos para gestión de categorías (CRUD)
- [x] Implementar procedimientos para gestión de productos (CRUD)
- [x] Implementar procedimientos para control de stock (entrada/salida)
- [x] Implementar procedimientos para registro de movimientos de inventario
- [x] Implementar validaciones de negocio (stock no negativo, SKU único)
- [x] Implementar procedimientos protegidos con autenticación

## Frontend
- [x] Diseñar sistema de navegación con DashboardLayout
- [x] Crear página de inicio/dashboard con estadísticas
- [x] Crear página de gestión de categorías (lista, crear, editar, eliminar)
- [x] Crear página de gestión de productos (lista, crear, editar, eliminar)
- [x] Crear página de control de stock (registrar entradas/salidas)
- [x] Crear página de historial de movimientos
- [x] Crear página de gestión de usuarios (solo admin)
- [x] Implementar formularios con validación
- [x] Implementar tablas con búsqueda y paginación
- [x] Implementar estados de carga y manejo de errores
- [x] Aplicar diseño moderno con Tailwind CSS

## Docker y Despliegue
- [x] Crear Dockerfile para la aplicación
- [x] Crear docker-compose.yml para orquestar servicios
- [x] Configurar servicio de base de datos MySQL
- [x] Configurar servicio de aplicación web
- [x] Documentar comandos de despliegue

## Pruebas y Documentación
- [x] Probar flujo de autenticación
- [x] Probar CRUD de categorías
- [x] Probar CRUD de productos
- [x] Probar control de stock
- [x] Probar registro de movimientos
- [x] Verificar validaciones de negocio
- [x] Crear documentación de uso del sistema
