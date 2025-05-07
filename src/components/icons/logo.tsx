import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 260 50" // Adjusted viewBox for "AGRORIEGO"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logotipo de AgroRiego Conecta"
      {...props}
    >
      <style>
        {`
          .agroriego-text {
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-size: 36px; /* Adjusted font size */
            font-weight: bold;
            letter-spacing: -1px; 
          }
        `}
      </style>
      <text x="5" y="38" className="agroriego-text">
        <tspan fill="#00AEEF">AGRO</tspan>
        <tspan fill="#003366">RIEGO</tspan>
      </text>
    </svg>
  );
}
