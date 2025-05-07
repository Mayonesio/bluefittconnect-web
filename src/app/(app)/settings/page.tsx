// src/app/(app)/settings/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";


export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // Add company state

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/settings");
    } else if (user) {
      const nameParts = user.displayName?.split(" ") || ["", ""];
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(user.email || "");
      // Fetch company from user profile or a separate store if you implement it
      // setCompany(user.company || ""); 
    }
  }, [user, loading, router]);
  
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`.trim(),
        // You might need to handle email updates separately as it's a sensitive operation
        // and might require re-authentication.
      });
      // If you store company in Firestore or Realtime Database, update it here.
      toast({
        title: "Perfil Actualizado",
        description: "Tu información de perfil ha sido guardada.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error al Actualizar Perfil",
        description: (error as Error).message || "No se pudo guardar tu perfil.",
        variant: "destructive",
      });
    }
  };


  const activeTab = searchParams.get("tab") || "profile";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  if (!user) {
    // This is a fallback, useEffect should redirect
    return (
       <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
        <SettingsIcon className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground mb-6">
          Debes iniciar sesión para acceder a la configuración.
        </p>
        <Button asChild>
          <Link href="/auth/login?redirect=/settings">
            <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Administre su cuenta y las preferencias de la aplicación.
        </p>
      </header>

      <Tabs defaultValue={activeTab} className="w-full" onValueChange={(value) => router.push(`/settings?tab=${value}`, { scroll: false })}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <form onSubmit={handleProfileSave}>
            <Card>
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription>Actualice sus datos personales.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" value={email} readOnly disabled />
                  <FormDescription className="text-xs">El correo electrónico no se puede cambiar desde aquí.</FormDescription>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company">Empresa (Opcional)</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <Button type="submit" className="mt-4">Guardar Cambios</Button>
              </CardContent>
            </Card>
          </form>
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
