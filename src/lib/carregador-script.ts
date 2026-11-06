/**
 * O carregador da primeira abertura ("> npm run build:world"), em JavaScript puro: roda no <head>, antes do
 * bundle do site, e por isso já mostra progresso enquanto o resto baixa.
 *
 *  1. aplica o tema salvo e marca o <html> com data-carregando + data-carregador (o hero fica oculto e o
 *     carregador aparece, globals.css);
 *  2. baixa e decodifica o quarto, o mundo e o vídeo do jogo, atualizando o log e a barra;
 *  3. espera o site avisar que aqueceu os efeitos (shaders da sucção, da compilação e do portal) por
 *     window.__carregador.passo("shaders"); sem aviso em 12 s, segue assim mesmo;
 *  4. "Build & Run": o carregador sai e o hero entra (data-intro).
 *
 * window.__abrirHero reabre só o portão do hero (sem carregador) quando o React recria o <html> numa troca de
 * idioma (src/components/Hero.tsx).
 */

const QUARTO = ["1-fundo", "2-estante", "3-mesa", "3b-luminaria", "4a-ele", "4b-cadeira", "5-frente"].map((n) => `/contato/${n}.webp`);
const MUNDO = ["/mundo/ele.webp", "/mundo/frente.webp", "/hero/isekai/mundo.webp"];

export const SCRIPT_CARREGADOR = `(function(){
var h=document.documentElement,W=window;
try{if(localStorage.getItem("tema")==="claro"){h.dataset.tema="claro";h.dataset.visual="claro"}}catch(e){}
h.dataset.carregando="1";

W.__abrirHero=function(){var feito=false;function abrir(){if(feito)return;feito=true;delete h.dataset.carregando;delete h.dataset.intro;void h.offsetWidth;h.dataset.intro="1"}
var c=document.querySelector(h.dataset.visual==="claro"?"#topo .cena-mundo":"#topo .cena-quarto");
var imgs=c?[].slice.call(c.querySelectorAll("img")):[];
Promise.all(imgs.map(function(i){return i.decode?i.decode().catch(function(){}):0})).then(abrir);setTimeout(abrir,2500)};

h.dataset.carregador="1";
var visitou=false;try{visitou=!!sessionStorage.getItem("visitou");sessionStorage.setItem("visitou","1")}catch(e){}
var t0=Date.now(),MIN=visitou?350:1400;
var passos={quarto:{n:0,t:${QUARTO.length}},mundo:{n:0,t:${MUNDO.length + 1}},shaders:{n:0,t:3}};
var guardadas=[],terminou=false,ui=null;

function pintar(){
  if(!ui){var r=document.getElementById("carregador");if(!r)return;ui={r:r,barra:r.querySelector(".cg-barra i"),pct:r.querySelector(".cg-pct"),traco:[].slice.call(r.querySelectorAll(".cg-tracado"))}}
  var feito=0,total=0;
  for(var k in passos){var p=passos[k];feito+=p.n;total+=p.t;
    var li=ui.r.querySelector('[data-passo="'+k+'"]');if(!li)continue;
    li.querySelector(".cg-n").textContent=p.n+"/"+p.t;
    li.dataset.estado=p.n>=p.t?"ok":(p.n>0||k==="quarto"?"rodando":"");}
  var f=Math.round(feito/total*100);
  ui.barra.style.transform="scaleX("+(f/100)+")";ui.pct.textContent=f+"%";
  ui.traco.forEach(function(t){t.style.strokeDashoffset=String(1-f/100)});
  if(feito>=total)fim();
}
function soma(k){passos[k].n=Math.min(passos[k].t,passos[k].n+1);pintar()}
W.__carregador={passo:soma};

function img(src,k){var i=new Image();i.decoding="async";i.src=src;guardadas.push(i);
  (i.decode?i.decode():Promise.resolve()).catch(function(){}).then(function(){soma(k)})}
${JSON.stringify(QUARTO)}.forEach(function(s){img(s,"quarto")});
${JSON.stringify(MUNDO)}.forEach(function(s){img(s,"mundo")});
var v=document.createElement("video"),src=v.canPlayType&&v.canPlayType("video/webm")?"/hero/isekai/mundo-loop.webm":"/hero/isekai/mundo-loop.mp4";
fetch(src).then(function(r){return r.blob()}).catch(function(){}).then(function(){soma("mundo")});

function fim(){if(terminou)return;terminou=true;
  setTimeout(function(){
    if(ui)ui.r.dataset.fase="rodar";
    // "Build & Run": a logo se preenche, a luz varre e o chevron pisca; depois o carregador sai
    setTimeout(function(){
      // o carregador se recolhe para cima enquanto o hero já entra por trás dele
      h.dataset.carregadorSai="1";delete h.dataset.carregando;h.dataset.intro="1";
      setTimeout(function(){delete h.dataset.carregador;delete h.dataset.carregadorSai;
        try{W.dispatchEvent(new Event("carregou"))}catch(e){}},750)},visitou?650:1500)},Math.max(0,MIN-(Date.now()-t0)))}
setTimeout(function(){for(var k in passos)passos[k].n=passos[k].t;pintar();fim()},12000);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",pintar);else pintar();
})()`;
