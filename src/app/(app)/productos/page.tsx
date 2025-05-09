// src/app/(app)/productos/page.tsx
"use client"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { PlusCircle, Search, Filter, SlidersHorizontal, Puzzle, Gauge, LayoutGrid, List } from 'lucide-react';
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
import type { Product, ProductDimensionDataItem } from '@/types/product'; // Import the new Product interface
import { Timestamp } from "firebase/firestore";


const sampleProductos: Product[] = [
  { 
    id: '1', 
    code: 'VB-PVC-001',
    gtin13: '8401234567890',
    name: 'Válvula de Bola PVC', 
    title: 'Válvula de Bola PVC Azul con Maneta Roja - PN16',
    category: 'Válvula', 
    brand: 'Bluefitt Basics',
    measure: 'DN25',
    seoTitle: 'Válvula Esfera PVC DN25 PN16 para Riego y Fontanería',
    description: 'Válvula de bola de PVC resistente para control de fluidos en sistemas de riego y fontanería. Cierre rápido y seguro.', 
    dimensionImage: 'https://picsum.photos/seed/valvula-bola-dims/200/150',
    dimensionData: [
      { label: 'Presión Nominal', value: '16 bar' },
      { label: 'Material Cuerpo', value: 'PVC-U' },
      { label: 'Conexión', value: 'Encolar Hembra' }
    ],
    images: ['https://picsum.photos/seed/valvula-bola/400/300', 'https://picsum.photos/seed/valvula-bola-alt/400/300'],
    imagesRelated: ['https://picsum.photos/seed/racor-pvc/100/100'],
    price: 1599, // in cents
    stock: 150,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'valve plastic' 
  },
  { 
    id: '2', 
    code: 'RAC-LAT-QR-002',
    name: 'Racor Enlace Rápido Latón', 
    title: 'Racor de Conexión Rápida en Latón Macho 1/2"',
    category: 'Racor', 
    brand: 'Bluefitt Pro',
    measure: '1/2" Macho',
    description: 'Racor de enlace rápido fabricado en latón para conexiones seguras y duraderas en mangueras y tuberías.', 
    images: ['https://picsum.photos/seed/racor-laton/400/300'],
    price: 550,
    stock: 300,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'fitting brass'
  },
  { 
    id: '3', 
    code: 'CAU-DIG-DN50-003',
    name: 'Caudalímetro Digital DN50', 
    title: 'Caudalímetro Digital Electromagnético DN50 con Display LCD',
    category: 'Caudalímetro', 
    brand: 'Bluefitt Tech',
    measure: 'DN50',
    description: 'Caudalímetro digital de alta precisión para tuberías DN50, ideal para monitorización de consumo de agua.', 
    dimensionData: [{ label: 'Presión Máxima', value: '10 bar' }, {label: 'Alimentación', value: 'Batería Litio'}],
    images: ['https://picsum.photos/seed/caudalimetro-digital/400/300'],
    price: 12000,
    stock: 25,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'flow meter'
  },
  { 
    id: '4', 
    code: 'VM-HF-DN100-004',
    name: 'Válvula Mariposa Hierro Fundido', 
    title: 'Válvula de Mariposa con Palanca Hierro Fundido DN100',
    category: 'Válvula', 
    brand: 'Bluefitt Industrial',
    measure: 'DN100',
    description: 'Válvula de mariposa robusta para grandes caudales, cuerpo de hierro fundido y disco inoxidable.', 
    dimensionData: [{ label: 'Presión Nominal', value: '10 bar' }, {label: 'Material Cuerpo', value: 'Hierro Fundido GG25'}],
    images: ['https://picsum.photos/seed/valvula-mariposa/400/300'],
    price: 7500,
    stock: 50,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'valve industrial'
  },
  { 
    id: '5', 
    code: 'CODO-PP-90-005',
    name: 'Codo 90º Polipropileno', 
    title: 'Codo de 90 Grados en Polipropileno para Riego',
    category: 'Racor', 
    brand: 'Bluefitt Garden',
    measure: '25mm',
    description: 'Codo de 90 grados en polipropileno (PP) para sistemas de riego por goteo y microaspersión.', 
    images: ['https://picsum.photos/seed/codo-pp/400/300'],
    price: 230,
    stock: 500,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'pipe fitting'
  },
  { 
    id: '6', 
    code: 'CAU-ULT-PORT-006',
    name: 'Caudalímetro Ultrasónico Portátil', 
    title: 'Medidor de Caudal Ultrasónico Portátil Clamp-On',
    category: 'Caudalímetro', 
    brand: 'Bluefitt Advanced',
    description: 'Medidor de caudal ultrasónico portátil no invasivo (clamp-on) para diversas aplicaciones y diámetros de tubería.', 
    images: ['https://picsum.photos/seed/caudalimetro-ultrasonico/400/300'],
    price: 35000,
    stock: 10,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'meter portable'
  },
];

// Define categories based on Product['category'] which is now string
const categoriesList: { value: string, label: string }[] = [
    { value: 'Válvula', label: 'Válvulas' },
    { value: 'Racor', label: 'Racores' },
    { value: 'Caudalímetro', label: 'Caudalímetros' },
];

type ViewMode = 'grid' | 'list';

function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth(); 

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    const initialCategory = searchParams.get('categoria');
    if (initialCategory && categoriesList.some(c => c.value.toLowerCase() === initialCategory.toLowerCase())) {
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
    if (newSelectedCategories.length > 0) { // Simplified: always set if any selected, or delete
       newParams.set('categoria', newSelectedCategories.join(',')); // Could join for multiple, or handle single
    } else { 
      newParams.delete('categoria');
    }
    router.push(`/productos?${newParams.toString()}`);
  };

  const filteredProductos = useMemo(() => {
    return sampleProductos.filter(producto => {
      const matchesSearch = producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            producto.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (producto.title && producto.title.toLowerCase().includes(searchTerm.toLowerCase()));
      const productCategoryLower = producto.category.toLowerCase();
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(sc => productCategoryLower === sc);
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategories]);

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase() === 'válvula') return <SlidersHorizontal className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    if (category.toLowerCase() === 'racor') return <Puzzle className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    if (category.toLowerCase() === 'caudalímetro') return <Gauge className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    return null;
  }

  const formatPrice = (priceInCents?: number) => {
    if (priceInCents === undefined) return 'N/A';
    return `${(priceInCents / 100).toFixed(2)}€`;
  };

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
                  <Card key={producto.id} className="overflow-hidden flex flex-col group">
                    <div className="relative w-full h-48">
                      <Image
                        src={producto.images[0] || 'https://picsum.photos/400/300'} // Fallback image
                        alt={producto.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={producto.aiHint || producto.category.toLowerCase()}
                      />
                       <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center shadow">
                          {getCategoryIcon(producto.category)}
                          {categoriesList.find(c => c.value.toLowerCase() === producto.category.toLowerCase())?.label || producto.category}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{producto.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
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
                      <Button variant="outline" className="w-full" disabled>Ver Detalles</Button>
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
                        <Image 
                          src={producto.images[0] || 'https://picsum.photos/64/64'} // Fallback image
                          alt={producto.name} 
                          width={64} 
                          height={64} 
                          className="rounded-md object-cover aspect-square"
                          data-ai-hint={producto.aiHint || producto.category.toLowerCase()}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{producto.name}</TableCell>
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
                        <Button variant="outline" size="sm" disabled>Ver Detalles</Button>
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando productos...</p>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  );
}
