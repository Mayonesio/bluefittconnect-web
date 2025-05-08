// src/components/layout/breadcrumb.tsx
"use client";

import React, { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // Add more specific mappings if needed, e.g., for slugs or IDs
};

const getLabelForSegment = (segment: string): string => {
  if (pathToLabelMap[segment]) {
    return pathToLabelMap[segment];
  }
  // Basic capitalization for unknown segments
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(segment => segment); // Filter out empty strings

  const breadcrumbs: BreadcrumbItem[] = [{ href: '/', label: 'Tablero', isCurrent: pathname === '/' }];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isCurrentPage = index === segments.length - 1;
    // Skip query parameters from segment if any
    const cleanSegment = segment.split('?')[0]; 
    
    // Special handling for parameterized routes if needed, e.g., blog slugs
    // For now, just use getLabelForSegment
    const label = getLabelForSegment(cleanSegment);

    breadcrumbs.push({
      href: currentPath,
      label: label,
      isCurrent: isCurrentPage,
    });
  });
  
  // If the only breadcrumb is "Tablero" and we are on "/", it's already handled
  // If we are on a deeper page, and "Tablero" was the first item, ensure it's not marked current if path is not "/"
  if (breadcrumbs.length > 1 && breadcrumbs[0].label === 'Tablero' && pathname !== '/') {
    breadcrumbs[0].isCurrent = false;
  }


  if (breadcrumbs.length <= 1 && pathname === '/') {
    return null; // Don't show breadcrumbs on the dashboard itself if it's just "Tablero"
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
