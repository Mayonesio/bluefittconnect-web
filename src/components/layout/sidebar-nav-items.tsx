"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Dumbbell, TrendingUp, HeartPulse, LayoutDashboard } from 'lucide-react'; // Updated icons

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workout-plans', label: 'Workout Plans', icon: Dumbbell }, // Changed from Product Catalog
  { href: '/activity-log', label: 'Activity Log', icon: TrendingUp }, // Changed from Proformas
  { href: '/health-hub', label: 'Health Hub', icon: HeartPulse }, // Changed from Blog
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
