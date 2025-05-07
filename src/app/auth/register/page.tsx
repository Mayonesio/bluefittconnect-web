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
import { Eye, EyeOff, UserPlus } from "lucide-react";

const registerSchema = z.object({
  // name: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50, "El nombre es demasiado largo."),
  email: z.string().email("Debe ser un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string().min(6, "La confirmación de contraseña debe tener al menos 6 caracteres."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);


  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      // name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(data);
      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta ha sido creada. Bienvenido a Blufitt Connect.",
      });
      // Redirect handled by useEffect
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Error al registrar. Por favor, inténtalo de nuevo.";
      if (authError.code === "auth/email-already-in-use") {
        errorMessage = "Este correo electrónico ya está registrado.";
      } else if (authError.code === "auth/invalid-email") {
        errorMessage = "El formato del correo electrónico no es válido.";
      } else if (authError.code === "auth/weak-password") {
        errorMessage = "La contraseña es demasiado débil.";
      }
      toast({
        title: "Error de Registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">{authLoading ? "Verificando sesión..." : "Redirigiendo..."}</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para acceder a Blufitt Connect.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@correo.com" {...field} />
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
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
               {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Button variant="link" asChild className="p-0 h-auto font-medium text-primary">
            <Link href="/auth/login">Inicia sesión aquí</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}
