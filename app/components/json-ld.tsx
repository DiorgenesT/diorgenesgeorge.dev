import { serializeJsonLd } from "../seo/jsonld";

/**
 * Data block: o browser não executa, então a CSP não o alcança e o crawler o lê inline.
 * Por isso o conteúdo precisa ser escapado à mão — ver serializeJsonLd.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
