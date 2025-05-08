// src/app/(app)/settings/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react"; // Import Suspense
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Label from shadcn is fine standalone for non-RHF forms, but FormLabel from RHF is used inside the form.
import { Label as ShadcnLabel } from "@/components/ui/label"; 
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Settings as SettingsIcon, UserCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { updateProfile as updateFirebaseAuthProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel, // This is react-hook-form's FormLabel
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const profileFormSchema = z.object({
  displayName: z.string().min(1, "El nombre completo es obligatorio."),
  company: z.string().optional(),
  // Email is not part of the editable form data, so not in schema
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;


function SettingsTabs() {
  const { user: firebaseUser, appUser, loading: authLoading, isFirebaseEnabled, updateUserProfile, deleteUserAccount } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState(""); 
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      company: "",
    },
  });

  useEffect(() => {
    if (appUser) { 
      form.reset({
        displayName: appUser.displayName || firebaseUser?.displayName || "",
        company: appUser.company || "",
      });
      setEmail(appUser.email || firebaseUser?.email || "");
    } else if (firebaseUser && !appUser) { // Fallback if appUser is not loaded but firebaseUser is
      form.reset({
        displayName: firebaseUser.displayName || "",
        company: "",
      });
      setEmail(firebaseUser.email || "");
    }
  }, [firebaseUser, appUser, form]);
  
  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!firebaseUser || !isFirebaseEnabled || !appUser) {
      toast({ title: "Error", description: "No se puede guardar el perfil. Usuario no autenticado o Firebase no configurado.", variant: "destructive"});
      return;
    }
    setIsSavingProfile(true);
    try {
      if (firebaseUser.displayName !== data.displayName) {
        await updateFirebaseAuthProfile(firebaseUser, { displayName: data.displayName });
      }
      await updateUserProfile({ displayName: data.displayName, company: data.company });
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
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error al Eliminar Cuenta",
        description: (error as Error).message || "No se pudo eliminar tu cuenta.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false); 
    }
  };

  const activeTab = searchParams.get("tab") || "profile";

  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={(value) => router.push(`/settings?tab=${value}`, { scroll: false })}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="appearance" disabled>Apariencia</TabsTrigger>
        <TabsTrigger value="account">Cuenta</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onProfileSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription>Actualice sus datos personales. Rol actual: <span className="font-semibold capitalize">{appUser?.role || 'No asignado'}</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Su nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormItem>
                  <FormLabel htmlFor="email-display">Correo Electrónico</FormLabel>
                  <Input id="email-display" type="email" value={email} readOnly disabled />
                  <FormDescription className="text-xs text-muted-foreground">
                    El correo electrónico no se puede cambiar desde aquí.
                  </FormDescription>
                </FormItem>

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de su empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mt-4" disabled={isSavingProfile || !isFirebaseEnabled || !form.formState.isDirty}>
                  {isSavingProfile ? "Guardando..." : "Guardar Cambios"}
                </Button>
                 {!form.formState.isDirty && form.formState.isSubmitted && (
                   <p className="text-sm text-muted-foreground mt-2">No hay cambios para guardar.</p>
                 )}
              </CardContent>
            </Card>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>Personalice el aspecto de la aplicación (Próximamente).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <ShadcnLabel>Tema</ShadcnLabel>
              <p className="text-sm text-muted-foreground">
                Actualmente, el cambio de tema (Claro/Oscuro) se gestiona según las preferencias de su sistema.
              </p>
            </div>
             <div className="flex items-center space-x-2">
              <Switch id="compact-mode" disabled />
              <ShadcnLabel htmlFor="compact-mode">Activar Modo Compacto</ShadcnLabel>
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
                    <AlertDialogCancel onClick={() => setIsDeletingAccount(false)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                      Sí, eliminar mi cuenta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground">
                La eliminación de la cuenta es irreversible.
              </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}


export default function SettingsPage() {
  const { user: firebaseUser, appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/auth/login?redirect=/settings");
    }
  }, [firebaseUser, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  if (!firebaseUser || !appUser) { 
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
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div><p className="ml-4">Cargando pestañas de configuración...</p></div>}>
        <SettingsTabs />
      </Suspense>
    </div>
  );
}
