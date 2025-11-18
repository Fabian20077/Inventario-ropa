import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import ProductoDAO from '../dao/ProductoDAO.js';
import { query } from '../config/database.js';

class ReportesService {
    /**
     * Exportar productos a CSV
     */
    async exportarProductosCSV() {
        try {
            const productos = await ProductoDAO.listar();
            
            const campos = [
                { label: 'ID', value: 'id' },
                { label: 'Código', value: 'codigo' },
                { label: 'Nombre', value: 'nombre' },
                { label: 'Descripción', value: 'descripcion' },
                { label: 'Precio Venta', value: 'precio_venta' },
                { label: 'Stock Actual', value: 'cantidad' },
                { label: 'Categoría', value: 'categoria_nombre' }
            ];
            
            const parser = new Parser({ fields: campos });
            const csv = parser.parse(productos);
            
            return {
                success: true,
                data: csv,
                filename: `productos_${Date.now()}.csv`,
                contentType: 'text/csv'
            };
        } catch (error) {
            console.error('Error en exportarProductosCSV:', error);
            throw error;
        }
    }

    /**
     * Exportar productos a Excel
     */
    async exportarProductosExcel() {
        try {
            const productos = await ProductoDAO.listar();
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Productos');
            
            // Definir columnas
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Código', key: 'codigo', width: 15 },
                { header: 'Nombre', key: 'nombre', width: 30 },
                { header: 'Descripción', key: 'descripcion', width: 40 },
                { header: 'Precio Venta', key: 'precio_venta', width: 15 },
                { header: 'Stock Actual', key: 'cantidad', width: 15 },
                { header: 'Categoría', key: 'categoria_nombre', width: 20 }
            ];
            
            // Estilo del encabezado
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF003366' }
            };
            
            // Agregar datos
            productos.forEach(producto => {
                worksheet.addRow(producto);
            });
            
            // Generar buffer
            const buffer = await workbook.xlsx.writeBuffer();
            
            return {
                success: true,
                data: buffer,
                filename: `productos_${Date.now()}.xlsx`,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
        } catch (error) {
            console.error('Error en exportarProductosExcel:', error);
            throw error;
        }
    }

    /**
     * Exportar movimientos a CSV
     */
    async exportarMovimientosCSV() {
        try {
            const sql = `
                SELECT 
                    m.id,
                    p.codigo,
                    p.nombre as producto_nombre,
                    m.tipo,
                    m.cantidad,
                    m.fecha,
                    u.nombre as usuario_nombre
                FROM movimientos_inventario m
                LEFT JOIN producto p ON m.id_producto = p.id
                LEFT JOIN usuario u ON m.usuario_id = u.id
                ORDER BY m.fecha DESC
            `;
            
            const movimientos = await query(sql);
            
            const campos = [
                { label: 'ID', value: 'id' },
                { label: 'Código Producto', value: 'codigo' },
                { label: 'Producto', value: 'producto_nombre' },
                { label: 'Tipo', value: 'tipo' },
                { label: 'Cantidad', value: 'cantidad' },
                { label: 'Fecha', value: 'fecha' },
                { label: 'Usuario', value: 'usuario_nombre' }
            ];
            
            const parser = new Parser({ fields: campos });
            const csv = parser.parse(movimientos);
            
            return {
                success: true,
                data: csv,
                filename: `movimientos_${Date.now()}.csv`,
                contentType: 'text/csv'
            };
        } catch (error) {
            console.error('Error en exportarMovimientosCSV:', error);
            throw error;
        }
    }

    /**
     * Exportar movimientos a Excel
     */
    async exportarMovimientosExcel() {
        try {
            const sql = `
                SELECT 
                    m.id,
                    p.codigo,
                    p.nombre as producto_nombre,
                    m.tipo,
                    m.cantidad,
                    m.fecha,
                    u.nombre as usuario_nombre
                FROM movimientos_inventario m
                LEFT JOIN producto p ON m.id_producto = p.id
                LEFT JOIN usuario u ON m.usuario_id = u.id
                ORDER BY m.fecha DESC
            `;
            
            const movimientos = await query(sql);
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Movimientos');
            
            // Definir columnas
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Código', key: 'codigo', width: 15 },
                { header: 'Producto', key: 'producto_nombre', width: 30 },
                { header: 'Tipo', key: 'tipo', width: 15 },
                { header: 'Cantidad', key: 'cantidad', width: 15 },
                { header: 'Fecha', key: 'fecha', width: 20 },
                { header: 'Usuario', key: 'usuario_nombre', width: 20 }
            ];
            
            // Estilo del encabezado
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF003366' }
            };
            
            // Agregar datos
            movimientos.forEach(movimiento => {
                worksheet.addRow(movimiento);
            });
            
            // Generar buffer
            const buffer = await workbook.xlsx.writeBuffer();
            
            return {
                success: true,
                data: buffer,
                filename: `movimientos_${Date.now()}.xlsx`,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
        } catch (error) {
            console.error('Error en exportarMovimientosExcel:', error);
            throw error;
        }
    }
}

export default new ReportesService();