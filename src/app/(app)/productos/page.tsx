// src/app/(app)/productos/page.tsx
"use client"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Search, Filter, SlidersHorizontal, Puzzle, Gauge, LayoutGrid, List, AlertTriangle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
// import type { Product } from '@/types/product'; // Type is used by the hook
// import { Timestamp } from "firebase/firestore"; // Not needed directly here
import { useProducts } from "@/hooks/use-products"; // Import the hook

const DEFAULT_PRODUCT_IMAGE_PATH = '/images/productImage/placeholder.png';
const DEFAULT_PRODUCT_THUMB_PATH = '/images/productImage/placeholder-thumb.png';

// sampleProductos array is removed as data will come from the hook

const categoriesList: { value: string, label: string }[] = [
    { value: 'Válvula', label: 'Válvulas' },
    { value: 'Racor', label: 'Racores' },
    { value: 'Caudalímetro', label: 'Caudalímetros' },
    { value: 'codo corto', label: 'Codos Cortos'} 
    // Consider fetching categories from Firestore or a config file if they are dynamic
];

type ViewMode = 'grid' | 'list';

function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); 

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Handle initial category filter from URL params
  const initialCategoryQuery = searchParams.get('categoria');
  useEffect(() => {
    if (initialCategoryQuery) {
      const categoriesFromQuery = initialCategoryQuery.toLowerCase().split(',');
      const validCategories = categoriesFromQuery.filter(cat => 
        categoriesList.some(c => c.value.toLowerCase() === cat)
      );
      if (validCategories.length > 0 && validCategories.join(',') !== selectedCategories.join(',')) {
        setSelectedCategories(validCategories);
      }
    } else if (selectedCategories.length > 0 && !initialCategoryQuery) {
      // Clear categories if URL param is removed
      setSelectedCategories([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategoryQuery]);
  
  // Fetch products using the hook. The hook itself can handle one primary category filter if needed,
  // or client-side filtering for multiple categories. For simplicity, we'll let the hook fetch based on one
  // if one is dominant, or all, and then apply client-side filtering.
  // For now, useProducts doesn't take a filter, we will filter client-side.
  // Let's modify useProducts to accept a single primary category from URL if present,
  // then filter further client-side if multiple selectedCategories exist.
  const primaryCategoryFilter = selectedCategories.length === 1 ? selectedCategories[0] : undefined;
  const { products: allFetchedProducts, loading: productsLoading, error: productsError } = useProducts(primaryCategoryFilter);

  const handleCategoryChange = (categoryValue: string) => {
    const categoryKey = categoryValue.toLowerCase();
    let newSelectedCategories: string[];

    if (selectedCategories.includes(categoryKey)) {
      newSelectedCategories = selectedCategories.filter(c => c !== categoryKey);
    } else {
      newSelectedCategories = [...selectedCategories, categoryKey];
    }
    // setSelectedCategories(newSelectedCategories); // This will be set by useEffect on query change

    const newParams = new URLSearchParams(searchParams.toString()); 
    if (newSelectedCategories.length > 0) { 
       newParams.set('categoria', newSelectedCategories.join(',')); 
    } else { 
      newParams.delete('categoria');
    }
    router.push(`/productos?${newParams.toString()}`);
  };

  const filteredProductos = useMemo(() => {
    return allFetchedProducts.filter(producto => {
      const nameMatch = producto.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descriptionMatch = producto.description.toLowerCase().includes(searchTerm.toLowerCase());
      const titleMatch = producto.title ? producto.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const codeMatch = producto.code.toLowerCase().includes(searchTerm.toLowerCase());
      const brandMatch = producto.brand ? producto.brand.toLowerCase().includes(searchTerm.toLowerCase()) : false;

      const matchesSearch = nameMatch || descriptionMatch || titleMatch || codeMatch || brandMatch;
      
      const productCategoryLower = producto.category.toLowerCase();
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(sc => productCategoryLower === sc);
      return matchesSearch && matchesCategory; // isActive is handled by the hook's query now
    });
  }, [searchTerm, selectedCategories, allFetchedProducts]);

  const getCategoryIcon = (category: string) => {
    const catLower = category.toLowerCase();
    if (catLower === 'válvula') return <SlidersHorizontal className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    if (catLower === 'racor' || catLower === 'codo corto') return <Puzzle className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    if (catLower === 'caudalímetro') return <Gauge className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    return null;
  }

  const formatPrice = (priceInCents?: number) => {
    if (priceInCents === undefined) return 'Consultar';
    return `${(priceInCents / 100).toFixed(2)}€`;
  };

  if (productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error al Cargar Productos</h2>
        <p className="text-muted-foreground mb-6">
          {productsError.message || "No se pudieron cargar los productos. Inténtelo de nuevo más tarde."}
        </p>
        <Button onClick={() => router.refresh()} variant="outline">Reintentar</Button>
      </div>
    );
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
        <Button disabled={!user || authLoading} title={!user ? "Debe iniciar sesión para añadir productos" : ""}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Producto (Próximamente)
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
                  {selectedCategories.length > 0 && <span className="ml-1.5 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{selectedCategories.length}</span>}
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
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'outline'} size="icon" onClick={() => setViewMode('grid')} title="Vista de cuadrícula">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'outline'} size="icon" onClick={() => setViewMode('list')} title="Vista de lista">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProductos.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProductos.map((producto) => (
                  <Card key={producto.id} className="overflow-hidden flex flex-col group relative"> {/* Added relative for badge */}
                    <Link href={`/productos/${producto.id}`} className="block relative w-full h-48 bg-muted">
                      <Image
                        src={producto.images[0] || DEFAULT_PRODUCT_IMAGE_PATH} 
                        alt={producto.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-105" // Changed object-cover to object-contain
                        data-ai-hint={producto.aiHint || producto.category.toLowerCase()}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.srcset = DEFAULT_PRODUCT_IMAGE_PATH; 
                            target.src = DEFAULT_PRODUCT_IMAGE_PATH; 
                          }}
                      />
                    </Link>
                       <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center shadow">
                          {getCategoryIcon(producto.category)}
                          {categoriesList.find(c => c.value.toLowerCase() === producto.category.toLowerCase())?.label || producto.category}
                      </div>
                    <CardHeader className="pb-2">
                      <Link href={`/productos/${producto.id}`}>
                        <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors">{producto.name}</CardTitle>
                      </Link>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                         {producto.measure && `Medida: ${producto.measure}`}
                         {producto.measure && producto.brand && ' • '}
                         {producto.brand && `Marca: ${producto.brand}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{producto.description}</p>
                       <p className="text-base font-semibold text-foreground">{formatPrice(producto.price)}</p>
                    </CardContent>
                    <CardContent className="pt-0">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/productos/${producto.id}`}>Ver Detalles</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : ( // List view
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="hidden md:table-cell">Marca</TableHead>
                    <TableHead className="hidden md:table-cell">Medida</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell>
                        <Link href={`/productos/${producto.id}`} className="block w-16 h-16 bg-muted rounded-md overflow-hidden">
                          <Image 
                            src={producto.images[0] || DEFAULT_PRODUCT_THUMB_PATH} 
                            alt={producto.name} 
                            width={64} 
                            height={64} 
                            className="object-contain w-full h-full" // Changed object-cover
                            data-ai-hint={producto.aiHint || producto.category.toLowerCase()}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.srcset = DEFAULT_PRODUCT_THUMB_PATH;
                                target.src = DEFAULT_PRODUCT_THUMB_PATH;
                              }}
                          />
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/productos/${producto.id}`} className="hover:text-primary transition-colors">
                          {producto.name}
                        </Link>
                        <p className="text-xs text-muted-foreground md:hidden">{producto.brand} {producto.measure}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                         {getCategoryIcon(producto.category)}
                         {categoriesList.find(c => c.value.toLowerCase() === producto.category.toLowerCase())?.label || producto.category}
                        </div>
                        </TableCell>
                      <TableCell className="hidden md:table-cell">{producto.brand || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell">{producto.measure || 'N/A'}</TableCell>
                      <TableCell>{formatPrice(producto.price)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/productos/${producto.id}`}>Ver Detalles</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
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
    // Suspense for useSearchParams and client-side navigation
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando página de productos...</p>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  );
}
