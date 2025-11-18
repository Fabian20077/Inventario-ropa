import http from 'http';
import { testConnection, query } from './config/database.js';
import UsuarioDAO from './dao/UsuarioDAO.js';
import ProductoDAO from './dao/ProductoDAO.js';
import ReportesService from './routes/reportes.js';

const PORT = 3000;

// Helper para parsear body
const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
    });
};

// Middleware de autenticación simple
const authenticateToken = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    return token != null;
};

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check
    if (req.url === '/api/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', database: 'connected' }));
        return;
    }

    // ==================== AUTENTICACIÓN ====================
    
    // Login con BCrypt
    if (req.url === '/api/auth/login' && req.method === 'POST') {
        try {
            const { email, password } = await parseBody(req);
            const resultado = await UsuarioDAO.autenticar(email, password);
            
            if (resultado.success) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Login exitoso',
                    user: resultado.usuario,
                    token: 'Bearer_' + Date.now() + '_' + Math.random().toString(36)
                }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: resultado.message
                }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error en el servidor'
            }));
        }
        return;
    }

    // Registro de usuario
    if (req.url === '/api/auth/register' && req.method === 'POST') {
        try {
            const usuario = await parseBody(req);
            const resultado = await UsuarioDAO.crear(usuario);
            
            res.writeHead(resultado.success ? 201 : 400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resultado));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al crear usuario'
            }));
        }
        return;
    }

    // ==================== PRODUCTOS ====================
    
    // Listar productos
    if (req.url === '/api/productos' && req.method === 'GET') {
        try {
            const productos = await ProductoDAO.listar();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: productos
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al obtener productos'
            }));
        }
        return;
    }

    // Crear producto
    if (req.url === '/api/productos' && req.method === 'POST') {
        try {
            if (!authenticateToken(req)) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
                return;
            }

            const producto = await parseBody(req);
            const resultado = await ProductoDAO.crear(producto);
            
            res.writeHead(resultado.success ? 201 : 400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resultado));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al crear producto'
            }));
        }
        return;
    }

    // Actualizar producto
    if (req.url.startsWith('/api/productos/') && req.method === 'PUT') {
        try {
            if (!authenticateToken(req)) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
                return;
            }

            const id = req.url.split('/')[3];
            const datos = await parseBody(req);
            const resultado = await ProductoDAO.actualizar(id, datos);
            
            res.writeHead(resultado.success ? 200 : 404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resultado));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al actualizar producto'
            }));
        }
        return;
    }

    // Eliminar producto (soft delete)
    if (req.url.startsWith('/api/productos/') && req.method === 'DELETE') {
        try {
            if (!authenticateToken(req)) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
                return;
            }

            const id = req.url.split('/')[3];
            const resultado = await ProductoDAO.eliminar(id);
            
            res.writeHead(resultado.success ? 200 : 404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resultado));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al eliminar producto'
            }));
        }
        return;
    }

    // ==================== CATEGORÍAS ====================
    
    if (req.url === '/api/categorias' && req.method === 'GET') {
        try {
            const sql = 'SELECT * FROM categoria WHERE activo = TRUE ORDER BY nombre';
            const categorias = await query(sql);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: categorias
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al obtener categorías'
            }));
        }
        return;
    }

    // ==================== MOVIMIENTOS ====================
    
    // Listar movimientos
    if (req.url === '/api/movimientos' && req.method === 'GET') {
        try {
            const sql = `
                SELECT 
                    m.id,
                    m.tipo,
                    m.cantidad,
                    m.motivo,
                    m.fecha,
                    p.codigo,
                    p.nombre as producto_nombre,
                    u.nombre as usuario_nombre
                FROM movimientos_inventario m
                LEFT JOIN producto p ON m.id_producto = p.id
                LEFT JOIN usuario u ON m.usuario_id = u.id
                ORDER BY m.fecha DESC
                LIMIT 50
            `;
            
            const movimientos = await query(sql);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: movimientos
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al obtener movimientos'
            }));
        }
        return;
    }

    // Registrar entrada
    if (req.url === '/api/movimientos/entrada' && req.method === 'POST') {
        try {
            if (!authenticateToken(req)) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
                return;
            }

            const { id_producto, cantidad, motivo, usuario_id } = await parseBody(req);
            
            // Insertar movimiento
            const sqlMovimiento = `
                INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo, usuario_id)
                VALUES (?, 'entrada', ?, ?, ?)
            `;
            await query(sqlMovimiento, [id_producto, cantidad, motivo || 'Entrada de inventario', usuario_id || 1]);
            
            // Actualizar stock del producto
            await ProductoDAO.actualizarStock(id_producto, cantidad, 'entrada');
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Entrada registrada exitosamente'
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al registrar entrada'
            }));
        }
        return;
    }

    // Registrar salida
    if (req.url === '/api/movimientos/salida' && req.method === 'POST') {
        try {
            if (!authenticateToken(req)) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
                return;
            }

            const { id_producto, cantidad, motivo, usuario_id } = await parseBody(req);
            
            // Verificar stock disponible
            const producto = await ProductoDAO.buscarPorId(id_producto);
            if (!producto) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Producto no encontrado'
                }));
                return;
            }
            
            if (producto.cantidad < cantidad) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: `Stock insuficiente. Disponible: ${producto.cantidad}`
                }));
                return;
            }
            
            // Insertar movimiento
            const sqlMovimiento = `
                INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo, usuario_id)
                VALUES (?, 'salida', ?, ?, ?)
            `;
            await query(sqlMovimiento, [id_producto, cantidad, motivo || 'Salida de inventario', usuario_id || 1]);
            
            // Actualizar stock del producto
            await ProductoDAO.actualizarStock(id_producto, cantidad, 'salida');
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Salida registrada exitosamente'
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al registrar salida'
            }));
        }
        return;
    }

   
   // Eliminar movimiento
