import type { Config } from "@react-router/dev/config";
import { prerenderPaths } from "./app/i18n/prerender";

export default {
  ssr: true,
  prerender: prerenderPaths(),
  // Site inteiramente estático: não há servidor para responder /__manifest, então o
  // manifesto completo viaja na primeira carga em vez de ser descoberto sob demanda.
  routeDiscovery: { mode: "initial" },
} satisfies Config;
