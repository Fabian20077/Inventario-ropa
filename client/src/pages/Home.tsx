import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

export default function Home() {
  const { data: productos, isLoading: loadingProductos } = trpc.productos.list.useQuery();
  const { data: movimientos, isLoading: loadingMovimientos } = trpc.movimientos.list.useQuery();
  const { data: categorias, isLoading: loadingCategorias } = trpc.categorias.list.useQuery();

  const totalProductos = productos?.length || 0;
  const totalCategorias = categorias?.length || 0;
  const stockTotal = productos?.reduce((sum, p) => sum + p.stockActual, 0) || 0;
  const movimientosRecientes = movimientos?.slice(0, 5) || [];

  const isLoading = loadingProductos || loadingMovimientos || loadingCategorias;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Resumen general del inventario de ropa
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : totalProductos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Productos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stockTotal}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unidades en inventario
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : totalCategorias}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Categorías activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : movimientos?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Movimientos registrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Movimientos recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Cargando movimientos...</p>
            ) : movimientosRecientes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay movimientos registrados</p>
            ) : (
              <div className="space-y-3">
                {movimientosRecientes.map((mov) => {
                  const producto = productos?.find(p => p.id === mov.productoId);
                  return (
                    <div key={mov.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {producto?.nombre || `Producto #${mov.productoId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mov.tipo === 'entrada' ? '📥 Entrada' : '📤 Salida'} • {mov.cantidad} unidades
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(mov.fechaMovimiento).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
