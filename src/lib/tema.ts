"use client";

import { useSyncExternalStore } from "react";

/**
 * Tema do site: "escuro" (o dev no quarto) ou "claro" (ele dentro do jogo — o "isekai").
 * A fonte da verdade é o atributo data-tema do <html>, que o script inline do layout já define
 * antes da primeira pintura (a partir do localStorage). Aqui só lemos, trocamos e avisamos quem ouve.
 */
export type Tema = "escuro" | "claro";

const CHAVE = "tema";
const ouvintes = new Set<() => void>();

const ler = (): Tema => (document.documentElement.dataset.tema === "claro" ? "claro" : "escuro");

export function definirTema(t: Tema) {
  document.documentElement.dataset.tema = t;
  try {
    localStorage.setItem(CHAVE, t);
  } catch {}
  ouvintes.forEach((f) => f());
}

const assinar = (f: () => void) => {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
};

/** Tema atual; no servidor (export estático) é sempre "escuro". */
export const useTema = () => useSyncExternalStore(assinar, ler, () => "escuro" as Tema);
// O script inline que aplica o tema salvo antes da primeira pintura fica no layout ([lang]/layout.tsx).
