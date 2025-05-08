// src/app/(app)/admin/users/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db as firestoreDB } from '@/lib/firebase/config'; // Ensure this is the correct export
import type { AppUser, UserRole } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Edit3, Trash2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';


export default function ManageUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { appUser: currentAdminUser } = useAuth();

  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole | ''>('');


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
      toast({ title: "Error", description: "No se pudieron cargar los usuarios.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleRoleChange = async () => {
    if (!editingUser || !newRole || !firestoreDB) return;
    if (editingUser.uid === currentAdminUser?.uid && newRole !== 'admin') {
      toast({ title: "Operación no permitida", description: "Un administrador no puede cambiar su propio rol a uno no administrador.", variant: "destructive"});
      setEditingUser(null);
      setNewRole('');
      return;
    }

    try {
      const userDocRef = doc(firestoreDB, 'users', editingUser.uid);
      await updateDoc(userDocRef, { role: newRole });
      toast({ title: "Rol Actualizado", description: `El rol de ${editingUser.email} ha sido cambiado a ${newRole}.` });
      setUsers(users.map(u => u.uid === editingUser.uid ? { ...u, role: newRole } : u));
      setEditingUser(null);
      setNewRole('');
    } catch (err) {
      console.error("Error updating role:", err);
      toast({ title: "Error", description: "No se pudo actualizar el rol.", variant: "destructive" });
    }
  };
  
  const handleDeleteUser = async (userId: string, userEmail: string | null) => {
    if (!firestoreDB) return;
     if (userId === currentAdminUser?.uid) {
      toast({ title: "Operación no permitida", description: "Un administrador no puede eliminar su propia cuenta desde esta interfaz.", variant: "destructive"});
      return;
    }
    // Note: Deleting Firebase Auth user requires Admin SDK. This only deletes Firestore record.
    try {
      const userDocRef = doc(firestoreDB, 'users', userId);
      await deleteDoc(userDocRef);
      toast({ title: "Usuario Eliminado (Firestore)", description: `El perfil de ${userEmail || userId} ha sido eliminado de Firestore.` });
      setUsers(users.filter(u => u.uid !== userId));
       // Inform admin about Auth user deletion
      toast({
        title: "Acción Requerida (Admin)",
        description: `El usuario ${userEmail || userId} fue eliminado de Firestore. Para eliminarlo completamente de Firebase Authentication, use la Consola de Firebase o el Admin SDK.`,
        variant: "destructive",
        duration: 10000,
      });
    } catch (err) {
      console.error("Error deleting user from Firestore:", err);
      toast({ title: "Error", description: "No se pudo eliminar el usuario de Firestore.", variant: "destructive" });
    }
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
        <Button disabled> {/* Add New User functionality to be implemented */}
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
                    <TableCell className="text-right space-x-2">
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { setEditingUser(user); setNewRole(user.role);}}
                              disabled={user.uid === currentAdminUser?.uid && user.role === 'admin' && users.filter(u => u.role === 'admin').length <=1 }
                              title={user.uid === currentAdminUser?.uid && user.role === 'admin' && users.filter(u => u.role === 'admin').length <=1 ? "No se puede cambiar el rol del único administrador" : "Editar Rol"}
                            >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        {editingUser?.uid === user.uid && (
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cambiar Rol de {editingUser.email}</AlertDialogTitle>
                            <AlertDialogDescription>
                              Seleccione el nuevo rol para este usuario.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar nuevo rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuario</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setEditingUser(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRoleChange} disabled={!newRole || newRole === editingUser.role}>Guardar Rol</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                        )}
                      </AlertDialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={user.uid === currentAdminUser?.uid}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar Usuario de Firestore?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará el perfil de <span className="font-semibold">{user.email}</span> de la base de datos Firestore.
                              La cuenta de autenticación de Firebase NO será eliminada y debe gestionarse por separado.
                              ¿Está seguro? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.uid, user.email)}>Eliminar de Firestore</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
