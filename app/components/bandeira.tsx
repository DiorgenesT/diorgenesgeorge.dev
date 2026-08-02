import type { Locale } from "../i18n/config";

/**
 * Bandeiras em SVG inline, desenhadas em tracos largos: em 20px de largura, detalhe
 * fino vira sujeira. Sao decoracao pura e levam `aria-hidden`, porque quem nomeia a
 * opcao para leitor de tela e o texto do proprio link.
 *
 * Emoji esta proibido no projeto, entao nada de bandeira por caractere. E SVG tambem
 * significa desenho igual em todo sistema operacional, o que emoji nunca da.
 */
const DESENHOS: Record<Locale, React.ReactNode> = {
  "pt-BR": (
    <>
      <rect width="28" height="20" fill="#009b3a" />
      <path d="M14 2.4 25.6 10 14 17.6 2.4 10Z" fill="#fedf00" />
      <circle cx="14" cy="10" r="4.2" fill="#002776" />
    </>
  ),
  "pt-PT": (
    <>
      <rect width="28" height="20" fill="#da291c" />
      <rect width="11.2" height="20" fill="#046a38" />
      <circle cx="11.2" cy="10" r="4" fill="#ffe900" />
      <circle cx="11.2" cy="10" r="2.4" fill="#fff" />
    </>
  ),
  "en-US": (
    <>
      <rect width="28" height="20" fill="#fff" />
      <path
        d="M0 0h28v1.54H0zM0 3.08h28v1.54H0zM0 6.15h28v1.54H0zM0 9.23h28v1.54H0zM0 12.31h28v1.54H0zM0 15.38h28v1.54H0zM0 18.46h28v1.54H0z"
        fill="#b31942"
      />
      <rect width="12" height="10.77" fill="#0a3161" />
    </>
  ),
};

export function Bandeira({ locale }: { locale: Locale }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 28 20"
      className="block h-3.5 w-5 border border-hairline"
    >
      {DESENHOS[locale]}
    </svg>
  );
}
