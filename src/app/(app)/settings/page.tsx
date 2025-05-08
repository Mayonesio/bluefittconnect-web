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
import { LogIn, Settings as SettingsIcon, UserCircle } from "lucide-react";
import Link from "next/link";
import { updateProfile as updateFirebaseAuthProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db as firestoreDB } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import type { AppUser } from "@/types/user";
import { FormDescription } from "@/components/ui/form";


export default function SettingsPage() {
  const { user: firebaseUser, appUser, loading: authLoading, isFirebaseEnabled } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/auth/login?redirect=/settings");
    } else if (firebaseUser && appUser) {
      setDisplayName(appUser.displayName || firebaseUser.displayName || "");
      setEmail(appUser.email || firebaseUser.email || "");
      setCompany(appUser.company || "");
    } else if (firebaseUser && !appUser && !authLoading) {
      // Attempt to fetch appUser if firebaseUser exists but appUser is null (e.g., on first load)
      const fetchProfile = async () => {
        if (firestoreDB && firebaseUser.uid) {
          const userDocRef = doc(firestoreDB, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const fetchedAppUser = userDocSnap.data() as AppUser;
            setDisplayName(fetchedAppUser.displayName || firebaseUser.displayName || "");
            setEmail(fetchedAppUser.email || firebaseUser.email || "");
            setCompany(fetchedAppUser.company || "");
          }
        }
      };
      fetchProfile();
    }
  }, [firebaseUser, appUser, authLoading, router]);
  
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !firestoreDB || !isFirebaseEnabled) {
      toast({ title: "Error", description: "No se puede guardar el perfil. Usuario no autenticado o Firebase no configurado.", variant: "destructive"});
      return;
    }
    setIsSavingProfile(true);
    try {
      // Update Firebase Auth profile (displayName, photoURL - photoURL not handled here yet)
      await updateFirebaseAuthProfile(firebaseUser, {
        displayName: displayName,
      });

      // Update Firestore profile
      const userDocRef = doc(firestoreDB, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        company: company,
        // email is not updated here as it's tied to Auth and requires verification
      });

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

  const activeTab = searchParams.get("tab") || "profile";

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  if (!firebaseUser) {
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
          <TabsTrigger value="notifications" disabled>Notificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <form onSubmit={handleProfileSave}>
            <Card>
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription>Actualice sus datos personales. Rol actual: <span className="font-semibold">{appUser?.role || 'No asignado'}</span></CardDescription>
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
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
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

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Administre sus preferencias de notificación (Próximamente).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">Notificaciones por Correo</Label>
                  <p className="text-sm text-muted-foreground">Reciba actualizaciones sobre sus pedidos y alertas importantes.</p>
                </div>
                <Switch id="email-notifications" defaultChecked disabled />
              </div>
              <Button className="mt-4" disabled>Guardar Preferencias</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
