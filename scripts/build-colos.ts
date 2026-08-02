import { writeFileSync } from "node:fs";

/**
 * O request.cf devolve o código IATA do datacenter, mas não a coordenada dele, e a
 * Cloudflare não publica endpoint com essas posições — o speed.cloudflare.com/locations,
 * que já serviu para isso, hoje responde vazio.
 *
 * OurAirports é domínio público. Porte grande e médio cobre todo colo da Cloudflare.
 */
const SOURCE = "https://davidmegginson.github.io/ourairports-data/airports.csv";
const OUT = "workers/data/colos.json";

const KEEP = new Set(["large_airport", "medium_airport"]);

function splitRow(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else current += char;
  }
  cells.push(current);

  return cells;
}

function parseCsv(text: string): Record<string, string>[] {
  const [header, ...lines] = text.trim().split("\n");
  const columns = splitRow(header as string);

  return lines.map((line) => {
    const cells = splitRow(line);
    return Object.fromEntries(
      columns.map((name, index) => [name, cells[index] ?? ""]),
    );
  });
}

async function main(): Promise<void> {
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`OurAirports respondeu ${response.status}`);

  const rows = parseCsv(await response.text());
  const table: Record<string, [number, number]> = {};

  for (const row of rows) {
    const iata = row.iata_code?.trim().toUpperCase();
    if (!iata || iata.length !== 3 || !KEEP.has(row.type ?? "")) continue;

    const lat = Number(row.latitude_deg);
    const lon = Number(row.longitude_deg);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;

    table[iata] = [Number(lat.toFixed(4)), Number(lon.toFixed(4))];
  }

  writeFileSync(OUT, JSON.stringify(table));
  console.log(`tabela de colos: ${Object.keys(table).length} códigos IATA`);
}

await main();
