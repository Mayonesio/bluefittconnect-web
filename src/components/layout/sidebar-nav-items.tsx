// src/components/layout/sidebar-nav-items.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { LayoutDashboard, ShoppingBag, Newspaper, ListOrdered, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { href: '/', label: 'Tablero', icon: LayoutDashboard },
  { href: '/productos', label: 'Productos', icon: ShoppingBag },
  { href: '/pedidos', label: 'Mis Pedidos', icon: ListOrdered },
  { href: '/blog', label: 'Blog', icon: Newspaper },
];

const adminNavItems = [
  { href: '/admin/users', label: 'Gestionar Usuarios', icon: Users },
  // Add more admin links here if needed
];

export default function SidebarNavItems() {
  const pathname = usePathname();
  const { appUser, loading: authLoading } = useAuth();

  const isActive = (itemHref: string) => {
    if (itemHref === '/') return pathname === '/';
    if (itemHref === '/productos') return pathname === '/productos' || pathname.startsWith('/productos?');
    if (itemHref === '/pedidos') return pathname === '/pedidos';
    if (itemHref === '/blog') return pathname === '/blog' || pathname.startsWith('/blog/');
    // For admin routes
    if (itemHref.startsWith('/admin')) return pathname.startsWith(itemHref);
    return pathname.startsWith(itemHref);
  };

  const isAdmin = !authLoading && appUser?.role === 'admin';

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.href)}
            tooltip={item.label}
            className="w-full justify-start text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5 mr-3 shrink-0" /> 
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

      {isAdmin && (
        <>
          <SidebarSeparator className="my-2" />
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Administración
            </SidebarGroupLabel>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.label}
                  className="w-full justify-start text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5 mr-3 shrink-0" /> 
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </>
      )}
    </SidebarMenu>
  );
}
