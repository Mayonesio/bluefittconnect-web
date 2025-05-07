import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Administre su cuenta y las preferencias de la aplicación.
        </p>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>Actualice sus datos personales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" defaultValue="Admin" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input id="lastName" defaultValue="Usuario" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" defaultValue="admin@blufitt.pro" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="company">Empresa (Opcional)</Label>
                <Input id="company" defaultValue="Soluciones Blufitt" />
              </div>
              <Button className="mt-4">Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personalice el aspecto de la aplicación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Actualmente, el cambio de tema (Claro/Oscuro) se gestiona según las preferencias de su sistema.
                  Se podría añadir un selector manual en el futuro.
                </p>
              </div>
               <div className="flex items-center space-x-2">
                <Switch id="compact-mode" />
                <Label htmlFor="compact-mode">Activar Modo Compacto</Label>
              </div>
               <p className="text-sm text-muted-foreground">
                 El modo compacto reduce el espaciado para una interfaz más densa (función próximamente).
               </p>
              <Button className="mt-4" disabled>Guardar Ajustes de Apariencia</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Administre sus preferencias de notificación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">Notificaciones por Correo</Label>
                  <p className="text-sm text-muted-foreground">Reciba actualizaciones sobre sus pedidos y alertas importantes.</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                 <div>
                  <Label htmlFor="blog-updates" className="font-medium">Actualizaciones del Blog</Label>
                  <p className="text-sm text-muted-foreground">Reciba notificaciones cuando se publiquen nuevos artículos en el blog.</p>
                </div>
                <Switch id="blog-updates" />
              </div>
               <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                 <div>
                  <Label htmlFor="product-alerts" className="font-medium">Novedades y Promociones</Label>
                  <p className="text-sm text-muted-foreground">Reciba notificaciones sobre nuevos productos o promociones especiales.</p>
                </div>
                <Switch id="product-alerts" defaultChecked/>
              </div>
              <Button className="mt-4">Guardar Preferencias de Notificación</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
