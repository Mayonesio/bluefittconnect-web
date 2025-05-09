// src/components/icons/logo.tsx
import Image from 'next/image';
import type { HTMLAttributes } from 'react'; // Changed from SVGProps as Image isn't an SVG

// The props for Next/Image are different from SVG, so we'll accept general HTMLAttributes
// and spread them, but the specific SVG ones might not apply directly.
// The 'className' prop is common and will be useful for styling.
interface LogoProps extends Omit<HTMLAttributes<HTMLImageElement>, 'width' | 'height' | 'src' | 'alt'> {
  // Explicitly define width and height as they are required for next/image
  // or allow them to be passed if desired, though we'll default them.
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 120, height = 30, className, ...props }: LogoProps) {
  return (
    <Image
      src="/images/logo.png" // Path to your logo in the public/images directory
      alt="Bluefitt Connect Logo"
      width={width} 
      height={height}
      className={className} // Pass through className for styling
      priority // Optional: if the logo is LCP, consider adding priority
      {...props} // Spread any other HTML attributes
    />
  );
}
