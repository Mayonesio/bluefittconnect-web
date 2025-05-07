"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { ShoppingBag, FileText, BookOpen, LayoutDashboard } from 'lucide-react'; // Changed Home to LayoutDashboard

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Product Catalog', icon: ShoppingBag },
  { href: '/proformas', label: 'Proformas', icon: FileText },
  { href: '/blog', label: 'Blog', icon: BookOpen }, // Changed to Blog from Blog Management for brevity
];

export default function SidebarNavItems() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
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
    </SidebarMenu>
  );
}
