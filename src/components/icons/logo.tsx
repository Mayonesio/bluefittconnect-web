// src/components/icons/logo.tsx
import Image from 'next/image';
import type { HTMLAttributes } from 'react';

interface LogoProps extends Omit<HTMLAttributes<HTMLImageElement>, 'width' | 'height' | 'src' | 'alt'> {
  width?: number;
  height?: number;
  className?: string;
  src?: string; // Added optional src prop
}

export function Logo({ width = 120, height = 30, className, src = "/images/logo.png", ...props }: LogoProps) {
  return (
    <Image
      src={src} // Use the passed src or default
      alt="Bluefitt Connect Logo"
      width={width} 
      height={height}
      className={className}
      priority 
      {...props}
    />
  );
}
