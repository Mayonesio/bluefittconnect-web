// src/app/(app)/blog/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Newspaper, Droplets, Cpu, Lightbulb, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

interface ArticuloBlog {
  id: string;
  titulo: string;
  slug: string;
  extracto: string;
  imageUrl: string;
  fechaPublicacion: string;
  categoria: string;
  autor: string;
  aiHint: string;
  icono: React.ElementType;
}

const sampleArticulosBlog: ArticuloBlog[] = [
  { id: '1', titulo: 'Optimización del Riego por Goteo en Cultivos Extensivos', slug: 'riego-goteo-cultivos', extracto: 'Descubra técnicas avanzadas para maximizar la eficiencia del riego por goteo y mejorar la producción...', imageUrl: 'https://picsum.photos/seed/riego-goteo/400/250', fechaPublicacion: '2024-07-28', categoria: 'Consejos de Riego', autor: 'Ing. Agrónomo', aiHint: 'irrigation drip', icono: Droplets },
  { id: '2', titulo: 'Nuevas Válvulas Inteligentes para el Control Remoto de Sistemas', slug: 'valvulas-inteligentes', extracto: 'Conozca las últimas innovaciones en válvulas con conectividad para una gestión agrícola más eficiente.', imageUrl: 'https://picsum.photos/seed/smart-valve/400/250', fechaPublicacion: '2024-07-25', categoria: 'Novedades', autor: 'Equipo Bluefitt', aiHint: 'valve technology', icono: Cpu },
  { id: '3', titulo: 'La Importancia de los Caudalímetros en la Agricultura de Precisión', slug: 'caudalimetros-precision', extracto: 'Entienda cómo los caudalímetros son clave para una agricultura sostenible y rentable.', imageUrl: 'https://picsum.photos/seed/flowmeter-agriculture/400/250', fechaPublicacion: '2024-07-22', categoria: 'Tecnología Agrícola', autor: 'Dr. Riego Eficiente', aiHint: 'meter field', icono: Lightbulb },
  { id: '4', titulo: 'Caso de Éxito: Aumento de Rendimiento con Racores Antifugas', slug: 'racores-antifugas-exito', extracto: 'Un estudio de caso real que demuestra cómo la elección correcta de racores impacta positivamente.', imageUrl: 'https://picsum.photos/seed/fitting-success/400/250', fechaPublicacion: '2024-07-18', categoria: 'Casos de Éxito', autor: 'AgroTestimonios', aiHint: 'pipe connection', icono: Award },
];

export default function BlogPage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Blog de Bluefitt Connect</h1>
          <p className="text-muted-foreground">
            Artículos, novedades y consejos sobre riego agrícola y tecnología.
          </p>
        </div>
        <Button asChild disabled={!user || loading} title={!user ? "Debe iniciar sesión para crear artículos" : ""}>
          <Link href="/blog/nuevo"> 
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Artículo
          </Link>
        </Button>
      </header>

      {sampleArticulosBlog.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleArticulosBlog.map((articulo) => (
            <Card key={articulo.id} className="flex flex-col overflow-hidden group">
              <div className="relative w-full h-48">
                <Image 
                  src={articulo.imageUrl} 
                  alt={articulo.titulo} 
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={articulo.aiHint}
                />
                <div className="absolute top-2 right-2">
                   <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow">
                    <articulo.icono className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    {articulo.categoria}
                   </Badge>
                </div>
              </div>
              <CardHeader className="pb-3">
                <Link href={`/blog/${articulo.slug}`} className="hover:underline">
                  <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{articulo.titulo}</CardTitle>
                </Link>
                <CardDescription className="text-xs text-muted-foreground">
                  Por {articulo.autor} el {articulo.fechaPublicacion}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{articulo.extracto}</p>
              </CardContent>
              <CardContent className="pt-0 flex items-center justify-end gap-2">
                 <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog/${articulo.slug}`}>
                    Leer Más
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">No hay artículos todavía</h3>
            <p className="text-muted-foreground mb-4">Comience creando su primer artículo para el blog.</p>
            <Button asChild disabled={!user || loading} title={!user ? "Debe iniciar sesión para crear artículos" : ""}>
              <Link href="/blog/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Artículo
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
