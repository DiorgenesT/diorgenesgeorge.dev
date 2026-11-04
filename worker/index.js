// Worker na frente dos arquivos estáticos (./out). Só roda para "/" (run_worker_first):
// a raiz vai sempre para /en/ (o visitante troca o idioma no seletor EN/PT/ES).
const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") return Response.redirect(`${url.origin}/en/`, 302);
    return env.ASSETS.fetch(request);
  },
};
export default worker;
