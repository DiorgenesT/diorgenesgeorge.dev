export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "dg-theme";

/** Roda antes da primeira pintura para evitar flash do tema errado. Uma linha só: o hash da CSP depende disso. */
export const THEME_INIT_SCRIPT =
  `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");` +
  `if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}` +
  `document.documentElement.setAttribute("data-theme",t);}` +
  `catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();

export function subscribeToTheme(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/** O atributo do documento é a fonte da verdade: o script inline já o definiu antes da primeira pintura. */
export function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

/** O HTML pré-renderizado não conhece o tema do visitante; o cliente corrige na hidratação. */
export function getServerTheme(): Theme {
  return "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Armazenamento indisponível (modo privado): o tema vale só para esta navegação.
  }
  for (const listener of listeners) listener();
}
