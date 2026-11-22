// cores (iguais às do site de denúncia) e ação de cada status
export const STATUS = {
  RECEBIDA: { rotulo: "Recebida", cor: "#6b7770" },
  EM_ANALISE: { rotulo: "Em análise", cor: "#2d7be5" },
  EM_ATENDIMENTO: { rotulo: "Em atendimento", cor: "#e8a20c" },
  RESOLVIDA: { rotulo: "Resolvida", cor: "#1c9b5f" },
  CANCELADA: { rotulo: "Cancelada", cor: "#d34a41" },
};

export const OPCOES_STATUS = Object.entries(STATUS).map(([valor, { rotulo }]) => ({ valor, rotulo }));

// texto do link da tabela: o que o fiscal faz em cada etapa
export function acaoDoStatus(codigo) {
  if (codigo === "RECEBIDA") return { texto: "Analisar", neutro: false };
  if (codigo === "EM_ANALISE" || codigo === "EM_ATENDIMENTO") return { texto: "Atualizar", neutro: false };
  return { texto: "Ver log", neutro: true };
}