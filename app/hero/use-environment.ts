import { useSyncExternalStore } from "react";
import { readEnvironment, type Environment } from "./capability";

let cached: Environment | null = null;

/** Lido uma vez e memoizado: o snapshot precisa ser referencialmente estável. */
function snapshot(): Environment {
  cached ??= readEnvironment();
  return cached;
}

/** Nada muda depois da primeira leitura, então não há o que assinar. */
const subscribe = () => () => {};

/**
 * Devolve null no servidor e na primeira pintura do cliente, que é o que faz os dois
 * concordarem. `setState` dentro de efeito faria o mesmo, mas dispara render em cascata.
 */
export function useEnvironment(): Environment | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
