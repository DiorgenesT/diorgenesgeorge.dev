import { readdir } from "node:fs/promises";
import { join } from "node:path";

export const CLIENT_DIR = "build/client";

export async function htmlFiles(dir: string = CLIENT_DIR): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = await Promise.all(
    entries.map(async (entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(full);
      return entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return found.flat();
}
