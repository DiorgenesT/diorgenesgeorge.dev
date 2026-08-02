import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import { localeFromPathname } from "./i18n/use-locale";
import "./app.css";
import archivoBlack from "./design/fontes/archivo-black-latin-400.woff2?url";
import spaceMono from "./design/fontes/space-mono-latin-400.woff2?url";

export function Layout({ children }: { children: React.ReactNode }) {
  const locale = localeFromPathname(useLocation().pathname);

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/*
          As duas fontes usam font-display: optional, que da cerca de cem milissegundos
          de janela: se elas nao chegarem a tempo, o navegador usa a pilha do sistema
          naquele carregamento inteiro e nunca troca. Era isso que fazia a primeira
          visita aparecer sem a fonte e a recarga aparecer com ela.

          O preload as coloca na fila junto com o HTML, entao elas chegam dentro da
          janela e o optional passa a ter sucesso, sem abrir mao do CLS zero que ele
          garante. `crossOrigin` e obrigatorio mesmo em mesma origem: sem ele o browser
          baixa o arquivo duas vezes, porque fonte e sempre requisitada em modo CORS.
        */}
        <link
          rel="preload"
          href={archivoBlack}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={spaceMono}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
