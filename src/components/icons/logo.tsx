import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  const styleContent = `
          .bluefitt-text {
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-size: 36px; 
            font-weight: bold;
            letter-spacing: -0.5px; 
          }
        `;
  return (
    <svg
      viewBox="0 0 220 50" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logotipo de Bluefitt Connect"
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: styleContent }} />
      <text x="5" y="38" className="bluefitt-text">
        <tspan fill="#00AEEF">BLUE</tspan>
        <tspan fill="#003366">FITT</tspan>
      </text>
    </svg>
  );
}
