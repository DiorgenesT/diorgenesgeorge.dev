import type { Config } from "@react-router/dev/config";
import { prerenderPaths } from "./app/i18n/prerender";

export default {
  ssr: true,
  prerender: prerenderPaths(),
} satisfies Config;
