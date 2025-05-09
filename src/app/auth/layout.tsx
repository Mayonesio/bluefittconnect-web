// src/app/auth/layout.tsx
"use client"; 

import type { ReactNode } from 'react';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  // Default to the standard logo, update after theme is resolved on client
  const [logoSrc, setLogoSrc] = useState('/images/logo.png'); 

  useEffect(() => {
    // This effect runs only on the client after hydration
    if (resolvedTheme) {
      setLogoSrc(resolvedTheme === 'light' ? '/images/Logo-big.png' : '/images/logo.png');
    }
  }, [resolvedTheme]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       <Link href="/" className="mb-8 flex items-center gap-2 text-primary">
        <Logo src={logoSrc} className="h-10 w-auto" height={40} width={146}/>
      </Link>
      {children}
    </div>
  );
}