if (req.url.startsWith('/api/movimientos/') && req.method === 'DELETE') {
    try {
        if (!authenticateToken(req)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
            return;
        }

        const id = req.url.split('/')[3];
        
        // Obtener info del movimiento antes de eliminarlo
        const sqlGet = 'SELECT id_producto, tipo, cantidad FROM movimientos_inventario WHERE id = ?';
        const movimientos = await query(sqlGet, [id]);
        
        if (movimientos.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Movimiento no encontrado'
            }));
            return;
        }
        
        const movimiento = movimientos[0];
        
        // Revertir el stock directamente con SQL
        const operador = movimiento.tipo === 'entrada' ? '-' : '+';
        const sqlRevertir = `UPDATE producto SET cantidad = cantidad ${operador} ? WHERE id = ?`;
        await query(sqlRevertir, [movimiento.cantidad, movimiento.id_producto]);
        
        // Eliminar el movimiento
        const sqlDelete = 'DELETE FROM movimientos_inventario WHERE id = ?';
        await query(sqlDelete, [id]);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: 'Movimiento eliminado y stock revertido'
        }));
    } catch (error) {
        console.error('Error al eliminar movimiento:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            message: 'Error al eliminar movimiento'
        }));
    }
    return;
}
    // ==================== ESTADÍSTICAS ====================
    
    if (req.url === '/api/stats' && req.method === 'GET') {
        try {
            const productos = await ProductoDAO.listar();
            const totalStock = productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
            
            const sqlCategorias = 'SELECT COUNT(*) as total FROM categoria WHERE activo = TRUE';
            const categorias = await query(sqlCategorias);
            
            const sqlMovimientos = 'SELECT COUNT(*) as total FROM movimientos_inventario';
            const movimientos = await query(sqlMovimientos);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: {
                    totalProductos: productos.length,
                    stockTotal: totalStock,
                    totalCategorias: categorias[0]?.total || 0,
                    totalMovimientos: movimientos[0]?.total || 0
                }
            }));
        } catch (error) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: {
                    totalProductos: 0,
                    stockTotal: 0,
                    totalCategorias: 0,
                    totalMovimientos: 0
                }
            }));
        }
        return;
    }

    // ==================== REPORTES ====================
    
    // Exportar productos a CSV
    if (req.url === '/api/reportes/productos/csv' && req.method === 'GET') {
        try {
            const resultado = await ReportesService.exportarProductosCSV();
            
            res.writeHead(200, {
                'Content-Type': resultado.contentType,
                'Content-Disposition': `attachment; filename="${resultado.filename}"`
            });
            res.end(resultado.data);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al exportar productos a CSV'
            }));
        }
        return;
    }

    // Exportar productos a Excel
    if (req.url === '/api/reportes/productos/excel' && req.method === 'GET') {
        try {
            const resultado = await ReportesService.exportarProductosExcel();
            
            res.writeHead(200, {
                'Content-Type': resultado.contentType,
                'Content-Disposition': `attachment; filename="${resultado.filename}"`
            });
            res.end(resultado.data);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al exportar productos a Excel'
            }));
        }
        return;
    }

    // Exportar movimientos a CSV
    if (req.url === '/api/reportes/movimientos/csv' && req.method === 'GET') {
        try {
            const resultado = await ReportesService.exportarMovimientosCSV();
            
            res.writeHead(200, {
                'Content-Type': resultado.contentType,
                'Content-Disposition': `attachment; filename="${resultado.filename}"`
            });
            res.end(resultado.data);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al exportar movimientos a CSV'
            }));
        }
        return;
    }

    // Exportar movimientos a Excel
    if (req.url === '/api/reportes/movimientos/excel' && req.method === 'GET') {
        try {
            const resultado = await ReportesService.exportarMovimientosExcel();
            
            res.writeHead(200, {
                'Content-Type': resultado.contentType,
                'Content-Disposition': `attachment; filename="${resultado.filename}"`
            });
            res.end(resultado.data);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al exportar movimientos a Excel'
            }));
        }
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
});

// Iniciar servidor
server.listen(PORT, async () => {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║   MV Inventario - Backend API          ║');
    console.log('║   Servidor ejecutándose en puerto 3000 ║');
    console.log('╚═══════════════════════════════════════╝\n');
    
    // Probar conexión a MySQL
    await testConnection();
    
    console.log('\n🔌 Endpoints disponibles:');
    console.log('   AUTENTICACIÓN:');
    console.log('   POST /api/auth/login');
    console.log('   POST /api/auth/register\n');
    console.log('   PRODUCTOS:');
    console.log('   GET  /api/productos');
    console.log('   POST /api/productos');
    console.log('   PUT  /api/productos/:id');
    console.log('   DELETE /api/productos/:id\n');
    console.log('   CATEGORÍAS:');
    console.log('   GET  /api/categorias\n');
    console.log('   MOVIMIENTOS:');
    console.log('   GET  /api/movimientos');
    console.log('   POST /api/movimientos/entrada');
    console.log('   POST /api/movimientos/salida');
    console.log('   DELETE /api/movimientos/:id\n');
    console.log('   ESTADÍSTICAS:');
    console.log('   GET  /api/stats\n');
    console.log('   REPORTES:');
    console.log('   GET  /api/reportes/productos/csv');
    console.log('   GET  /api/reportes/productos/excel');
    console.log('   GET  /api/reportes/movimientos/csv');
    console.log('   GET  /api/reportes/movimientos/excel\n');
    console.log('   OTROS:');
    console.log('   GET  /api/health\n');
});