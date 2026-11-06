import type { MetadataRoute } from "next";
import { SITE_URL } from "@/i18n/config";

// Gerado no build (export estático) como /robots.txt.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
