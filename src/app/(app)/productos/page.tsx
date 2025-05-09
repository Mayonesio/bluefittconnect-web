// src/app/(app)/productos/page.tsx
"use client"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
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
import type { Product } from '@/types/product'; 
import { Timestamp } from "firebase/firestore";

const DEFAULT_PRODUCT_IMAGE_PATH = '/images/productImage/placeholder.png';
const DEFAULT_PRODUCT_THUMB_PATH = '/images/productImage/placeholder-thumb.png';


const sampleProductos: Product[] = [
  { 
    id: 'bfchc001', // Using code as ID for uniqueness in sample
    code: 'bfchc001',
    gtin13: '8436586060015',
    name: 'Codo Rosca Macho Corto 6 x 1/8"', 
    title: 'CODO ROSCA MACHO CORTO',
    category: 'codo corto', 
    brand: 'Bluefitt International',
    measure: '6 x 1/8"',
    seoTitle: 'CODO ROSCA MACHO CORTO 6 x 1/8" · COMANDO HIDRÁULICO · POLIAMIDA REFORZADA - BLUEFITT - INSTALACIONES HIDRÁULICAS Y MONTAJES DE RIEGO',
    description: 'Codo para sistemas hidráulicos, excelente para instalaciones agrícolas en interior, exterior y aplicaciones de campo hidráulico. Fabricado en poliamida reforzada con fibra de vidrio para una mayor durabilidad y resistencia a la presión y agentes químicos. Diseño optimizado para facilitar el montaje y asegurar una conexión estanca.', 
    dimensionImage: '/images/productImage/codotab.png',
    dimensionData: [
      { label: 'Diámetro Tubo', value: '6 mm' },
      { label: 'Rosca', value: '1/8"' },
      { label: 'Longitud Total', value: '35 mm' },
      { label: 'Longitud Rosca', value: '24 mm' },
      { label: 'Longitud Espiga', value: '12 mm' }
    ],
    images: ['/images/productImage/ch001c.png', '/images/productImage/codocottab.png', '/images/productImage/recomend.png', '/images/productImage/tuerca.png'],
    imagesRelated: ['/images/productImage/ch001c+b.png'],
    price: 1599, 
    stock: 150,  
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'fitting plastic pipe' 
  },
  { 
    id: 'RAC-LAT-QR-002', 
    code: 'RAC-LAT-QR-002',
    name: 'Racor Enlace Rápido Latón', 
    title: 'Racor de Conexión Rápida en Latón Macho 1/2"',
    category: 'Racor', 
    brand: 'Bluefitt Pro',
    measure: '1/2" Macho',
    description: 'Racor de enlace rápido fabricado en latón para conexiones seguras y duraderas en mangueras y tuberías. Ideal para aplicaciones que requieren conexiones y desconexiones frecuentes. Alta resistencia a la corrosión.', 
    images: ['/images/productImage/RAC-LAT-QR-002.png', '/images/productImage/placeholder.png'], // Added placeholder for gallery demo
    price: 550,
    stock: 300,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'fitting brass'
  },
  { 
    id: 'CAU-DIG-DN50-003', 
    code: 'CAU-DIG-DN50-003',
    name: 'Caudalímetro Digital DN50', 
    title: 'Caudalímetro Digital Electromagnético DN50 con Display LCD',
    category: 'Caudalímetro', 
    brand: 'Bluefitt Tech',
    measure: 'DN50',
    description: 'Caudalímetro digital de alta precisión para tuberías DN50, ideal para monitorización de consumo de agua en agricultura de precisión. Display LCD de fácil lectura y batería de larga duración.', 
    dimensionData: [{ label: 'Presión Máxima', value: '10 bar' }, {label: 'Alimentación', value: 'Batería Litio'}],
    images: ['/images/productImage/CAU-DIG-DN50-003.png'],
    price: 12000,
    stock: 25,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'flow meter'
  },
  { 
    id: 'VM-HF-DN100-004', 
    code: 'VM-HF-DN100-004',
    name: 'Válvula Mariposa Hierro Fundido', 
    title: 'Válvula de Mariposa con Palanca Hierro Fundido DN100',
    category: 'Válvula', 
    brand: 'Bluefitt Industrial',
    measure: 'DN100',
    description: 'Válvula de mariposa robusta para grandes caudales, cuerpo de hierro fundido y disco inoxidable. Perfecta para control de flujo en sistemas de riego principales y distribución de agua.', 
    dimensionData: [{ label: 'Presión Nominal', value: '10 bar' }, {label: 'Material Cuerpo', value: 'Hierro Fundido GG25'}],
    images: ['/images/productImage/VM-HF-DN100-004.png'],
    price: 7500,
    stock: 50,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'valve industrial'
  },
  { 
    id: 'CODO-PP-90-005', 
    code: 'CODO-PP-90-005',
    name: 'Codo 90º Polipropileno', 
    title: 'Codo de 90 Grados en Polipropileno para Riego',
    category: 'Racor', 
    brand: 'Bluefitt Garden',
    measure: '25mm',
    description: 'Codo de 90 grados en polipropileno (PP) para sistemas de riego por goteo y microaspersión. Resistente a UV y fertilizantes comunes.', 
    images: ['/images/productImage/CODO-PP-90-005.png'],
    price: 230,
    stock: 500,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'pipe fitting'
  },
  { 
    id: 'CAU-ULT-PORT-006', 
    code: 'CAU-ULT-PORT-006',
    name: 'Caudalímetro Ultrasónico Portátil', 
    title: 'Medidor de Caudal Ultrasónico Portátil Clamp-On',
    category: 'Caudalímetro', 
    brand: 'Bluefitt Advanced',
    description: 'Medidor de caudal ultrasónico portátil no invasivo (clamp-on) para diversas aplicaciones y diámetros de tubería. Fácil de usar para auditorías de consumo y verificaciones de caudal.', 
    images: ['/images/productImage/CAU-ULT-PORT-006.png'],
    price: 35000,
    stock: 10,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    aiHint: 'meter portable'
  },
];

