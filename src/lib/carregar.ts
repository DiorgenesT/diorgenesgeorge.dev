/**
 * Espera as imagens (e vídeos) de um trecho da página estarem prontos para pintar, com um limite: a cena
 * aparece inteira de uma vez, nunca uma camada depois da outra.
 */
export function prontas(raiz: ParentNode | null, limiteMs = 2500): Promise<void> {
  if (!raiz) return Promise.resolve();
  const imgs = [...raiz.querySelectorAll<HTMLImageElement>("img")].filter((i) => i.loading !== "lazy");
  const videos = [...raiz.querySelectorAll<HTMLVideoElement>("video")];
  const espera = [
    ...imgs.map((i) => (i.complete && i.naturalWidth ? i.decode() : i.decode()).catch(() => {})),
    ...videos.map(
      (v) =>
        new Promise<void>((ok) => {
          if (v.readyState >= 2) return ok();
          v.addEventListener("loadeddata", () => ok(), { once: true });
          v.addEventListener("error", () => ok(), { once: true });
        }),
    ),
  ];
  return Promise.race([Promise.all(espera).then(() => {}), new Promise<void>((ok) => setTimeout(ok, limiteMs))]);
}

/** As camadas das telas (Sobre, Jogos, Trabalhos, Contato), baixadas e decodificadas logo depois da abertura. */
const TELAS = [
  "/trabalhos-cena/1-fundo.webp", "/trabalhos-cena/2-arcos.webp", "/trabalhos-cena/3-ele.webp", "/trabalhos-cena/4-frente.webp",
  "/jogos/1-fundo.webp", "/jogos/2-colunas.webp", "/jogos/3-mesa.webp", "/jogos/4-ele.webp", "/jogos/5-frente.webp",
  "/jogos/xeque-barbaro.webp", "/jogos/cubo-da-velha.webp",
  "/sobre/1-fundo.webp", "/sobre/2-ruinas.webp", "/sobre/3-estatua.webp", "/sobre/4-ele.webp", "/sobre/5-frente.webp",
  "/acampamento/1-fundo.webp", "/acampamento/2-ruinas.webp", "/acampamento/3-acampamento.webp", "/acampamento/4-quadro.webp", "/acampamento/5-frente.webp",
];
const guardadas: HTMLImageElement[] = [];
export function adiantarTelas() {
  const ocioso = (f: () => void) => ("requestIdleCallback" in window ? window.requestIdleCallback(f, { timeout: 800 }) : setTimeout(f, 300));
  ocioso(() => {
    for (const src of TELAS) {
      const i = new Image();
      i.decoding = "async";
      i.src = src;
      i.decode().catch(() => {});
      guardadas.push(i); // referência viva: o navegador mantém a imagem decodificada no cache
    }
  });
}

type Carregador = { passo: (k: "shaders") => void };
const avisados = new Set<string>();
/** Avisa o carregador da primeira abertura (src/lib/carregador-script.ts) que um efeito já está aquecido. */
export function aquecido(id: string) {
  if (avisados.has(id)) return; // o modo de desenvolvimento roda os efeitos duas vezes
  avisados.add(id);
  (window as unknown as { __carregador?: Carregador }).__carregador?.passo("shaders");
}
