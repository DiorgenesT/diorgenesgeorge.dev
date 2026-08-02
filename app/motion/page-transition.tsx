import { lazy, Suspense, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { decide } from "../hero/capability";
import { useEnvironment } from "../hero/use-environment";

const Animated = lazy(() => import("./animated-outlet"));

/**
 * Deslocamento curto e rápido de propósito: transição que chama atenção atrapalha a
 * leitura, que é o objetivo do site. Sem movimento autorizado, a biblioteca nem carrega.
 *
 * A primeira carga nunca é animada. Animá-la significaria pintar o conteúdo e escondê-lo
 * em seguida — o que o axe acusa como texto sem contraste, e com razão: durante a
 * animação ele é ilegível de verdade.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const env = useEnvironment();
  const { pathname } = useLocation();
  // Inicializador roda uma vez: guarda o caminho da primeira pintura sem ler ref
  // durante o render nem escrever estado dentro de efeito.
  const [initialPath] = useState(pathname);

  if (!env || !decide(env).motion) return <>{children}</>;

  return (
    <Suspense fallback={<>{children}</>}>
      <Animated routeKey={pathname} entry={pathname !== initialPath}>
        {children}
      </Animated>
    </Suspense>
  );
}
