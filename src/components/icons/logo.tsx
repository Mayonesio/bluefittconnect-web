import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 220 50" // Adjusted viewBox to better fit "BLUFITT"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logotipo de Blufitt Connect"
      {...props}
    >
      <style>
        {`
          .blufitt-text {
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-size: 36px; 
            font-weight: bold;
            letter-spacing: -0.5px; 
          }
        `}
      </style>
      {/* Text "BLUFITT", with "BLU" in one color and "FITT" in another */}
      <text x="5" y="38" className="blufitt-text">
        <tspan fill="#00AEEF">BLU</tspan>
        <tspan fill="#003366">FITT</tspan>
      </text>
    </svg>
  );
}
