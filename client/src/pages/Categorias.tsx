import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Categorias() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const utils = trpc.useUtils();
  const { data: categorias, isLoading } = trpc.categorias.list.useQuery();

  const createMutation = trpc.categorias.create.useMutation({
    onSuccess: () => {
      toast.success("Categoría creada exitosamente");
      utils.categorias.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.categorias.update.useMutation({
    onSuccess: () => {
      toast.success("Categoría actualizada exitosamente");
      utils.categorias.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.categorias.delete.useMutation({
    onSuccess: () => {
      toast.success("Categoría eliminada exitosamente");
      utils.categorias.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingId(null);
    setNombre("");
    setDescripcion("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, nombre, descripcion });
    } else {
      createMutation.mutate({ nombre, descripcion });
    }
  };

  const handleEdit = (categoria: any) => {
    setEditingId(categoria.id);
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion || "");
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de eliminar esta categoría?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
            <p className="text-muted-foreground mt-2">
              Gestión de categorías de productos
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setNombre(""); setDescripcion(""); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Categoría" : "Nueva Categoría"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Camisas, Pantalones"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción de la categoría"
                    rows={3}
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
            <CardTitle>Lista de Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Cargando categorías...</p>
            ) : !categorias || categorias.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay categorías registradas</p>
            ) : (
              <div className="space-y-3">
                {categorias.map((categoria) => (
                  <div
                    key={categoria.id}
                    className="flex items-center justify-between border rounded-lg p-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{categoria.nombre}</h3>
                      {categoria.descripcion && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {categoria.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(categoria)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(categoria.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
