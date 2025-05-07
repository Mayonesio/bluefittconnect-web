// src/app/(app)/blog/nuevo/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Image as ImageIcon, PackagePlus, Droplets, Cpu, Award, Lightbulb, LogIn } from 'lucide-react';
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


const articuloBlogSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres.").max(150, "El título es demasiado largo."),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe ser alfanumérico en minúsculas con guiones.").min(3, "El slug debe tener al menos 3 caracteres."),
  categoria: z.string().min(1, "La categoría es obligatoria."),
  extracto: z.string().min(10, "El extracto debe tener al menos 10 caracteres.").max(300, "El extracto es demasiado largo."),
  contenido: z.string().min(50, "El contenido debe tener al menos 50 caracteres."),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  autor: z.string().min(2, "El nombre del autor es obligatorio."),
});

type ArticuloBlogFormValues = z.infer<typeof articuloBlogSchema>;

const categoriasBlog = [
  { value: "novedades", label: "Novedades de Productos", icon: PackagePlus },
  { value: "consejos-riego", label: "Consejos de Riego", icon: Droplets },
  { value: "tecnologia-agricola", label: "Tecnología Agrícola", icon: Cpu },
  { value: "casos-exito", label: "Casos de Éxito", icon: Award },
  { value: "innovacion", label: "Innovación y Futuro", icon: Lightbulb },
];

export default function NuevoArticuloBlogPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/blog/nuevo");
    }
  }, [user, loading, router]);

  const form = useForm<ArticuloBlogFormValues>({
    resolver: zodResolver(articuloBlogSchema),
    defaultValues: {
      titulo: "",
      slug: "",
      categoria: "",
      extracto: "",
      contenido: "",
      imageUrl: "",
      autor: user?.displayName || user?.email || "", // Prefill author if available
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("autor", user.displayName || user.email || "");
    }
  }, [user, form]);

  function onSubmit(data: ArticuloBlogFormValues) {
    console.log(data);
    // Here you would typically send data to your backend/Firebase
    toast({
      title: "¡Artículo de Blog Enviado!",
      description: `"${data.titulo}" ha sido enviado con éxito. (Esto es una demo, no se guardaron datos reales).`,
    });
    form.reset();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando editor...</p>
      </div>
    );
  }

  if (!user) {
     // This is a fallback, useEffect should redirect
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
        <Lightbulb className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground mb-6">
          Debes iniciar sesión para crear un nuevo artículo.
        </p>
        <Button asChild>
          <Link href="/auth/login?redirect=/blog/nuevo">
            <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
          </Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver al Blog</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Crear Nuevo Artículo de Blog</h1>
          <p className="text-muted-foreground">
            Complete los detalles a continuación para publicar un nuevo artículo.
          </p>
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Artículo</CardTitle>
              <CardDescription>Proporcione la información principal para su artículo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el título del artículo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="ej., mi-nuevo-articulo" {...field} />
                    </FormControl>
                    <FormDescription>
                      Esto será parte de la URL. Use letras minúsculas, números y guiones.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriasBlog.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="h-4 w-4 text-muted-foreground" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="autor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del autor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Imagen Destacada (Opcional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enlace a una imagen que se destacará con su artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contenido del Artículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="extracto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extracto</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Un breve resumen de su artículo (máx 300 caracteres)"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contenido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido Principal</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escriba aquí su artículo completo. Se admite Markdown."
                        className="min-h-[300px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use Markdown para formatear (ej., # Encabezado, *itálica*, **negrita**).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/blog">Cancelar</Link>
            </Button>
            <Button type="submit">Publicar Artículo</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
