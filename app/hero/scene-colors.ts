import { useEffect, useState } from "react";

export type SceneColors = {
  surface: string;
  grid: string;
  arc: string;
  colo: string;
  visitor: string;
};

const FALLBACK: SceneColors = {
  surface: "#1a1512",
  grid: "#857e76",
  arc: "#ffa033",
  colo: "#4be38a",
  visitor: "#f2eee9",
};

/**
 * O SVG herda o tema pelas classes do CSS; o canvas não herda nada. Sem ler os tokens,
 * a cena fica com cor fixa e vira um buraco preto no tema claro.
 */
export function readSceneColors(): SceneColors {
  if (typeof document === "undefined") return FALLBACK;

  const style = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  return {
    surface: token("--bg-raised", FALLBACK.surface),
    grid: token("--fg-subtle", FALLBACK.grid),
    arc: token("--accent", FALLBACK.arc),
    colo: token("--signal", FALLBACK.colo),
    visitor: token("--fg", FALLBACK.visitor),
  };
}

/** Reage à troca de tema, que muda o atributo data-theme no elemento raiz. */
export function useSceneColors(): SceneColors {
  const [colors, setColors] = useState(readSceneColors);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readSceneColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}
