// src/app/(app)/admin/layout.tsx
"use client";

import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { appUser, loading: authLoading, user: firebaseUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!firebaseUser) {
        // Should be caught by main app layout middleware, but as a fallback
        router.push('/auth/login?redirect=/admin/users');
      } else if (appUser && appUser.role !== 'admin') {
        router.push('/'); // Redirect to dashboard if not admin
      }
    }
  }, [appUser, authLoading, firebaseUser, router]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Verificando acceso de administrador...</p>
      </div>
    );
  }

  if (!appUser || appUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle>Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No tienes permisos para acceder a esta sección.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
