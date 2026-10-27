import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { aoSessaoExpirar, buscarMe, definirToken, login } from "../services/api";

const CHAVE = "ecoibitita-gestao-sessao";
const AuthContext = createContext(null);

// a sessão fica no sessionStorage: some ao fechar a aba (bom para computadores compartilhados)
function lerSessao() {
  try {
    const sessao = JSON.parse(sessionStorage.getItem(CHAVE));
    if (sessao && Date.parse(sessao.expiraEm) > Date.now()) return sessao;
  } catch {
    // ignora sessão corrompida
  }
  sessionStorage.removeItem(CHAVE);
  return null;
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(() => {
    const salva = lerSessao();
    if (salva) definirToken(salva.token);
    return salva;
  });
  const [verificando, setVerificando] = useState(Boolean(sessao));

  const sair = useCallback(() => {
    definirToken(null);
    sessionStorage.removeItem(CHAVE);
    setSessao(null);
  }, []);

  useEffect(() => {
    aoSessaoExpirar(sair);
  }, [sair]);

  // ao abrir a página, confirma com a API que a sessão ainda vale
  useEffect(() => {
    if (!sessao) return;
    buscarMe()
      .then((usuario) =>
        setSessao((atual) => {
          const nova = { ...atual, usuario };
          sessionStorage.setItem(CHAVE, JSON.stringify(nova));
          return nova;
        })
      )
      .catch(() => {}) // se foi 401, o aviso de sessão expirada já fez o logout
      .finally(() => setVerificando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // encerra sozinho quando o token vence
  useEffect(() => {
    if (!sessao) return;
    const restante = Date.parse(sessao.expiraEm) - Date.now();
    const timer = setTimeout(sair, Math.max(restante, 0));
    return () => clearTimeout(timer);
  }, [sessao?.expiraEm, sair]);

  async function entrar(email, senha) {
    const dados = await login(email, senha);
    definirToken(dados.token);
    const nova = { token: dados.token, expiraEm: dados.expiraEm, usuario: dados.usuario };
    sessionStorage.setItem(CHAVE, JSON.stringify(nova));
    setSessao(nova);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario: sessao?.usuario ?? null,
        autenticado: Boolean(sessao),
        verificando,
        entrar,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}