const categoriesList: { value: string, label: string }[] = [
    { value: 'Válvula', label: 'Válvulas' },
    { value: 'Racor', label: 'Racores' },
    { value: 'Caudalímetro', label: 'Caudalímetros' },
    { value: 'codo corto', label: 'Codos Cortos'} 
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
    if (newSelectedCategories.length > 0) { 
       newParams.set('categoria', newSelectedCategories.join(',')); 
    } else { 
      newParams.delete('categoria');
    }
    router.push(`/productos?${newParams.toString()}`);
  };

  const filteredProductos = useMemo(() => {
    return sampleProductos.filter(producto => {
      const nameMatch = producto.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descriptionMatch = producto.description.toLowerCase().includes(searchTerm.toLowerCase());
      const titleMatch = producto.title ? producto.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const codeMatch = producto.code.toLowerCase().includes(searchTerm.toLowerCase());
      const brandMatch = producto.brand ? producto.brand.toLowerCase().includes(searchTerm.toLowerCase()) : false;

      const matchesSearch = nameMatch || descriptionMatch || titleMatch || codeMatch || brandMatch;
      
      const productCategoryLower = producto.category.toLowerCase();
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(sc => productCategoryLower === sc);
      return matchesSearch && matchesCategory && producto.isActive;
    });
  }, [searchTerm, selectedCategories]);

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
                    <Link href={`/productos/${producto.id}`} className="block relative w-full h-48">
                      <Image
                        src={producto.images[0] || DEFAULT_PRODUCT_IMAGE_PATH} 
                        alt={producto.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                        <Link href={`/productos/${producto.id}`}>
                          <Image 
                            src={producto.images[0] || DEFAULT_PRODUCT_THUMB_PATH} 
                            alt={producto.name} 
                            width={64} 
                            height={64} 
                            className="rounded-md object-cover aspect-square"
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
