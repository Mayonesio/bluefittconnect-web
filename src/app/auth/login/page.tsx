// src/app/auth/login/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthError } from "firebase/auth";
import { Eye, EyeOff, LogIn as LoginIcon, AlertTriangle } from "lucide-react";


const loginSchema = z.object({
  email: z.string().email("Debe ser un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user, loading: authLoading, isFirebaseEnabled } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    // This effect runs once on mount if auth is not loading and Firebase is disabled
    if (!authLoading && !isFirebaseEnabled && !user) {
      toast({
        title: "Error de Configuración de Firebase",
        description: "Las funciones de autenticación están deshabilitadas. Contacte al administrador o revise la configuración de Firebase.",
        variant: "destructive",
        duration: Infinity, 
      });
    }
  }, [authLoading, isFirebaseEnabled, user, toast]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (!isFirebaseEnabled) {
      toast({
        title: "Configuración Incompleta",
        description: "Firebase no está configurado. No se puede iniciar sesión.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await login(data);
      toast({
        title: "¡Bienvenido de Nuevo!",
        description: "Has iniciado sesión correctamente.",
      });
      // Redirect is handled by useEffect or middleware
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Error al iniciar sesión. Por favor, verifica tus credenciales.";
      if (authError.code === "auth/user-not-found" || authError.code === "auth/wrong-password" || authError.code === "auth/invalid-credential") {
        errorMessage = "Correo electrónico o contraseña incorrectos.";
      } else if (authError.code === "auth/invalid-email") {
        errorMessage = "El formato del correo electrónico no es válido.";
      } else if (authError.message.includes("Firebase no está configurado")) {
        errorMessage = authError.message;
      }
      toast({
        title: "Error de Inicio de Sesión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) { // Show loader if auth state is loading OR if Firebase is disabled (initial check)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          {authLoading ? "Verificando sesión..." : "Inicializando..."}
        </p>
      </div>
    );
  }

  if (!user && !isFirebaseEnabled && !authLoading) { // Explicitly show error state if Firebase is disabled
     return (
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl">Error de Configuración</CardTitle>
          <CardDescription>
            El sistema de autenticación no está disponible.
            Revise la consola para más detalles o contacte al soporte.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="outline" className="w-full" onClick={() => router.refresh()}>
            Reintentar Carga
          </Button>
        </CardContent>
      </Card>
     );
  }


  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>Accede a tu cuenta de Blufitt Connect.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="tu@correo.com" 
                      {...field} 
                      disabled={!isFirebaseEnabled || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={!isFirebaseEnabled || isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        disabled={!isFirebaseEnabled || isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || authLoading || !isFirebaseEnabled}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
              ) : (
                <LoginIcon className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Button variant="link" asChild className="p-0 h-auto font-medium text-primary" disabled={!isFirebaseEnabled}>
            <Link href="/auth/register">Regístrate aquí</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}
