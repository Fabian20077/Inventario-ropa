import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Productos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sku, setSku] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const utils = trpc.useUtils();
  const { data: productos, isLoading } = trpc.productos.list.useQuery();
  const { data: categorias } = trpc.categorias.list.useQuery();

  const createMutation = trpc.productos.create.useMutation({
    onSuccess: () => {
      toast.success("Producto creado exitosamente");
      utils.productos.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.productos.update.useMutation({
    onSuccess: () => {
      toast.success("Producto actualizado exitosamente");
      utils.productos.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.productos.delete.useMutation({
    onSuccess: () => {
      toast.success("Producto eliminado exitosamente");
      utils.productos.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingId(null);
    setSku("");
    setNombre("");
    setDescripcion("");
    setPrecioVenta("");
    setCategoriaId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const precio = Math.round(parseFloat(precioVenta) * 100);
    
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        sku,
        nombre,
        descripcion,
        precioVenta: precio,
        categoriaId: parseInt(categoriaId),
      });
    } else {
      createMutation.mutate({
        sku,
        nombre,
        descripcion,
        precioVenta: precio,
        stockActual: 0,
        categoriaId: parseInt(categoriaId),
      });
    }
  };

  const handleEdit = (producto: any) => {
    setEditingId(producto.id);
    setSku(producto.sku);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || "");
    setPrecioVenta((producto.precioVenta / 100).toFixed(2));
    setCategoriaId(producto.categoriaId.toString());
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de eliminar este producto?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getCategoriaName = (catId: number) => {
    return categorias?.find(c => c.id === catId)?.nombre || "Sin categoría";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground mt-2">
              Gestión de productos del inventario
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Producto" : "Nuevo Producto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Ej: CAM-001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select value={categoriaId} onValueChange={setCategoriaId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Camisa Polo Azul"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio de Venta *</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Cargando productos...</p>
            ) : !productos || productos.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay productos registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">SKU</th>
                      <th className="text-left p-3 font-medium">Nombre</th>
                      <th className="text-left p-3 font-medium">Categoría</th>
                      <th className="text-right p-3 font-medium">Precio</th>
                      <th className="text-right p-3 font-medium">Stock</th>
                      <th className="text-right p-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((producto) => (
                      <tr key={producto.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm">{producto.sku}</td>
                        <td className="p-3">{producto.nombre}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {getCategoriaName(producto.categoriaId)}
                        </td>
                        <td className="p-3 text-right">
                          ${(producto.precioVenta / 100).toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <span className={producto.stockActual <= 5 ? "text-destructive font-medium" : ""}>
                            {producto.stockActual}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(producto)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(producto.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
