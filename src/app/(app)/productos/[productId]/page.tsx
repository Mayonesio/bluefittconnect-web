// src/app/(app)/productos/[productId]/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Package, Info, Image as ImageIcon, Maximize2, CheckCircle, XCircle, MinusCircle, Thermometer, Scaling, Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Product, ProductDimensionDataItem } from '@/types/product';
import { Timestamp } from "firebase/firestore"; // Assuming sampleProductos might use it or for future Firestore integration.

// Re-using sampleProductos from the main productos page for now.
// In a real app, this data would be fetched from Firestore based on productId.
const sampleProductos: Product[] = [
  { 
    id: 'bfchc001', 
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
    images: ['/images/productImage/RAC-LAT-QR-002.png', '/images/productImage/placeholder.png'],
    price: 550,
    stock: 0, // Example for out of stock
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
];
const DEFAULT_PRODUCT_IMAGE_PATH = '/images/productImage/placeholder.png';

function ProductDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for loading state
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (productId) {
      const foundProduct = sampleProductos.find(p => p.id === productId);
      setProduct(foundProduct || null);
      if (foundProduct && foundProduct.images.length > 0) {
        setSelectedImage(foundProduct.images[0]);
      } else if (foundProduct) {
        setSelectedImage(DEFAULT_PRODUCT_IMAGE_PATH);
      }
    }
  }, [productId]);

  if (product === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
        <Package className="h-20 w-20 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Producto No Encontrado</h1>
        <p className="text-muted-foreground mb-6">
          No pudimos encontrar el producto que estás buscando.
        </p>
        <Button onClick={() => router.push('/productos')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Catálogo
        </Button>
      </div>
    );
  }

  const formatPrice = (priceInCents?: number) => {
    if (priceInCents === undefined) return 'Consultar precio';
    return `${(priceInCents / 100).toFixed(2)}€`;
  };

  const stockStatus = product.stock !== undefined && product.stock > 0 
    ? { text: 'En Stock', Icon: CheckCircle, color: 'text-green-600' } 
    : product.stock === 0 
    ? { text: 'Agotado', Icon: XCircle, color: 'text-destructive' }
    : { text: 'Consultar disponibilidad', Icon: MinusCircle, color: 'text-amber-600' };


  const getDimensionIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('temperatura') || lowerLabel.includes('calor')) return <Thermometer className="h-4 w-4 mr-2 text-muted-foreground" />;
    if (lowerLabel.includes('presión') || lowerLabel.includes('bar')) return <Scaling className="h-4 w-4 mr-2 text-muted-foreground" />; // Using Scaling for pressure
    if (lowerLabel.includes('longitud') || lowerLabel.includes('diámetro') || lowerLabel.includes('medida') || lowerLabel.includes('tamaño') || lowerLabel.includes('rosca') || lowerLabel.includes('espiga')) return <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />;
    return <Info className="h-4 w-4 mr-2 text-muted-foreground" />;
  };

  const openLightbox = (imageSrc: string) => {
    setSelectedImage(imageSrc); // Ensure the lightbox opens with the clicked image
    setIsLightboxOpen(true);
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div 
            className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg cursor-pointer group"
            onClick={() => openLightbox(selectedImage)}
          >
            <Image
              src={selectedImage}
              alt={`Imagen principal de ${product.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.srcset = DEFAULT_PRODUCT_IMAGE_PATH;
                target.src = DEFAULT_PRODUCT_IMAGE_PATH;
              }}
              priority
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Maximize2 className="h-12 w-12 text-white" />
            </div>
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative aspect-square rounded-md overflow-hidden border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    selectedImage === img ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
                  )}
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={img}
                    alt={`Miniatura ${index + 1} de ${product.name}`}
                    fill
                    sizes="10vw"
                    className="object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.srcset = DEFAULT_PRODUCT_IMAGE_PATH;
                        target.src = DEFAULT_PRODUCT_IMAGE_PATH;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary">{product.category}</Badge>
              {product.brand && <Badge variant="outline">{product.brand}</Badge>}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{product.name}</h1>
            {product.title && product.title !== product.name && <p className="text-lg text-muted-foreground mt-1">{product.title}</p>}
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-semibold text-primary">{formatPrice(product.price)}</span>
             <div className={cn("flex items-center text-sm font-medium", stockStatus.color)}>
                <stockStatus.Icon className="mr-1.5 h-4 w-4" />
                {stockStatus.text}
                {product.stock !== undefined && product.stock > 0 && ` (${product.stock} unidades)`}
            </div>
          </div>
          
          {product.measure && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Medida/Tamaño:</span> {product.measure}
            </div>
          )}
          
          <Separator />

          <div className="space-y-3">
             <h2 className="text-xl font-semibold text-foreground">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <Button size="lg" className="w-full md:w-auto" disabled>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Añadir a Proforma (Próximamente)
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="dimensions" className="mt-12">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="dimensions" disabled={!product.dimensionData && !product.dimensionImage}>
            Dimensiones y Especificaciones
          </TabsTrigger>
          <TabsTrigger value="related" disabled={!product.imagesRelated || product.imagesRelated.length === 0}>
            Imágenes Relacionadas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dimensions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dimensiones y Especificaciones Técnicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {product.dimensionData && product.dimensionData.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Característica</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.dimensionData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium flex items-center">
                            {getDimensionIcon(item.label)}
                            {item.label}
                          </TableCell>
                          <TableCell>{item.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {product.dimensionImage && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Esquema de Dimensiones</h3>
                  <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden shadow">
                    <Image 
                      src={product.dimensionImage} 
                      alt={`Esquema de dimensiones de ${product.name}`}
                      fill
                      sizes="50vw"
                      className="object-contain"
                      data-ai-hint="technical drawing blueprint"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none'; // Hide broken image
                      }}
                    />
                  </div>
                </div>
              )}
              {!product.dimensionData && !product.dimensionImage && (
                 <p className="text-muted-foreground">No hay datos de dimensiones o especificaciones disponibles para este producto.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Imágenes Relacionadas o de Aplicación</CardTitle>
            </CardHeader>
            <CardContent>
              {product.imagesRelated && product.imagesRelated.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.imagesRelated.map((img, index) => (
                    <div 
                        key={index} 
                        className="relative aspect-square rounded-md overflow-hidden border shadow-sm group cursor-pointer"
                        onClick={() => openLightbox(img)}
                    >
                      <Image
                        src={img}
                        alt={`Imagen relacionada ${index + 1} de ${product.name}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="product application"
                         onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.srcset = DEFAULT_PRODUCT_IMAGE_PATH;
                            target.src = DEFAULT_PRODUCT_IMAGE_PATH;
                          }}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay imágenes relacionadas disponibles.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <Card className="relative max-w-3xl max-h-[90vh] w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-2 aspect-video relative">
               <Image
                src={selectedImage}
                alt={`Vista ampliada de ${product.name}`}
                fill
                className="object-contain"
                 onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.srcset = DEFAULT_PRODUCT_IMAGE_PATH;
                    target.src = DEFAULT_PRODUCT_IMAGE_PATH;
                  }}
              />
            </CardContent>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-8 w-8 bg-background/50 hover:bg-background/80 rounded-full"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-5 w-5 text-foreground" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando producto...</p>
      </div>
    }>
      <ProductDetailPageContent/>
    </Suspense>
  )
}
