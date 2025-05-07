import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      aria-label="AgriConnect Pro Logo"
      {...props} // Allows passing className, width, height, etc.
    >
      {/* Stylized 'A' using current text color */}
      <path
        d="M20 6L9 34H13.5L16.25 26H23.75L26.5 34H31L20 6ZM17.25 21L20 13.5L22.75 21H17.25Z"
        fill="currentColor" 
      />
      {/* Simple leaf shape using accent color, can be overridden by className if primary is desired */}
      <path 
        d="M20 6 C 25 10, 28 18, 20 22 C 12 18, 15 10, 20 6 Z" 
        fill="hsl(var(--accent))" 
        transform="translate(5, -2) rotate(-15 20 6)"
      />
    </svg>
  );
}
