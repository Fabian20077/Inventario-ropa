// =====================================================
// CONFIGURACIÓN DE LA API
// =====================================================
const API_BASE_URL = 'http://127.0.0.1:3000';

// =====================================================
// HELPERS
// =====================================================

// Obtener token de autenticación
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Obtener usuario actual
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Headers con autenticación
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Mostrar alerta
function showAlert(elementId, message, type = 'success') {
    const alertElement = document.getElementById(elementId);
    alertElement.className = `alert alert-${type}`;
    alertElement.innerHTML = message;
    alertElement.style.display = 'block';
    
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

// Formatear moneda COP
function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value);
}

// Formatear fecha
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// =====================================================
// VERIFICACIÓN DE AUTENTICACIÓN
// =====================================================
window.addEventListener('load', () => {
    const user = getCurrentUser();
    const token = getAuthToken();
    
    if (!user || !token) {
        window.location.href = '/login.html';
        return;
    }

    document.getElementById('userName').textContent = `Bienvenido, ${user.nombre || 'Admin'}`;
    
    // Cargar datos del dashboard
    loadDashboardData();
});

// =====================================================
// CARGAR DATOS DEL DASHBOARD
// =====================================================
async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadRecentProducts(),
        loadRecentMovements(),
        loadCategorias(),
        loadProductosForSelects()
    ]);
}

// Cargar estadísticas
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('totalProducts').textContent = data.data.totalProductos;
            document.getElementById('totalStock').textContent = data.data.stockTotal;
            document.getElementById('totalCategories').textContent = data.data.totalCategorias;
            document.getElementById('totalMovements').textContent = data.data.totalMovimientos;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Cargar productos recientes
async function loadRecentProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/productos`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const container = document.getElementById('recentProducts');
        
        if (data.success && data.data.length > 0) {
            const productos = data.data.slice(0, 5);
            container.innerHTML = productos.map(p => {
                const stockBajo = p.cantidad <= p.stock_minimo;
                const stockAgotado = p.cantidad === 0;
                
                return `
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition duration-200 border-l-4 ${
                        stockAgotado ? 'border-red-600' : stockBajo ? 'border-orange-500' : 'border-green-500'
                    }">
                        <div class="flex-1">
                            <p class="font-semibold text-gray-900">${p.nombre}</p>
                            <p class="text-xs text-gray-500 mt-1">${p.codigo} • ${p.categoria_nombre || 'Sin categoría'}</p>
                        </div>
                        
                        <div class="text-center mx-4">
                            <p class="text-sm text-gray-600 font-medium mb-1">Stock</p>
                            <p class="text-2xl font-bold ${
                                stockAgotado ? 'text-red-600' : stockBajo ? 'text-orange-600' : 'text-green-600'
                            }">
                                ${p.cantidad}
                            </p>
                            ${stockBajo ? `
                                <p class="text-xs text-red-600 font-semibold mt-1">
                                    ⚠️ Mín: ${p.stock_minimo}
                                </p>
                            ` : ''}
                        </div>
                        
                        <div class="text-right mr-3 min-w-fit">
                            <p class="text-sm text-gray-600">Venta</p>
                            <p class="font-bold text-blue-600">${formatCurrency(p.precio_venta)}</p>
                            <p class="text-xs text-gray-500 mt-1">Costo: ${formatCurrency(p.precio_compra)}</p>
                        </div>
                        
                        <div class="flex gap-2">
                            <button onclick="editarProducto(${p.id})" class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition" title="Editar">
                                <i class="bi bi-pencil-square text-lg"></i>
                            </button>
                            <button onclick="eliminarProducto(${p.id}, '${p.nombre.replace(/'/g, "\\'")}' )" class="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition" title="Eliminar">
                                <i class="bi bi-trash text-lg"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay productos registrados</p>';
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        document.getElementById('recentProducts').innerHTML = 
            '<p class="text-red-500 text-center py-4">Error al cargar productos</p>';
    }
}

