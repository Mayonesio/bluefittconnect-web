// src/components/layout/breadcrumb.tsx
"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
// Temporary import for product name, ideally this comes from a context or global store if needed globally
// For now, this direct import is just for the breadcrumb logic to resolve product names.
// This is NOT ideal for a scalable solution as it couples Breadcrumb with product data.
import { Product } from '@/types/product'; // Make sure path is correct
import { Timestamp } from 'firebase/firestore'; // Needed for Product type if createdAt/updatedAt are Timestamps

const sampleProductos: Product[] = [ // Duplicating sample data here is not good.
                                   // This should be fetched or passed if product name is needed.
                                   // For a quick fix to show product name, it's here.
                                   // A better solution would be for the product page to set document.title
                                   // or use a BreadcrumbContext.
  { 
    id: 'bfchc001', 
    code: 'bfchc001',
    name: 'Codo Rosca Macho Corto 6 x 1/8"', 
    category: 'codo corto', 
    description: 'Codo para sistemas hidráulicos...', 
    images: ['/images/productImage/ch001c.png'],
    price: 1599, 
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  { 
    id: 'RAC-LAT-QR-002', 
    code: 'RAC-LAT-QR-002',
    name: 'Racor Enlace Rápido Latón', 
    category: 'Racor', 
    description: 'Racor de enlace rápido...', 
    images: ['/images/productImage/RAC-LAT-QR-002.png'],
    price: 550,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
   { 
    id: 'CAU-DIG-DN50-003', 
    code: 'CAU-DIG-DN50-003',
    name: 'Caudalímetro Digital DN50', 
    category: 'Caudalímetro', 
    description: 'Caudalímetro digital de alta precisión...', 
    images: ['/images/productImage/CAU-DIG-DN50-003.png'],
    price: 12000,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
    { 
    id: 'VM-HF-DN100-004', 
    code: 'VM-HF-DN100-004',
    name: 'Válvula Mariposa Hierro Fundido', 
    category: 'Válvula', 
    description: 'Válvula de mariposa robusta...', 
    images: ['/images/productImage/VM-HF-DN100-004.png'],
    price: 7500,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  { 
    id: 'CODO-PP-90-005', 
    code: 'CODO-PP-90-005',
    name: 'Codo 90º Polipropileno', 
    category: 'Racor', 
    description: 'Codo de 90 grados en polipropileno...', 
    images: ['/images/productImage/CODO-PP-90-005.png'],
    price: 230,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  { 
    id: 'CAU-ULT-PORT-006', 
    code: 'CAU-ULT-PORT-006',
    name: 'Caudalímetro Ultrasónico Portátil', 
    category: 'Caudalímetro', 
    description: 'Medidor de caudal ultrasónico portátil...', 
    images: ['/images/productImage/CAU-ULT-PORT-006.png'],
    price: 35000,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];


interface BreadcrumbItem {
  href: string;
  label: string;
  isCurrent: boolean;
}

const pathToLabelMap: Record<string, string> = {
  'productos': 'Productos',
  'pedidos': 'Mis Pedidos',
  'blog': 'Blog',
  'settings': 'Configuración',
  'admin': 'Administración',
  'users': 'Usuarios',
  'nuevo': 'Nuevo Artículo',
};

const getLabelForSegment = (segment: string, pathSegments: string[], index: number): string => {
  if (pathToLabelMap[segment]) {
    return pathToLabelMap[segment];
  }

  // Try to get product name for product detail pages
  if (pathSegments.length > 1 && pathSegments[index-1] === 'productos' && segment !== 'nuevo') {
      const product = sampleProductos.find(p => p.id === segment);
      if (product) {
          return product.name.length > 30 ? product.name.substring(0, 27) + "..." : product.name;
      }
      return "Detalle del Producto"; // Fallback if product not found in sample or ID is different
  }

  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(segment => segment); 
    const newBreadcrumbs: BreadcrumbItem[] = [{ href: '/', label: 'Tablero', isCurrent: pathname === '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isCurrentPage = index === pathSegments.length - 1;
      const cleanSegment = segment.split('?')[0]; 
      
      const label = getLabelForSegment(cleanSegment, pathSegments, index);

      newBreadcrumbs.push({
        href: currentPath,
        label: label,
        isCurrent: isCurrentPage,
      });
    });
    
    if (newBreadcrumbs.length > 1 && newBreadcrumbs[0].label === 'Tablero' && pathname !== '/') {
      newBreadcrumbs[0].isCurrent = false;
    }
    setBreadcrumbs(newBreadcrumbs);

  }, [pathname]);


  if (breadcrumbs.length <= 1 && pathname === '/') {
    return null; 
  }
  
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbs.map((breadcrumb, index) => (
        <Fragment key={breadcrumb.href}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          {breadcrumb.isCurrent ? (
            <span className="font-medium text-foreground" aria-current="page">
              {breadcrumb.label}
            </span>
          ) : (
            <Link href={breadcrumb.href} passHref>
              <span className={cn(
                "hover:text-foreground transition-colors",
                breadcrumb.label === "Tablero" && pathname === '/' ? "font-medium text-foreground" : ""
              )}>
                {breadcrumb.label}
              </span>
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
