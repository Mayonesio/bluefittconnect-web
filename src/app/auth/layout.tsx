// src/app/auth/layout.tsx
import type { ReactNode } from 'react';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       <Link href="/" className="mb-8 flex items-center gap-2 text-primary">
        <Logo className="h-10 w-auto" height={40} width={146}/>
        <span className="text-2xl font-semibold text-foreground">Bluefitt Connect</span>
      </Link>
      {children}
    </div>
  );
}
