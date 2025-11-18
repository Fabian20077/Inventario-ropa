import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Usuarios() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: usuarios, isLoading } = trpc.usuarios.list.useQuery();

  const updateStatusMutation = trpc.usuarios.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Estado actualizado exitosamente");
      utils.usuarios.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateRoleMutation = trpc.usuarios.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Rol actualizado exitosamente");
      utils.usuarios.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (id: number, activo: boolean) => {
    updateStatusMutation.mutate({ id, activo });
  };

  const handleRoleChange = (id: number, role: "user" | "admin") => {
    updateRoleMutation.mutate({ id, role });
  };

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No tienes permisos para acceder a esta sección
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Administración de usuarios del sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Cargando usuarios...</p>
            ) : !usuarios || usuarios.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay usuarios registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Nombre</th>
                      <th className="text-left p-3 font-medium">Correo</th>
                      <th className="text-left p-3 font-medium">Rol</th>
                      <th className="text-left p-3 font-medium">Estado</th>
                      <th className="text-left p-3 font-medium">Último Acceso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{usuario.nombre || "-"}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {usuario.correo || "-"}
                        </td>
                        <td className="p-3">
                          <Select
                            value={usuario.role}
                            onValueChange={(v) => handleRoleChange(usuario.id, v as "user" | "admin")}
                            disabled={usuario.id === user?.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuario</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Switch
                            checked={usuario.activo}
                            onCheckedChange={(checked) => handleStatusChange(usuario.id, checked)}
                            disabled={usuario.id === user?.id}
                          />
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(usuario.lastSignedIn).toLocaleDateString('es-ES')}
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
