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
import { LogIn, Settings as SettingsIcon, UserCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { updateProfile as updateFirebaseAuthProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { FormDescription } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function SettingsPage() {
  const { user: firebaseUser, appUser, loading: authLoading, isFirebaseEnabled, updateUserProfile, deleteUserAccount } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState(""); // Email is read-only from auth
  const [company, setCompany] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/auth/login?redirect=/settings");
    } else if (appUser) { // firebaseUser will also be present if appUser is
      setDisplayName(appUser.displayName || firebaseUser?.displayName || "");
      setEmail(appUser.email || firebaseUser?.email || "");
      setCompany(appUser.company || "");
    }
  }, [firebaseUser, appUser, authLoading, router]);
  
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !isFirebaseEnabled || !appUser) {
      toast({ title: "Error", description: "No se puede guardar el perfil. Usuario no autenticado o Firebase no configurado.", variant: "destructive"});
      return;
    }
    setIsSavingProfile(true);
    try {
      // Update Firebase Auth profile (displayName only, photoURL not handled here yet)
      if (firebaseUser.displayName !== displayName) {
        await updateFirebaseAuthProfile(firebaseUser, { displayName });
      }

      // Update Firestore profile (displayName and company)
      await updateUserProfile({ displayName, company });

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
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isFirebaseEnabled) {
      toast({ title: "Error", description: "Firebase no está configurado.", variant: "destructive"});
      return;
    }
    setIsDeletingAccount(true);
    try {
      await deleteUserAccount();
      toast({
        title: "Cuenta Eliminada",
        description: "Tu cuenta ha sido eliminada permanentemente.",
      });
      // router.push('/auth/login'); // AuthContext logout or onAuthStateChanged should handle redirection
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error al Eliminar Cuenta",
        description: (error as Error).message || "No se pudo eliminar tu cuenta.",
        variant: "destructive",
      });
      setIsDeletingAccount(false);
    }
  };


  const activeTab = searchParams.get("tab") || "profile";

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  if (!firebaseUser || !appUser) { // Ensure appUser is also loaded
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
          <TabsTrigger value="appearance" disabled>Apariencia</TabsTrigger>
          <TabsTrigger value="account">Cuenta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <form onSubmit={handleProfileSave}>
            <Card>
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription>Actualice sus datos personales. Rol actual: <span className="font-semibold capitalize">{appUser?.role || 'No asignado'}</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="displayName">Nombre Completo</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" value={email} readOnly disabled />
                  <FormDescription className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar desde aquí.</FormDescription>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company">Empresa (Opcional)</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Nombre de su empresa" />
                </div>
                <Button type="submit" className="mt-4" disabled={isSavingProfile || !isFirebaseEnabled}>
                  {isSavingProfile ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personalice el aspecto de la aplicación (Próximamente).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Actualmente, el cambio de tema (Claro/Oscuro) se gestiona según las preferencias de su sistema.
                </p>
              </div>
               <div className="flex items-center space-x-2">
                <Switch id="compact-mode" disabled />
                <Label htmlFor="compact-mode">Activar Modo Compacto</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Cuenta</CardTitle>
              <CardDescription>Opciones relacionadas con la seguridad y eliminación de su cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Placeholder for password change - Requires re-authentication */}
                <Button variant="outline" disabled>Cambiar Contraseña (Próximamente)</Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!isFirebaseEnabled || isDeletingAccount}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeletingAccount ? "Eliminando..." : "Eliminar Cuenta Permanentemente"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente su cuenta
                        y todos sus datos asociados de nuestros servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                        Sí, eliminar mi cuenta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <FormDescription className="text-xs text-muted-foreground">
                  La eliminación de la cuenta es irreversible.
                </FormDescription>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
