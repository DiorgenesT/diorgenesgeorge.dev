import { useEffect, useRef, type ReactNode } from "react";
import { decide, readEnvironment } from "../hero/capability";

/**
 * O estado final é o padrão do HTML: nada aqui esconde nada por CSS. A animação é que
 * retrocede para animar, e só quando o movimento está autorizado. Assim, sem JavaScript
 * ou com movimento reduzido, a página já está correta sem depender de nada.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = element.current;
    if (!node || !decide(readEnvironment()).motion) return;

    let cancelled = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);
        gsap.fromTo(
          node,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: node, start: "top 85%" },
          },
        );
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return <div ref={element}>{children}</div>;
}