// Cargar movimientos recientes
async function loadRecentMovements() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/movimientos`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const container = document.getElementById('recentMovements');
        
        if (data.success && data.data.length > 0) {
            const movimientos = data.data.slice(0, 5);
            container.innerHTML = movimientos.map(m => `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div class="flex-1">
                        <p class="font-semibold">${m.producto_nombre || 'Producto'}</p>
                        <p class="text-sm text-gray-600">${m.codigo} - ${m.usuario_nombre || 'Usuario'}</p>
                    </div>
                    <div class="text-right mr-3">
                        <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            m.tipo === 'entrada' 
                                ? 'bg-green-100 text-gray-900' // Aplicado: texto oscuro para alto contraste
                                : 'bg-red-100 text-gray-900'   // Aplicado: texto oscuro para alto contraste
                        }">
                            ${m.tipo === 'entrada' ? '↓' : '↑'} ${m.cantidad}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">${formatDate(m.fecha)}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="verDetallesMovimiento(${m.id})" class="text-blue-600 hover:text-blue-800 transition" title="Ver detalles">
                            <i class="bi bi-eye text-lg"></i>
                        </button>
                        <button onclick="eliminarMovimiento(${m.id}, '${m.producto_nombre?.replace(/'/g, "\\'") || 'Producto'}')" class="text-red-600 hover:text-red-800 transition" title="Eliminar">
                            <i class="bi bi-trash text-lg"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay movimientos registrados</p>';
        }
    } catch (error) {
        console.error('Error cargando movimientos:', error);
        document.getElementById('recentMovements').innerHTML = 
            '<p class="text-red-500 text-center py-4">Error al cargar movimientos</p>';
    }
}
// Cargar categorías
async function loadCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/categorias`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const select = document.getElementById('categoriaSelect');
        
        if (data.success && data.data.length > 0) {
            select.innerHTML = '<option value="">Seleccionar categoría...</option>' +
                data.data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        } else {
            select.innerHTML = '<option value="">No hay categorías disponibles</option>';
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

// Cargar productos para los selects
async function loadProductosForSelects() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/productos`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const selectEntrada = document.getElementById('productoEntradaSelect');
            selectEntrada.innerHTML = '<option value="">Seleccionar producto...</option>' +
                data.data.map(p => 
                    `<option value="${p.id}">${p.nombre} (${p.codigo}) - Stock: ${p.cantidad}</option>`
                ).join('');

            const selectSalida = document.getElementById('productoSalidaSelect');
            selectSalida.innerHTML = '<option value="">Seleccionar producto...</option>' +
                data.data.map(p => 
                    `<option value="${p.id}">${p.nombre} (${p.codigo}) - Stock: ${p.cantidad}</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

// Gestión de modales
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    
    if (modalId === 'productModal') {
        loadCategorias();
    } else if (modalId === 'entradaModal' || modalId === 'salidaModal') {
        loadProductosForSelects();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    const alertIds = ['productAlert', 'entradaAlert', 'salidaAlert', 'editProductAlert'];
    alertIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Crear nuevo producto
async function handleNewProduct(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    const producto = {
        codigo: formData.get('codigo'),
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion') || null,
        precio_compra: parseFloat(formData.get('precio_compra')),
        precio_venta: parseFloat(formData.get('precio_venta')),
        cantidad: parseInt(formData.get('cantidad')),
        stock_minimo: parseInt(formData.get('stock_minimo')),
        ubicacion: formData.get('ubicacion') || null,
        id_categoria: parseInt(formData.get('id_categoria'))
    };

    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Creando...';

        const response = await fetch(`${API_BASE_URL}/api/productos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(producto)
        });

        const data = await response.json();

        if (data.success) {
            showAlert('productAlert', '✅ Producto creado exitosamente', 'success');
            form.reset();
            
            setTimeout(async () => {
                await loadDashboardData();
                closeModal('productModal');
            }, 2000);
        } else {
            showAlert('productAlert', `❌ Error: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('productAlert', '❌ Error de conexión con la API', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Crear Producto';
    }
}

// Registrar entrada
async function handleEntrada(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const user = getCurrentUser();
    
    const entrada = {
        id_producto: parseInt(formData.get('id_producto')),
        cantidad: parseInt(formData.get('cantidad')),
        motivo: formData.get('motivo') || 'Entrada de inventario',
        usuario_id: user.id
    };

    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Registrando...';

        const response = await fetch(`${API_BASE_URL}/api/movimientos/entrada`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(entrada)
        });

        const data = await response.json();

        if (data.success) {
            showAlert('entradaAlert', '✅ Entrada registrada exitosamente', 'success');
            form.reset();
            
            setTimeout(async () => {
                await loadDashboardData();
                closeModal('entradaModal');
            }, 2000);
        } else {
            showAlert('entradaAlert', `❌ Error: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('entradaAlert', '❌ Error de conexión con la API', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Registrar Entrada';
    }
}

// Registrar salida
async function handleSalida(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const user = getCurrentUser();
    
    const salida = {
        id_producto: parseInt(formData.get('id_producto')),
        cantidad: parseInt(formData.get('cantidad')),
        motivo: formData.get('motivo') || 'Salida de inventario',
        usuario_id: user.id
    };

    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Registrando...';

        const response = await fetch(`${API_BASE_URL}/api/movimientos/salida`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(salida)
        });

        const data = await response.json();

        if (data.success) {
            showAlert('salidaAlert', '✅ Salida registrada exitosamente', 'success');
            form.reset();
            
            setTimeout(async () => {
                await loadDashboardData();
                closeModal('salidaModal');
            }, 2000);
        } else {
            showAlert('salidaAlert', `❌ Error: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('salidaAlert', '❌ Error de conexión con la API', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Registrar Salida';
    }
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
}

// =====================================================
// EDITAR PRODUCTO
// =====================================================
async function editarProducto(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/productos`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const producto = data.data.find(p => p.id === id);
            if (!producto) {
                alert('Producto no encontrado');
                return;
            }
            
            document.getElementById('editProductId').value = producto.id;
            document.getElementById('editCodigo').value = producto.codigo;
            document.getElementById('editNombre').value = producto.nombre;
            document.getElementById('editDescripcion').value = producto.descripcion || '';
            document.getElementById('editPrecioCompra').value = producto.precio_compra;
            document.getElementById('editPrecioVenta').value = producto.precio_venta;
            document.getElementById('editCantidad').value = producto.cantidad;
            document.getElementById('editStockMinimo').value = producto.stock_minimo;
            document.getElementById('editUbicacion').value = producto.ubicacion || '';
            
            await loadCategoriasForEdit(producto.id_categoria);
            openModal('editProductModal');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos del producto');
    }
}

async function loadCategoriasForEdit(selectedId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/categorias`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        const select = document.getElementById('editCategoriaSelect');
        
        if (data.success && data.data.length > 0) {
            select.innerHTML = '<option value="">Seleccionar categoría...</option>' +
                data.data.map(c => 
                    `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.nombre}</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function handleEditProduct(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const id = formData.get('id');
    
    const producto = {
        codigo: formData.get('codigo'),
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion') || null,
        precio_compra: parseFloat(formData.get('precio_compra')),
        precio_venta: parseFloat(formData.get('precio_venta')),
        cantidad: parseInt(formData.get('cantidad')),
        stock_minimo: parseInt(formData.get('stock_minimo')),
        ubicacion: formData.get('ubicacion') || null,
        id_categoria: parseInt(formData.get('id_categoria'))
    };

    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Actualizando...';

        const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(producto)
        });

        const data = await response.json();

        if (data.success) {
            showAlert('editProductAlert', '✅ Producto actualizado', 'success');
            setTimeout(async () => {
                await loadDashboardData();
                closeModal('editProductModal');
            }, 2000);
        } else {
            showAlert('editProductAlert', `❌ Error: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('editProductAlert', '❌ Error de conexión', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Actualizar';
    }
}

async function eliminarProducto(id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"?\n\nEsta acción no se puede deshacer.`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            alert('✅ Producto eliminado');
            await loadDashboardData();
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}
// =====================================================
// VER DETALLES DE MOVIMIENTO
// =====================================================
async function verDetallesMovimiento(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/movimientos`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const movimiento = data.data.find(m => m.id === id);
            if (!movimiento) {
                alert('Movimiento no encontrado');
                return;
            }
            
            // Llenar detalles
            document.getElementById('detalleProducto').textContent = movimiento.producto_nombre || 'N/A';
            document.getElementById('detalleCodigo').textContent = movimiento.codigo || 'N/A';
            document.getElementById('detalleTipo').textContent = movimiento.tipo.toUpperCase();
            document.getElementById('detalleTipo').className = `inline-block px-3 py-1 rounded-full text-sm font-bold ${
                movimiento.tipo === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`;
            document.getElementById('detalleCantidad').textContent = movimiento.cantidad;
            document.getElementById('detalleMotivo').textContent = movimiento.motivo || 'Sin motivo';
            document.getElementById('detalleFecha').textContent = formatDate(movimiento.fecha);
            document.getElementById('detalleUsuario').textContent = movimiento.usuario_nombre || 'Desconocido';
            
            openModal('detalleMovimientoModal');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles del movimiento');
    }
}

// =====================================================
// ELIMINAR MOVIMIENTO
// =====================================================
async function eliminarMovimiento(id, nombreProducto) {
    if (!confirm(`¿Eliminar movimiento de "${nombreProducto}"?\n\n⚠️ ADVERTENCIA: Esto revertirá el stock del producto.\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/movimientos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        
        if (data.success) {
            alert('✅ Movimiento eliminado y stock revertido');
            await loadDashboardData();
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión con la API');
    }
}
// Cargar movimientos recientes
async function loadRecentMovements() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/movimientos`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const container = document.getElementById('recentMovements');
        
        if (data.success && data.data.length > 0) {
            const movimientos = data.data.slice(0, 5);
            container.innerHTML = movimientos.map(m => `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div class="flex-1">
                        <p class="font-semibold">${m.producto_nombre || 'Producto'}</p>
                        <p class="text-sm text-gray-600">${m.codigo} - ${m.usuario_nombre || 'Usuario'}</p>
                    </div>
                    <div class="text-right mr-3">
                        <span style="color: #1F2937 !important;" class="inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            m.tipo === 'entrada' 
                                ? 'bg-green-100' // Color de fondo (Verde pastel)
                                : 'bg-red-100'   // Color de fondo (Rosa pastel)
                        }">
                            ${m.tipo === 'entrada' ? '↓' : '↑'} ${m.cantidad}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">${formatDate(m.fecha)}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="verDetallesMovimiento(${m.id})" class="text-blue-600 hover:text-blue-800 transition" title="Ver detalles">
                            <i class="bi bi-eye text-lg"></i>
                        </button>
                        <button onclick="eliminarMovimiento(${m.id}, '${m.producto_nombre?.replace(/'/g, "\\'") || 'Producto'}')" class="text-red-600 hover:text-red-800 transition" title="Eliminar">
                            <i class="bi bi-trash text-lg"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay movimientos registrados</p>';
        }
    } catch (error) {
        console.error('Error cargando movimientos:', error);
        document.getElementById('recentMovements').innerHTML = 
            '<p class="text-red-500 text-center py-4">Error al cargar movimientos</p>';
    }
}