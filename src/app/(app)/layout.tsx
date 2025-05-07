// src/app/(app)/layout.tsx
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import SidebarNavItems from '@/components/layout/sidebar-nav-items';
import { Logo } from '@/components/icons/logo';
import { UserCircle, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/auth-context';
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sesión Cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al Cerrar Sesión",
        description: "Hubo un problema al cerrar tu sesión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "BC"; // Blufitt Connect
  };


  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-4 flex items-center justify-center group-data-[state=expanded]:justify-between border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2 group-data-[state=collapsed]:hidden">
              <Logo className="h-8 w-auto text-sidebar-primary" />
              <span className="font-semibold text-lg">Blufitt Connect</span>
            </Link>
             <Link href="/" className="hidden items-center gap-2 group-data-[state=collapsed]:flex">
              <Logo className="h-8 w-8 text-sidebar-primary" />
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarNavItems />
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border">
             {user && (
                <SidebarMenuButton
                  tooltip="Configuración"
                  className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-5 w-5" />
                    <span>Configuración</span>
                  </Link>
                </SidebarMenuButton>
             )}
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1">
              {/* Placeholder for breadcrumbs or page title */}
            </div>
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/50/50`} alt="Avatar de Usuario" data-ai-hint="user avatar" />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.email || "Mi Cuenta"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings?tab=profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrarse
                  </Link>
                </Button>
              </div>
            )}
          </header>
          <SidebarInset className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
