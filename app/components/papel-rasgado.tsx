/**
 * Borda rasgada em SVG inline, reutilizavel e sem custo de imagem por elemento.
 * `preserveAspectRatio: none` porque isto e uma borda que se estica, nao um desenho
 * que precisa manter proporcao.
 */
export function PapelRasgado({
  className = "h-3 w-full text-bg",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className={`block ${className}`}
    >
      <path
        d="M0,20 L20,8 L40,24 L60,4 L80,18 L100,10 L120,26 L140,6 L160,20 L180,12 L200,22 L220,8 L240,18 L260,4 L280,24 L300,10 L320,20 L340,6 L360,22 L380,12 L400,20 L400,40 L0,40 Z"
        fill="currentColor"
      />
    </svg>
  );
}
