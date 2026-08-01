import { copyFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { LOCALES, LOCALE_SEGMENTS } from "../app/i18n/config";
import { CLIENT_DIR } from "./html-files";

const ROOT_LOCALE = "en-US";

/**
 * O handler de assets procura o 404.html mais próximo subindo a árvore de diretórios,
 * então cada idioma ganha o seu e a raiz fica com o inglês, coerente com o x-default.
 */
async function main(): Promise<void> {
  for (const locale of LOCALES) {
    const segment = LOCALE_SEGMENTS[locale];
    const generated = join(CLIENT_DIR, segment, "404", "index.html");

    await copyFile(generated, join(CLIENT_DIR, segment, "404.html"));
    if (locale === ROOT_LOCALE) {
      await copyFile(generated, join(CLIENT_DIR, "404.html"));
    }

    // A URL /<idioma>/404/ não deve existir como página navegável.
    await rm(join(CLIENT_DIR, segment, "404"), { recursive: true, force: true });
  }

  console.log(`404.html gerado para ${LOCALES.length} idiomas e para a raiz`);
}

await main();
