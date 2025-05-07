"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackageSearch, ShoppingCart, ListOrdered } from 'lucide-react';
import Link from "next/link";
import React from "react";

interface Pedido {
  id: string;
  fecha: string;
  total: string;
  estado: 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
  numItems: number;
}

const samplePedidos: Pedido[] = [
  // { id: 'PED-001', fecha: '2024-07-29', total: '125.50€', estado: 'Entregado', numItems: 3 },
  // { id: 'PED-002', fecha: '2024-07-25', total: '45.90€', estado: 'Enviado', numItems: 1 },
  // { id: 'PED-003', fecha: '2024-07-20', total: '210.00€', estado: 'Procesando', numItems: 5 },
];

const getStatusBadgeVariant = (status: Pedido['estado']) => {
  switch (status) {
    case 'Entregado': return 'default'; 
    case 'Enviado': return 'secondary';
    case 'Procesando': return 'outline'; // More neutral for processing
    case 'Cancelado': return 'destructive';
    default: return 'outline';
  }
};

export default function MisPedidosPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mis Pedidos</h1>
          <p className="text-muted-foreground">
            Consulte el historial y el estado de sus pedidos.
          </p>
        </div>
         <Button asChild variant="outline">
          <Link href="/productos">
            <ShoppingCart className="mr-2 h-4 w-4" /> Ir a Productos
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                    <CardTitle>Historial de Pedidos</CardTitle>
                    <CardDescription>Aquí se mostrarán sus pedidos realizados.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" disabled>
                    <ListOrdered className="mr-2 h-4 w-4" /> Filtrar Pedidos
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          {samplePedidos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Artículos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samplePedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">{pedido.id}</TableCell>
                    <TableCell>{pedido.fecha}</TableCell>
                    <TableCell className="hidden sm:table-cell text-center">{pedido.numItems}</TableCell>
                    <TableCell className="text-right">{pedido.total}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(pedido.estado)}>{pedido.estado}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled>Ver Detalles</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md">
              <PackageSearch className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No tiene pedidos todavía</h3>
              <p className="text-muted-foreground">Cuando realice un pedido, aparecerá aquí.</p>
              <Button className="mt-4" asChild>
                <Link href="/productos">Explorar Productos</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
