// src/app/auth/register/page.tsx
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
import { Eye, EyeOff, UserPlus, AlertTriangle } from "lucide-react";
import { GoogleLogo } from "@/components/icons/google-logo"; 
import { Separator } from "@/components/ui/separator";

const registerSchema = z.object({
  email: z.string().email("Debe ser un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string().min(6, "La confirmación de contraseña debe tener al menos 6 caracteres."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, signInWithGoogle, user, loading: authContextLoading, isFirebaseEnabled } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEmailPasswordLoading, setIsEmailPasswordLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    console.log(`RegisterPage useEffect: user: ${!!user}, authContextLoading: ${authContextLoading}, isFirebaseEnabled: ${isFirebaseEnabled}, localEmailLoading: ${isEmailPasswordLoading}, localGoogleLoading: ${isGoogleLoading}`);
    
    if (user && !authContextLoading && isFirebaseEnabled) {
      const redirectUrl = searchParams.get("redirect") || "/";
      console.log(`RegisterPage useEffect: User authenticated and all loading finished. Redirecting to: ${redirectUrl}`);
      router.push(redirectUrl);
    } else if (user && authContextLoading) {
      console.log(`RegisterPage useEffect: User present, but auth context still loading. Waiting for authContextLoading to be false.`);
    } else {
      console.log(`RegisterPage useEffect: No user or Firebase not ready/still loading. No redirect.`);
    }
  }, [user, authContextLoading, router, searchParams, isFirebaseEnabled]);

  useEffect(() => {
    if (!isFirebaseEnabled && !authContextLoading && !user) {
      toast({
        title: "Error de Configuración de Firebase",
        description: "Las funciones de autenticación están deshabilitadas. Contacte al administrador o revise la configuración de Firebase.",
        variant: "destructive",
        duration: Infinity, 
      });
    }
  }, [isFirebaseEnabled, authContextLoading, user, toast]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
     if (!isFirebaseEnabled) {
      toast({
        title: "Configuración Incompleta",
        description: "Firebase no está configurado. No se puede registrar.",
        variant: "destructive",
      });
      return;
    }
    setIsEmailPasswordLoading(true);
    console.log("RegisterPage onSubmit: Attempting email/password registration...");
    try {
      await register(data);
      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta ha sido creada. Bienvenido a Blufitt Connect.",
      });
      // Redirection handled by useEffect
    } catch (error) {
      const authError = error as AuthError;
      console.error("RegisterPage onSubmit: Registration error:", authError.code, authError.message);
      let errorMessage = "Error al registrar. Por favor, inténtalo de nuevo.";
      if (authError.code === "auth/email-already-in-use") {
        errorMessage = "Este correo electrónico ya está registrado.";
      } else if (authError.code === "auth/invalid-email") {
        errorMessage = "El formato del correo electrónico no es válido.";
      } else if (authError.code === "auth/weak-password") {
        errorMessage = "La contraseña es demasiado débil.";
      } else if (authError.message?.includes("Firebase no está configurado")) {
        errorMessage = authError.message;
      } else if (authError.message?.includes("Error al configurar la sesión")) {
        errorMessage = "Hubo un problema al configurar tu sesión tras el registro. Por favor, inténtalo de nuevo.";
      }
      toast({
        title: "Error de Registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsEmailPasswordLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isFirebaseEnabled) {
      toast({
        title: "Configuración Incompleta",
        description: "Firebase no está configurado. No se puede registrar con Google.",
        variant: "destructive",
      });
      return;
    }
    setIsGoogleLoading(true);
    console.log("RegisterPage handleGoogleSignUp: Attempting Google sign-in (redirect)...");
    try {
      await signInWithGoogle(); // Triggers redirect
      // No direct user returned. Flow continues via getRedirectResult in AuthContext.
    } catch (error) {
      const authError = error as AuthError;
      console.error("RegisterPage handleGoogleSignUp: Error initiating Google sign-in redirect:", authError.code, authError.message);
      // This error occurs if signInWithRedirect itself fails before navigation.
      toast({
        title: "Error con Google Sign-Up",
        description: authError.message || "No se pudo iniciar el proceso de registro con Google.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  if (authContextLoading && !user) {
    console.log("RegisterPage: AuthContext loading, no user. Displaying loading spinner.");
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          Verificando sesión...
        </p>
      </div>
    );
  }
  
  if (!isFirebaseEnabled && !authContextLoading && !user) {
     console.log("RegisterPage: Firebase not enabled, not auth loading, no user. Displaying config error.");
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
  
  const pageInteractionDisabled = authContextLoading || isEmailPasswordLoading || isGoogleLoading || !isFirebaseEnabled;
  console.log(`RegisterPage render: pageInteractionDisabled: ${pageInteractionDisabled} (authCtxLoading: ${authContextLoading}, emailLoading: ${isEmailPasswordLoading}, googleLoading: ${isGoogleLoading}, firebaseEnabled: ${isFirebaseEnabled})`);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para acceder a Blufitt Connect.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      disabled={pageInteractionDisabled}
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
                        disabled={pageInteractionDisabled}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        disabled={pageInteractionDisabled}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                          disabled={pageInteractionDisabled}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          disabled={pageInteractionDisabled}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={pageInteractionDisabled}>
               {isEmailPasswordLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isEmailPasswordLoading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </Form>

        <div className="my-6 flex items-center">
          <Separator className="flex-1" />
          <span className="mx-4 text-xs text-muted-foreground">O REGISTRARSE CON</span>
          <Separator className="flex-1" />
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleSignUp}
          disabled={pageInteractionDisabled}
        >
          {isGoogleLoading || (authContextLoading && !user) ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mr-2"></div>
          ) : (
            <GoogleLogo className="mr-2 h-5 w-5" />
          )}
          {isGoogleLoading || (authContextLoading && !user) ? "Conectando..." : "Registrarse con Google"}
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Button variant="link" asChild className="p-0 h-auto font-medium text-primary" disabled={pageInteractionDisabled}>
            <Link href="/auth/login">Inicia sesión aquí</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}
