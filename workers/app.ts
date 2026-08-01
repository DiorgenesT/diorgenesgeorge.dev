import { createRequestHandler } from "react-router";
import { LOCALE_SEGMENTS } from "../app/i18n/config";
import { negotiateLocale } from "../app/i18n/negotiate";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const locale = negotiateLocale(request.headers.get("accept-language"));
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/${LOCALE_SEGMENTS[locale]}/`,
          // Sem Vary o cache serviria o idioma do primeiro visitante para todos.
          Vary: "Accept-Language",
          "Cache-Control": "no-store",
        },
      });
    }

    return requestHandler(request);
  },
} satisfies ExportedHandler<Env>;
