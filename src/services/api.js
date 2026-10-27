const API_URL = import.meta.env.VITE_API_URL || "";

export { API_URL };

let token = null;
let aoExpirar = () => {};

export function definirToken(novo) {
  token = novo;
}

// avisa o contexto de autenticação quando a API recusa o token
export function aoSessaoExpirar(funcao) {
  aoExpirar = funcao;
}

async function lerMensagem(response, padrao) {
  try {
    const dados = await response.json();
    if (dados.message) return dados.message;
  } catch {
    // resposta sem JSON
  }
  return padrao;
}

export async function requisicao(caminho, opcoes = {}) {
  const headers = { ...(opcoes.headers || {}) };
  if (opcoes.body && !(opcoes.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers });
  } catch {
    throw new Error("Sem conexão com o servidor. Tente novamente em instantes.");
  }

  if (response.status === 401 && token) {
    aoExpirar();
    throw new Error("Sua sessão expirou. Entre novamente.");
  }
  if (!response.ok) {
    throw new Error(await lerMensagem(response, "Não foi possível concluir a operação."));
  }
  return response.status === 204 ? null : response.json();
}

export function login(email, senha) {
  return requisicao("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export function buscarMe() {
  return requisicao("/api/gestao/me");
}