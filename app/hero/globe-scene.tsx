import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Group,
  SphereGeometry,
  Vector3,
} from "three";
import { greatCircle, toVector, type Coord } from "./projection";
import type { TelemetryState } from "./telemetry";

const RADIUS = 1;
const IDLE_SPIN = 0.12;

/** O arco sobe acima da superfície proporcionalmente à distância que percorre. */
function arcGeometry(from: Coord, to: Coord): BufferGeometry {
  const path = greatCircle(from, to, 96);
  const span = Math.acos(
    Math.min(
      1,
      Math.max(
        -1,
        (() => {
          const a = toVector(from);
          const b = toVector(to);
          return a.x * b.x + a.y * b.y + a.z * b.z;
        })(),
      ),
    ),
  );
  const peak = 0.06 + (span / Math.PI) * 0.35;

  const points = path.map((coord, index) => {
    const t = index / (path.length - 1);
    // Meia senoide: sai da superfície, sobe e volta.
    const lift = RADIUS + Math.sin(t * Math.PI) * peak;
    const vector = toVector(coord, lift);
    return new Vector3(vector.x, vector.y, vector.z);
  });

  return new BufferGeometry().setFromPoints(points);
}

function Marker({ coord, color }: { coord: Coord; color: string }) {
  const position = toVector(coord, RADIUS * 1.005);

  return (
    <mesh position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[0.022, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Globe({ state }: { state: TelemetryState }) {
  const group = useRef<Group>(null);
  const { invalidate } = useThree();

  const ready = state.status === "ready" ? state.data : undefined;
  const visitor =
    ready?.visitor.lat !== undefined && ready.visitor.lon !== undefined
      ? { lat: ready.visitor.lat, lon: ready.visitor.lon }
      : undefined;
  const colo = ready?.colo ?? undefined;

  const vLat = visitor?.lat;
  const vLon = visitor?.lon;
  const cLat = colo?.lat;
  const cLon = colo?.lon;

  const arc = useMemo(() => {
    if (
      vLat === undefined ||
      vLon === undefined ||
      cLat === undefined ||
      cLon === undefined
    ) {
      return undefined;
    }

    return arcGeometry({ lat: vLat, lon: vLon }, { lat: cLat, lon: cLon });
  }, [vLat, vLon, cLat, cLon]);

  // Enquanto não sabe onde o visitante está, o globo gira: é declaradamente procurando.
  useFrame((_, delta) => {
    if (!group.current || visitor) return;
    group.current.rotation.y += IDLE_SPIN * delta;
    invalidate();
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      const store = window as unknown as { __frames?: number };
      store.__frames = 0;
    }
  }, []);

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshBasicMaterial color="#12100e" />
      </mesh>

      <lineSegments>
        <wireframeGeometry args={[new SphereGeometry(RADIUS, 24, 16)]} />
        <lineBasicMaterial color="#2a2521" transparent opacity={0.7} />
      </lineSegments>

      {arc && (
        <line>
          <primitive object={arc} attach="geometry" />
          <lineBasicMaterial color="#FFA033" linewidth={2} />
        </line>
      )}

      {visitor && <Marker coord={visitor} color="#F2EEE9" />}
      {colo && <Marker coord={colo} color="#4BE38A" />}
    </group>
  );
}

/** Conta quadros só em desenvolvimento, para o teste de pausa fora do viewport. */
function FrameCounter() {
  useFrame(() => {
    if (!import.meta.env.DEV) return;
    const store = window as unknown as { __frames?: number };
    store.__frames = (store.__frames ?? 0) + 1;
  });

  return null;
}

export default function GlobeScene({ state }: { state: TelemetryState }) {
  const holder = useRef<HTMLDivElement>(null);

  return (
    <div ref={holder} className="h-full w-full">
      <Canvas
        // demand: nada é renderizado sem alguém pedir, então a aba parada não gasta nada.
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Globe state={state} />
        <FrameCounter />
      </Canvas>
    </div>
  );
}
