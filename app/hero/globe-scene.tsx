import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BufferGeometry, Group, SphereGeometry, Vector3 } from "three";
import {
  cameraDistance,
  markerRadius,
  settleTween,
  targetRotation,
} from "./camera-motion";
import { greatCircle, toVector, type Coord } from "./projection";
import { useSceneColors, type SceneColors } from "./scene-colors";
import type { TelemetryState } from "./telemetry";

const RADIUS = 1;
const IDLE_SPIN = 0.12;

/** O arco sobe acima da superfície proporcionalmente à distância que percorre. */
export function angularSpan(from: Coord, to: Coord): number {
  const a = toVector(from);
  const b = toVector(to);
  return Math.acos(
    Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z)),
  );
}

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
  // Piso de altura: um par próximo precisa se ler como salto, não como risco.
  const peak = Math.max(0.09, 0.06 + (span / Math.PI) * 0.35);

  const points = path.map((coord, index) => {
    const t = index / (path.length - 1);
    // Meia senoide: sai da superfície, sobe e volta.
    const lift = RADIUS + Math.sin(t * Math.PI) * peak;
    const vector = toVector(coord, lift);
    return new Vector3(vector.x, vector.y, vector.z);
  });

  return new BufferGeometry().setFromPoints(points);
}

function Marker({
  coord,
  color,
  radius,
}: {
  coord: Coord;
  color: string;
  radius: number;
}) {
  const position = toVector(coord, RADIUS * 1.012);

  return (
    <mesh position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Globe({
  state,
  colors,
  awake,
}: {
  state: TelemetryState;
  colors: SceneColors;
  awake: { current: boolean };
}) {
  const group = useRef<Group>(null);
  const { invalidate, camera } = useThree();

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

  const span =
    vLat !== undefined &&
    vLon !== undefined &&
    cLat !== undefined &&
    cLon !== undefined
      ? angularSpan({ lat: vLat, lon: vLon }, { lat: cLat, lon: cLon })
      : undefined;

  const dotRadius = markerRadius(span === undefined ? 4 : cameraDistance(span));

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
    // Fora da tela ou aba em segundo plano, o giro para: quadro que ninguém vê é
    // bateria gasta à toa.
    if (!group.current || visitor || !awake.current) return;
    group.current.rotation.y += IDLE_SPIN * delta;
    invalidate();
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      const store = window as unknown as { __frames?: number };
      store.__frames = 0;
    }
  }, []);

  // A câmera para quando encontra: desacelera com inércia até a região do visitante,
  // e só então o arco é desenhado. Antes disso o giro é declaradamente "procurando".
  useEffect(() => {
    if (!group.current || vLat === undefined || vLon === undefined) return;

    let cancelled = false;

    void import("gsap").then(({ gsap }) => {
      const node = group.current;
      if (cancelled || !node) return;

      const from = { x: node.rotation.x, y: node.rotation.y };
      const to = targetRotation({ lat: vLat, lon: vLon });
      const tween = settleTween(from, to);

      const timeline = gsap.timeline();

      if (cLat !== undefined && cLon !== undefined) {
        timeline.to(
          camera.position,
          {
            z: cameraDistance(
              angularSpan({ lat: vLat, lon: vLon }, { lat: cLat, lon: cLon }),
            ),
            duration: tween.duration,
            ease: tween.ease,
            onUpdate: invalidate,
          },
          0,
        );
      }

      timeline.to(node.rotation, {
        x: to.x,
        y: to.y,
        duration: tween.duration,
        ease: tween.ease,
        onUpdate: invalidate,
      });

      if (arc) {
        const count = arc.attributes.position?.count ?? 0;
        arc.setDrawRange(0, 0);
        const progress = { value: 0 };

        timeline.to(progress, {
          value: count,
          duration: 0.7,
          ease: "power1.inOut",
          onUpdate: () => {
            arc.setDrawRange(0, Math.round(progress.value));
            invalidate();
          },
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [vLat, vLon, cLat, cLon, arc, invalidate, camera]);

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshBasicMaterial color={colors.surface} />
      </mesh>

      {/* Raio um pouco maior que o da esfera: no mesmo raio os dois brigam por
          profundidade e a grade some, deixando a silhueta facetada. */}
      <lineSegments>
        <wireframeGeometry
          args={[new SphereGeometry(RADIUS * 1.004, 24, 16)]}
        />
        <lineBasicMaterial color={colors.grid} transparent opacity={0.35} />
      </lineSegments>

      {arc && (
        <line>
          <primitive object={arc} attach="geometry" />
          <lineBasicMaterial color={colors.arc} linewidth={2} />
        </line>
      )}

      {visitor && (
        <Marker coord={visitor} color={colors.visitor} radius={dotRadius} />
      )}
      {colo && <Marker coord={colo} color={colors.colo} radius={dotRadius} />}
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
  const colors = useSceneColors();
  const awake = useRef(true);

  useEffect(() => {
    const node = holder.current;
    if (!node) return;

    const onVisibility = () => {
      awake.current = !document.hidden && awake.current;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        awake.current = Boolean(entry?.isIntersecting) && !document.hidden;
      },
      { threshold: 0.05 },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={holder} className="h-full w-full">
      <Canvas
        // demand: nada é renderizado sem alguém pedir, então a aba parada não gasta nada.
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Globe state={state} colors={colors} awake={awake} />
        <FrameCounter />
      </Canvas>
    </div>
  );
}
