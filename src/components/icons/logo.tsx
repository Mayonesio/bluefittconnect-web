import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 50" // Adjusted viewBox for "BLUFITT"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Blufitt connect Logo"
      {...props} // Allows passing className, width, height, etc.
    >
      <style>
        {`
          .blufitt-text {
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-size: 38px; /* Adjusted font size */
            font-weight: bold;
            letter-spacing: -1.5px; /* Adjusted for closer fit */
          }
        `}
      </style>
      <text x="5" y="38" className="blufitt-text"> {/* Adjusted x, y for alignment */}
        <tspan fill="#00AEEF">B</tspan>
        <tspan fill="#003366">LUFITT</tspan>
      </text>
    </svg>
  );
}
