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

export function resumoAdmin() {
  return requisicao("/api/admin/resumo");
}

export function listarUsuarios({ busca = "", perfil = "", ativo = "", pagina = 0, tamanho = 10 } = {}) {
  const params = new URLSearchParams({ pagina, tamanho });
  if (busca.trim()) params.set("busca", busca.trim());
  if (perfil) params.set("perfil", perfil);
  if (ativo !== "") params.set("ativo", ativo);
  return requisicao(`/api/admin/usuarios?${params}`);
}

export function criarUsuario(dados) {
  return requisicao("/api/admin/usuarios", { method: "POST", body: JSON.stringify(dados) });
}

export function editarUsuario(id, dados) {
  return requisicao(`/api/admin/usuarios/${id}`, { method: "PUT", body: JSON.stringify(dados) });
}

function consulta(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.status) params.set("status", filtros.status);
  if (filtros.bairro) params.set("bairro", filtros.bairro);
  return params.toString() ? `?${params}` : "";
}

export const resumoDashboard = () => requisicao("/api/gestao/dashboard/resumo");
export const bairrosDashboard = () => requisicao("/api/gestao/dashboard/bairros");
export const denunciasDashboard = (f) => requisicao(`/api/gestao/dashboard/denuncias${consulta(f)}`);
export const mapaDashboard = (f) => requisicao(`/api/gestao/dashboard/mapa${consulta(f)}`);

function consultaDenuncias({ busca = "", status = "", categoriaId = "", bairro = "", pagina = 0, tamanho = 10 } = {}) {
  const params = new URLSearchParams({ pagina, tamanho });
  if (busca.trim()) params.set("busca", busca.trim());
  if (status) params.set("status", status);
  if (categoriaId) params.set("categoriaId", categoriaId);
  if (bairro) params.set("bairro", bairro);
  return params.toString();
}

export const resumoDenuncias = () => requisicao("/api/gestao/denuncias/resumo");
export const listarDenuncias = (filtros) => requisicao(`/api/gestao/denuncias?${consultaDenuncias(filtros)}`);
export const detalheDenuncia = (id) => requisicao(`/api/gestao/denuncias/${id}`);
export const alterarStatusDenuncia = (id, dados) =>
  requisicao(`/api/gestao/denuncias/${id}/status`, { method: "PATCH", body: JSON.stringify(dados) });
export const listarCategorias = () => requisicao("/api/categorias");