import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { graticule } from "./graticule";
import { greatCircle, project, type Coord } from "./projection";
import type { TelemetryState } from "./telemetry";

const SIZE = 320;
const RADIUS = SIZE / 2 - 8;

/** Enquadramento de câmera enquanto não há dado — nenhum marcador é desenhado aqui. */
const DEFAULT_CENTER: Coord = { lat: -15, lon: -47 };

/** Quebra a linha nos trechos escondidos atrás do globo, em vez de atravessá-lo. */
function segments(points: Coord[], center: Coord): string[] {
  const paths: string[] = [];
  let current: string[] = [];

  for (const point of points) {
    const { x, y, front } = project(point, center, RADIUS);

    if (!front) {
      if (current.length > 1) paths.push(current.join(" "));
      current = [];
      continue;
    }

    current.push(`${x.toFixed(2)},${(-y).toFixed(2)}`);
  }

  if (current.length > 1) paths.push(current.join(" "));

  return paths;
}

export function GlobeStatic({ state }: { state: TelemetryState }) {
  const t = getDictionary(useLocale());

  const ready = state.status === "ready" ? state.data : undefined;
  const visitor =
    ready?.visitor.lat !== undefined && ready.visitor.lon !== undefined
      ? { lat: ready.visitor.lat, lon: ready.visitor.lon }
      : undefined;
  const colo = ready?.colo ?? undefined;

  const center = visitor ?? DEFAULT_CENTER;

  const arc = visitor && colo ? greatCircle(visitor, colo, 64) : [];

  return (
    <svg
      viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`}
      role="img"
      aria-label={t["hero.mapLabel"]}
      className="h-full w-full"
    >
      <circle
        r={RADIUS}
        className="fill-bg-raised stroke-hairline"
        strokeWidth={1}
      />

      {graticule().map((line, index) =>
        segments(line, center).map((points, part) => (
          <polyline
            key={`${index}-${part}`}
            points={points}
            className="fill-none stroke-hairline"
            strokeWidth={0.5}
          />
        )),
      )}

      {segments(arc, center).map((points, index) => (
        <polyline
          key={`arc-${index}`}
          points={points}
          className="fill-none stroke-accent"
          strokeWidth={1.5}
        />
      ))}

      {visitor && <Marker coord={visitor} center={center} kind="visitor" />}
      {colo && <Marker coord={colo} center={center} kind="colo" />}
    </svg>
  );
}

function Marker({
  coord,
  center,
  kind,
}: {
  coord: Coord;
  center: Coord;
  kind: "visitor" | "colo";
}) {
  const { x, y, front } = project(coord, center, RADIUS);
  if (!front) return null;

  return kind === "visitor" ? (
    <circle
      cx={x}
      cy={-y}
      r={4}
      className="fill-none stroke-fg"
      strokeWidth={1.5}
    />
  ) : (
    <circle cx={x} cy={-y} r={3.5} className="fill-signal" />
  );
}
