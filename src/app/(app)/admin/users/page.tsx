// src/app/(app)/admin/users/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db as firestoreDB } from '@/lib/firebase/config';
import type { AppUser } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!firestoreDB) {
        setError("Firestore no está configurado.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const usersCollectionRef = collection(firestoreDB, 'users');
        const q = query(usersCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            ...data,
            uid: docSnap.id,
            createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate() : new Date(data.createdAt || Date.now()),
          } as AppUser;
        });
        setUsers(usersList);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Error al cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getUserInitials = (displayName: string | null, email: string | null) => {
    if (displayName) {
      const parts = displayName.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Ver y administrar los usuarios de la plataforma.
          </p>
        </div>
        <Button disabled>
          <UserPlus className="mr-2 h-4 w-4" /> Añadir Nuevo Usuario
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Total de usuarios registrados: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          {!loading && error && <p className="text-destructive text-center">{error}</p>}
          {!loading && !error && users.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No hay usuarios registrados</h3>
              <p className="text-muted-foreground">Cuando se registren usuarios, aparecerán aquí.</p>
            </div>
          )}
          {!loading && !error && users.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="hidden sm:table-cell">Registrado el</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} alt="Avatar" data-ai-hint="avatar random" />
                          <AvatarFallback>{getUserInitials(user.displayName, user.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                          {user.displayName || 'N/A'}
                          <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.company || 'N/A'}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        {user.createdAt ? format(user.createdAt, 'PPpp', { locale: es }) : 'Fecha desconocida'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled>Editar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
