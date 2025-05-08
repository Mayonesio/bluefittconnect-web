// src/app/(app)/productos/page.tsx
"use client"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { PlusCircle, Search, Filter, SlidersHorizontal, Puzzle, Gauge } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState, useMemo, useEffect, Suspense } from "react"; // Ensure Suspense is imported
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/auth-context";

interface Producto {
  id: string;
  nombre: string;
  categoria: 'Válvula' | 'Racor' | 'Caudalímetro';
  material?: string;
  presionMaxima?: string;
  imageUrl: string;
  descripcion: string;
  aiHint: string;
  precio?: string;
}

const sampleProductos: Producto[] = [
  { id: '1', nombre: 'Válvula de Bola PVC', categoria: 'Válvula', material: 'PVC', presionMaxima: '16 bar', imageUrl: 'https://picsum.photos/seed/valvula-bola/400/300', descripcion: 'Válvula de bola de PVC resistente para control de fluidos.', aiHint: 'valve plastic', precio: '15.99€' },
  { id: '2', nombre: 'Racor Enlace Rápido Latón', categoria: 'Racor', material: 'Latón', imageUrl: 'https://picsum.photos/seed/racor-laton/400/300', descripcion: 'Racor de enlace rápido fabricado en latón para conexiones seguras.', aiHint: 'fitting brass', precio: '5.50€' },
  { id: '3', nombre: 'Caudalímetro Digital DN50', categoria: 'Caudalímetro', presionMaxima: '10 bar', imageUrl: 'https://picsum.photos/seed/caudalimetro-digital/400/300', descripcion: 'Caudalímetro digital de alta precisión para tuberías DN50.', aiHint: 'flow meter', precio: '120.00€' },
  { id: '4', nombre: 'Válvula Mariposa Hierro Fundido', categoria: 'Válvula', material: 'Hierro Fundido', presionMaxima: '10 bar', imageUrl: 'https://picsum.photos/seed/valvula-mariposa/400/300', descripcion: 'Válvula de mariposa robusta para grandes caudales.', aiHint: 'valve industrial', precio: '75.00€' },
  { id: '5', nombre: 'Codo 90º Polipropileno', categoria: 'Racor', material: 'Polipropileno', imageUrl: 'https://picsum.photos/seed/codo-pp/400/300', descripcion: 'Codo de 90 grados en polipropileno para sistemas de riego.', aiHint: 'pipe fitting', precio: '2.30€' },
  { id: '6', nombre: 'Caudalímetro Ultrasónico Portátil', categoria: 'Caudalímetro', imageUrl: 'https://picsum.photos/seed/caudalimetro-ultrasonico/400/300', descripcion: 'Medidor de caudal ultrasónico portátil para diversas aplicaciones.', aiHint: 'meter portable', precio: '350.00€' },
];

const categoriesList: { value: Producto['categoria'], label: string }[] = [
    { value: 'Válvula', label: 'Válvulas' },
    { value: 'Racor', label: 'Racores' },
    { value: 'Caudalímetro', label: 'Caudalímetros' },
];

function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth(); 

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const initialCategory = searchParams.get('categoria');
    if (initialCategory && categoriesList.some(c => c.value.toLowerCase() === initialCategory)) {
      setSelectedCategories([initialCategory.toLowerCase()]);
    } else if (initialCategory === null && searchParams.toString() === '') {
       setSelectedCategories([]);
    }
  }, [searchParams]); 

  const handleCategoryChange = (categoryValue: string) => {
    const categoryKey = categoryValue.toLowerCase();
    let newSelectedCategories: string[];

    if (selectedCategories.includes(categoryKey)) {
      newSelectedCategories = selectedCategories.filter(c => c !== categoryKey);
    } else {
      newSelectedCategories = [...selectedCategories, categoryKey];
    }
    setSelectedCategories(newSelectedCategories);

    const newParams = new URLSearchParams(searchParams.toString()); 
    if (newSelectedCategories.length === 1) {
       newParams.set('categoria', newSelectedCategories[0]);
    } else if (newSelectedCategories.length > 1) {
       newParams.delete('categoria');
    } else { 
      newParams.delete('categoria');
    }
    router.push(`/productos?${newParams.toString()}`);
  };

  const filteredProductos = useMemo(() => {
    return sampleProductos.filter(producto => {
      const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const productCategoryLower = producto.categoria.toLowerCase();
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(productCategoryLower);
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategories]);

  const getCategoryIcon = (category: Producto['categoria']) => {
    if (category === 'Válvula') return <SlidersHorizontal className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    if (category === 'Racor') return <Puzzle className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    if (category === 'Caudalímetro') return <Gauge className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    return null;
  }

  return (
     <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Catálogo de Productos</h1>
          <p className="text-muted-foreground">
            Explore nuestra selección de válvulas, racores y caudalímetros.
          </p>
        </div>
        <Button disabled={!user || loading} title={!user ? "Debe iniciar sesión para añadir productos" : ""}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Producto
        </Button>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar por Categoría
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Categoría</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categoriesList.map(cat => (
                  <DropdownMenuCheckboxItem
                    key={cat.value}
                    checked={selectedCategories.includes(cat.value.toLowerCase())}
                    onCheckedChange={() => handleCategoryChange(cat.value)}
                  >
                    {cat.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProductos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProductos.map((producto) => (
                <Card key={producto.id} className="overflow-hidden flex flex-col group">
                  <div className="relative w-full h-48">
                    <Image
                      src={producto.imageUrl}
                      alt={producto.nombre}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={producto.aiHint}
                    />
                     <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center shadow">
                        {getCategoryIcon(producto.categoria)}
                        {categoriesList.find(c => c.value === producto.categoria)?.label || producto.categoria}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{producto.nombre}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {producto.material && `Material: ${producto.material}`}
                      {producto.material && producto.presionMaxima && ' • '}
                      {producto.presionMaxima && `P. Máx: ${producto.presionMaxima}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{producto.descripcion}</p>
                     {producto.precio && <p className="text-base font-semibold text-foreground">{producto.precio}</p>}
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button variant="outline" className="w-full" disabled>Ver Detalles</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No se encontraron productos</h3>
              <p className="text-muted-foreground">Intente ajustar su búsqueda o filtros.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando productos...</p>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  );
}
