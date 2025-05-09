// src/app/(app)/productos/[productId]/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Package, Info, Image as ImageIcon, Maximize2, CheckCircle, XCircle, MinusCircle, Thermometer, Scaling, Ruler, AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
// import type { Product } from '@/types/product'; // Type is used by the hook
// import { Timestamp } from "firebase/firestore"; // Not needed directly here
import { useProductById } from "@/hooks/use-product-by-id"; // Import the hook

// sampleProductos array is removed

const DEFAULT_PRODUCT_IMAGE_PATH = '/images/productImage/placeholder.png';

function ProductDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const { product, loading, error } = useProductById(productId);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    } else if (product) { // Product exists but has no images
      setSelectedImage(DEFAULT_PRODUCT_IMAGE_PATH);
    }
  }, [product]);

  if (loading || product === undefined) { // product === undefined also indicates initial loading from hook
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
        <AlertTriangle className="h-20 w-20 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2 text-destructive">Error al Cargar el Producto</h1>
        <p className="text-muted-foreground mb-6">
          {error.message || "No se pudo cargar la información del producto. Por favor, intente de nuevo."}
        </p>
        <Button onClick={() => router.push('/productos')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Catálogo
        </Button>
      </div>
    );
  }
  
  if (!product) { // product is null, meaning not found after loading and no error
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
        <Package className="h-20 w-20 text-muted-foreground mb-4" />
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
    if (lowerLabel.includes('presión') || lowerLabel.includes('bar')) return <Scaling className="h-4 w-4 mr-2 text-muted-foreground" />; 
    if (lowerLabel.includes('longitud') || lowerLabel.includes('diámetro') || lowerLabel.includes('medida') || lowerLabel.includes('tamaño') || lowerLabel.includes('rosca') || lowerLabel.includes('espiga')) return <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />;
    return <Info className="h-4 w-4 mr-2 text-muted-foreground" />;
  };

  const openLightbox = (imageSrc: string) => {
    setSelectedImage(imageSrc); 
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
            className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg cursor-pointer group bg-muted" // Added bg-muted
            onClick={() => openLightbox(selectedImage || DEFAULT_PRODUCT_IMAGE_PATH)}
          >
            <Image
              src={selectedImage || DEFAULT_PRODUCT_IMAGE_PATH}
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
                    "relative aspect-square rounded-md overflow-hidden border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-muted", // Added bg-muted
                    selectedImage === img ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
                  )}
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={img}
                    alt={`Miniatura ${index + 1} de ${product.name}`}
                    fill
                    sizes="10vw"
                    className="object-contain" // Changed object-cover to object-contain
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
           {product.code && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Código:</span> {product.code}
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
          <TabsTrigger value="dimensions" disabled={(!product.dimensionData || product.dimensionData.length === 0) && !product.dimensionImage}>
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
                  <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden shadow bg-muted">
                    <Image 
                      src={product.dimensionImage} 
                      alt={`Esquema de dimensiones de ${product.name}`}
                      fill
                      sizes="50vw"
                      className="object-contain"
                      data-ai-hint="technical drawing blueprint"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none'; 
                        const parent = target.parentElement;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = "w-full h-full flex items-center justify-center text-muted-foreground text-sm";
                          placeholder.innerText = "Imagen no disponible";
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              {(!product.dimensionData || product.dimensionData.length === 0) && !product.dimensionImage && (
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
                        className="relative aspect-square rounded-md overflow-hidden border shadow-sm group cursor-pointer bg-muted"
                        onClick={() => openLightbox(img)}
                    >
                      <Image
                        src={img}
                        alt={`Imagen relacionada ${index + 1} de ${product.name}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-105" // Changed object-cover
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
          <Card className="relative max-w-3xl max-h-[90vh] w-full overflow-hidden shadow-2xl bg-background" onClick={(e) => e.stopPropagation()}> {/* Added bg-background */}
            <CardContent className="p-2 aspect-video relative bg-muted rounded-md"> {/* Added bg-muted */}
               <Image
                src={selectedImage || DEFAULT_PRODUCT_IMAGE_PATH}
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
    // Suspense for useProductById hook and client-side navigation elements.
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
