# 🏪 MV Inventario - Sistema de Gestión de Inventario de Ropa

Un sistema completo y moderno para gestionar el inventario de una tienda de ropa, con dashboard intuitivo, reportes en Excel/CSV, y control de movimientos de inventario en tiempo real.

## ✨ Características

- ✅ Dashboard responsivo y moderno
- ✅ Sistema de autenticación seguro
- ✅ Gestión de productos (crear, editar, eliminar)
- ✅ Control de inventario (entradas y salidas)
- ✅ Reportes en Excel y CSV
- ✅ Modo oscuro/claro
- ✅ Indicadores de stock bajo
- ✅ Accesibilidad mejorada
- ✅ Diseño responsivo (móvil, tablet, desktop)

## 🛠️ Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Docker Desktop** - [Descargar](https://www.docker.com/products/docker-desktop)
- **Git** - [Descargar](https://git-scm.com/download/win)
- **Node.js** (opcional, si quieres trabajar con el código) - [Descargar](https://nodejs.org/)

## 🚀 Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/Fabian20077/Inventario-ropa.git
cd Inventario-ropa
```

### 2. Instalar dependencias

```bash
npm install --legacy-peer-deps
```

### 3. Iniciar los contenedores

```bash
docker-compose up -d
```

Espera 2-3 minutos a que los contenedores levanten completamente.

### 4. Acceder al sistema

Abre tu navegador en:

```
http://localhost:8081
```

## 📝 Credenciales de Acceso

```
Email: admin@mv.com
Contraseña: password123
```

## 📊 Puertos Disponibles

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Dashboard) | 8081 | http://localhost:8081 |
| Backend API | 3000 | http://localhost:3000 |
| MySQL Database | 3307 | localhost:3307 |

## 🎯 Funcionalidades Principales

### Dashboard
- Estadísticas en tiempo real (Total de productos, stock, categorías, movimientos)
- Productos recientes con indicador de stock
- Movimientos recientes
- Acceso rápido a funciones principales

### Gestión de Productos
- Crear nuevos productos
- Editar información
- Eliminar productos
- Ver stock disponible
- Establecer stock mínimo

### Movimientos de Inventario
- Registrar entradas (compras)
- Registrar salidas (ventas)
- Historial de movimientos
- Detalles de cada movimiento
- Opción para eliminar movimientos

### Reportes
- Exportar productos a Excel
- Exportar productos a CSV
- Exportar movimientos a Excel
- Exportar movimientos a CSV

### Interfaz
- Modo oscuro/claro
- Diseño responsivo para móviles
- Interfaz intuitiva y moderna
- Animaciones suaves

## 🔧 Comandos Útiles

### Ver estado de los contenedores
```bash
docker-compose ps
```

### Ver logs del servidor
```bash
docker-compose logs app
```

### Ver logs de la base de datos
```bash
docker-compose logs db
```

### Reiniciar los contenedores
```bash
docker-compose restart
```

### Detener los contenedores
```bash
docker-compose down
```

### Limpiar todo y empezar de cero
```bash
docker-compose down -v
docker-compose up -d --build
```

## 🐛 Solución de Problemas

### El proyecto no abre en http://localhost:8081

1. Verifica que Docker esté corriendo:
```bash
docker-compose ps
```

2. Si no aparecen los contenedores, reinicia:
```bash
docker-compose restart
```

3. Espera 2-3 minutos a que levante completamente

### Error: "Puerto 8081 ya está en uso"

Cambia el puerto en `docker-compose.yml`:
```yaml
ports:
  - "8082:80"  # Usa 8082 en lugar de 8081
```

### No puedo entrar con las credenciales

Verifica que la base de datos haya inicializado correctamente:
```bash
docker-compose logs db
```

### Debo regenerar node_modules

```bash
rm -r node_modules
npm install --legacy-peer-deps
docker-compose restart
```

## 📁 Estructura del Proyecto

```
inventario-ropa/
├── Frontend/                 # Interfaz web
│   ├── dashboard.html       # Dashboard principal
│   ├── login.html          # Página de login
│   └── app.js              # Lógica del frontend
├── config/                  # Configuración
│   └── database.js         # Conexión a MySQL
├── dao/                     # Data Access Objects
│   ├── ProductoDAO.js
│   └── UsuarioDAO.js
├── routes/                  # Rutas de API
│   └── reportes.js
├── server.js               # Servidor principal
├── docker-compose.yml      # Configuración Docker
├── Dockerfile              # Imagen del backend
└── README.md              # Este archivo
```

## 🔐 Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt
- Autenticación por token JWT
- Validación de datos en backend
- CORS configurado

## 🎨 Tecnologías Utilizadas

### Frontend
- HTML5
- CSS3 (Tailwind CSS)
- JavaScript vanilla
- Bootstrap Icons

### Backend
- Node.js
- Express.js
- MySQL
- bcryptjs

### DevOps
- Docker
- Docker Compose
- Nginx

## 📈 Próximas Mejoras

- [ ] Búsqueda y filtros avanzados
- [ ] Resumen financiero (ingresos/gastos)
- [ ] Gráficos de ventas
- [ ] Notificaciones por email
- [ ] Autenticación con 2FA
- [ ] Múltiples usuarios con roles

## 👨‍💻 Autor

Desarrollado por **Fabian Pilonieta**

## 📞 Soporte

Si encuentras problemas:

1. Revisa la sección "Solución de Problemas"
2. Consulta los logs: `docker-compose logs app`
3. Verifica que Docker esté correctamente instalado

## 📄 Licencia

Este proyecto es educativo y está disponible para uso académico.

---

**¡Disfruta gestionando tu inventario! 🚀**

Para más información, visita el repositorio: https://github.com/Fabian20077/Inventario-ropa
