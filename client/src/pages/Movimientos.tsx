import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Movimientos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "salida">("entrada");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");

  const utils = trpc.useUtils();
  const { data: movimientos, isLoading } = trpc.movimientos.list.useQuery();
  const { data: productos } = trpc.productos.list.useQuery();

  const registrarMutation = trpc.movimientos.registrar.useMutation({
    onSuccess: () => {
      toast.success("Movimiento registrado exitosamente");
      utils.movimientos.list.invalidate();
      utils.productos.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setProductoId("");
    setTipo("entrada");
    setCantidad("");
    setMotivo("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registrarMutation.mutate({
      productoId: parseInt(productoId),
      tipo,
      cantidad: parseInt(cantidad),
      motivo,
    });
  };

  const getProductoName = (prodId: number) => {
    return productos?.find(p => p.id === prodId)?.nombre || `Producto #${prodId}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
            <p className="text-muted-foreground mt-2">
              Registro de entradas y salidas de productos
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Movimiento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimiento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="producto">Producto *</Label>
                  <Select value={productoId} onValueChange={setProductoId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos?.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id.toString()}>
                          {prod.nombre} (Stock: {prod.stockActual})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Movimiento *</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as "entrada" | "salida")} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">📥 Entrada</SelectItem>
                      <SelectItem value="salida">📤 Salida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad *</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo</Label>
                  <Textarea
                    id="motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej: Compra a proveedor, Venta, Ajuste de inventario"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={registrarMutation.isPending}>
                    Registrar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Cargando movimientos...</p>
            ) : !movimientos || movimientos.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay movimientos registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Fecha</th>
                      <th className="text-left p-3 font-medium">Producto</th>
                      <th className="text-left p-3 font-medium">Tipo</th>
                      <th className="text-right p-3 font-medium">Cantidad</th>
                      <th className="text-left p-3 font-medium">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((mov) => (
                      <tr key={mov.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-sm">
                          {new Date(mov.fechaMovimiento).toLocaleString('es-ES')}
                        </td>
                        <td className="p-3">{getProductoName(mov.productoId)}</td>
                        <td className="p-3">
                          {mov.tipo === 'entrada' ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <ArrowDownCircle className="h-4 w-4" />
                              Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <ArrowUpCircle className="h-4 w-4" />
                              Salida
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-medium">{mov.cantidad}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {mov.motivo || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
