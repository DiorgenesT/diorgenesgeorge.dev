import { contato, linkWhatsApp } from "@/i18n/config";

/** Ícones das redes (SVG inline, herdam a cor do texto). */
const ICONES: Record<string, React.ReactNode> = {
  GitHub: (
    <path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
  ),
  LinkedIn: (
    <path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  ),
  Instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
  WhatsApp: <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />,
  Email: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </g>
  ),
};

export const redes = (mensagem: string): [string, string][] => [
  ["GitHub", contato.github],
  ["LinkedIn", contato.linkedin],
  ["Instagram", contato.instagram],
  ["WhatsApp", linkWhatsApp(mensagem)],
  ["Email", `mailto:${contato.email}`],
];

/** Coluna/linha de ícones das redes. Cada ícone tem rótulo acessível e uma dica que aparece no hover. */
export default function Redes({ mensagem, className = "" }: { mensagem: string; className?: string }) {
  return (
    <ul className={className}>
      {redes(mensagem).map(([nome, href]) => (
        <li key={nome}>
          <a
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener"
            aria-label={nome}
            className="group relative grid size-11 place-items-center rounded-full text-white/85 transition-colors duration-300 hover:bg-white/15 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="size-[22px] transition-transform duration-300 ease-corte group-hover:scale-110" aria-hidden>
              {ICONES[nome]}
            </svg>
            <span className="pointer-events-none absolute right-full mr-3 hidden translate-x-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-black opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block">
              {nome}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
