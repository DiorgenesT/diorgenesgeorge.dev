import { lazy, Suspense, type ReactNode } from "react";
import { useLocation } from "react-router";
import { decide, readEnvironment } from "../hero/capability";
import { useEnvironment } from "../hero/use-environment";

const Animated = lazy(() => import("./animated-outlet"));

/**
 * Deslocamento curto e rápido de propósito: transição que chama atenção atrapalha a
 * leitura, que é o objetivo do site. Sem movimento autorizado, a biblioteca nem carrega.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const env = useEnvironment();
  const { pathname } = useLocation();

  if (!env || !decide(env).motion) return <>{children}</>;

  return (
    <Suspense fallback={<>{children}</>}>
      <Animated routeKey={pathname}>{children}</Animated>
    </Suspense>
  );
}

export { readEnvironment };
