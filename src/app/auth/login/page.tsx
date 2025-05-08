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
import { GoogleLogo } from "@/components/icons/google-logo"; 
import { Separator } from "@/components/ui/separator";


const loginSchema = z.object({
  email: z.string().email("Debe ser un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, signInWithGoogle, user, loading: authLoading, isFirebaseEnabled } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Do not redirect if an auth operation is in progress on this page
    if (isLoading || isGoogleLoading) {
      console.log(`LoginPage useEffect: Auth operation in progress (isLoading: ${isLoading}, isGoogleLoading: ${isGoogleLoading}). Holding redirect.`);
      return;
    }

    if (authLoading || !isFirebaseEnabled) {
      console.log(`LoginPage useEffect: Conditions not met for redirect (authLoading: ${authLoading}, isFirebaseEnabled: ${isFirebaseEnabled}, user: ${!!user})`);
      return;
    }

    if (user) { 
      const redirectUrl = searchParams.get("redirect") || "/";
      console.log(`LoginPage useEffect: User authenticated and no local operation in progress. Redirecting to: ${redirectUrl}`);
      router.push(redirectUrl);
    } else { 
      console.log(`LoginPage useEffect: User not authenticated. No redirect.`);
    }
  }, [user, authLoading, router, searchParams, isFirebaseEnabled, isLoading, isGoogleLoading]);


  useEffect(() => {
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
    console.log("LoginPage onSubmit: Attempting login...");
    try {
      const firebaseUser = await login(data);
      if (firebaseUser) {
        console.log("LoginPage onSubmit: Login successful for user:", firebaseUser.email);
        toast({
          title: "¡Bienvenido de Nuevo!",
          description: "Has iniciado sesión correctamente.",
        });
        // Redirection is handled by the useEffect hook watching user and authLoading state
      } else {
        console.log("LoginPage onSubmit: Login returned no user, but no error was thrown by AuthContext.login. This indicates an unexpected state.");
         toast({
          title: "Error de Inicio de Sesión",
          description: "No se pudo iniciar sesión. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error("LoginPage onSubmit: Login error:", authError.code, authError.message);
      let errorMessage = "Error al iniciar sesión. Por favor, verifica tus credenciales e inténtalo de nuevo.";
      if (authError.code === "auth/user-not-found" || authError.code === "auth/wrong-password" || authError.code === "auth/invalid-credential") {
        errorMessage = "Correo electrónico o contraseña incorrectos.";
      } else if (authError.code === "auth/invalid-email") {
        errorMessage = "El formato del correo electrónico no es válido.";
      } else if (authError.message.includes("Firebase no está configurado")) {
        errorMessage = authError.message;
      } else if (authError.message.includes("Error al configurar la sesión")) {
        errorMessage = "Hubo un problema al configurar tu sesión. Por favor, inténtalo de nuevo.";
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

  const handleGoogleSignIn = async () => {
    if (!isFirebaseEnabled) {
      toast({
        title: "Configuración Incompleta",
        description: "Firebase no está configurado. No se puede iniciar sesión con Google.",
        variant: "destructive",
      });
      return;
    }
    setIsGoogleLoading(true);
    console.log("LoginPage handleGoogleSignIn: Attempting Google sign-in...");
    try {
      console.log("LoginPage handleGoogleSignIn: Calling signInWithGoogle from AuthContext. Timestamp:", Date.now());
      const firebaseUser = await signInWithGoogle();
      console.log("LoginPage handleGoogleSignIn: signInWithGoogle call completed. User:", firebaseUser?.email, "Timestamp:", Date.now());
      if (firebaseUser) {
        console.log("LoginPage handleGoogleSignIn: Google sign-in successful for user:", firebaseUser.email);
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente con Google.",
        });
        // Redirection is handled by the useEffect hook
      } else {
        // This case might be reached if signInWithGoogle resolves with null without throwing an error,
        // though AuthContext's signInWithGoogle is designed to throw on failure.
        console.log("LoginPage handleGoogleSignIn: Google sign-in returned no user, but no error was thrown from AuthContext.signInWithGoogle. This indicates an unexpected state if not already handled by an error toast.");
        // It's possible a toast was already shown by AuthContext if an error occurred there and was caught.
        // We might not need another toast here unless specifically for the "no user but no error" case.
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error("LoginPage handleGoogleSignIn: Google sign-in error caught in page. Code:", authError.code, "Message:", authError.message, "Timestamp:", Date.now());
      let errorMessage = "Error al iniciar sesión con Google. Inténtalo de nuevo.";
      if (authError.code === 'auth/popup-closed-by-user') {
        errorMessage = 'La ventana de inicio de sesión de Google se cerró inesperadamente o fue bloqueada. Por favor, asegúrate de que los popups estén permitidos para este sitio e inténtalo de nuevo.';
      } else if (authError.code === 'auth/popup-blocked') {
        errorMessage = 'El popup de inicio de sesión de Google fue bloqueado por el navegador. Por favor, permite los popups para este sitio e inténtalo de nuevo.';
      } else if (authError.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Ya existe una cuenta con este correo electrónico usando un método de inicio de sesión diferente.';
      } else if (authError.message && authError.message.includes("Error al configurar la sesión")) {
        errorMessage = "Hubo un problema al configurar tu sesión con Google. Por favor, inténtalo de nuevo.";
      } else if (authError.code) { // Fallback for other Firebase auth errors
         errorMessage = `Error de Google: ${authError.message} (código: ${authError.code})`;
      }
      
      toast({
        title: "Error de Inicio de Sesión con Google",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("LoginPage handleGoogleSignIn: finally block. Setting isGoogleLoading to false. Timestamp:", Date.now());
      setIsGoogleLoading(false);
    }
  };
  
  if (authLoading && !user) { 
    console.log("LoginPage: Auth loading, no user. Displaying loading spinner.");
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!user && !isFirebaseEnabled && !authLoading) { 
     console.log("LoginPage: Firebase not enabled, no user, not auth loading. Displaying config error.");
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

  console.log(`LoginPage render: user: ${!!user}, authLoading: ${authLoading}, isFirebaseEnabled: ${isFirebaseEnabled}, isLoading: ${isLoading}, isGoogleLoading: ${isGoogleLoading}`);
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
                      disabled={!isFirebaseEnabled || isLoading || isGoogleLoading || authLoading}
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
                        disabled={!isFirebaseEnabled || isLoading || isGoogleLoading || authLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        disabled={!isFirebaseEnabled || isLoading || isGoogleLoading || authLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || authLoading || !isFirebaseEnabled || isGoogleLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
              ) : (
                <LoginIcon className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Form>

        <div className="my-6 flex items-center">
          <Separator className="flex-1" />
          <span className="mx-4 text-xs text-muted-foreground">O CONTINUAR CON</span>
          <Separator className="flex-1" />
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || authLoading || !isFirebaseEnabled || isLoading}
        >
          {isGoogleLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mr-2"></div>
          ) : (
            <GoogleLogo className="mr-2 h-5 w-5" />
          )}
          {isGoogleLoading ? "Conectando..." : "Iniciar Sesión con Google"}
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Button variant="link" asChild className="p-0 h-auto font-medium text-primary" disabled={!isFirebaseEnabled || isLoading || isGoogleLoading || authLoading}>
            <Link href="/auth/register">Regístrate aquí</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}