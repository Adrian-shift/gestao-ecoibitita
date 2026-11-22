import { useCallback, useEffect, useState } from "react";
import UsuarioModal from "../components/UsuarioModal";
import { useAuth } from "../context/AuthContext";
import { listarUsuarios, resumoAdmin } from "../services/api";
import { corDoAvatar, formatarUltimoAcesso } from "../utils/formatar";

const TAMANHO = 10;
const SEM_FILTROS = { busca: "", perfil: "", ativo: "" };

const contar = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

function CartaoNumero({ titulo, valor, detalhe, verde }) {
  return (
    <div className="pn-kpi">
      <span className="pn-kpi-titulo">{titulo}</span>
      <strong className="pn-kpi-valor">{valor ?? "—"}</strong>
      <span className={`pn-kpi-detalhe${verde ? " verde" : ""}`}>{detalhe}</span>
    </div>
  );
}

export default function Usuarios() {
  const { usuario: eu } = useAuth();
  const [resumo, setResumo] = useState(null);
  const [form, setForm] = useState(SEM_FILTROS);       // o que está digitado
  const [filtros, setFiltros] = useState(SEM_FILTROS); // o que foi aplicado com "Buscar"
  const [pagina, setPagina] = useState(0);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [modal, setModal] = useState(null); // null | { usuario: null } (novo) | { usuario } (editar)
  const [aviso, setAviso] = useState("");

  const carregarResumo = useCallback(() => {
    resumoAdmin().then(setResumo).catch(() => {});
  }, []);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro("");
    listarUsuarios({ ...filtros, pagina, tamanho: TAMANHO })
      .then((resposta) => !cancelado && setDados(resposta))
      .catch((e) => !cancelado && setErro(e.message))
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [filtros, pagina, tentativa]);

  useEffect(() => {
    if (!aviso) return;
    const timer = setTimeout(() => setAviso(""), 5000);
    return () => clearTimeout(timer);
  }, [aviso]);

  function buscar(event) {
    event.preventDefault();
    setPagina(0);
    setFiltros(form);
  }

  function alterar(campo) {
    return (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  function aoSalvar(resposta, editou) {
    setModal(null);
    setAviso(editou ? "Usuário atualizado com sucesso." : `Usuário ${resposta.nome} criado com sucesso.`);
    carregarResumo();
    setTentativa((n) => n + 1);
  }

  const itens = dados?.itens ?? [];
  const totalPaginas = dados ? Math.max(1, Math.ceil(dados.total / dados.tamanho)) : 1;

  return (
    <>
      <div className="pn-kpis">
        <CartaoNumero
          titulo="Total de Usuários"
          valor={resumo?.totalUsuarios}
          detalhe={
            resumo
              ? `${contar(resumo.fiscais, "fiscal", "fiscais")} • ${contar(resumo.administradores, "administrador", "administradores")}`
              : ""
          }
        />
        <CartaoNumero
          titulo="Usuários Ativos"
          valor={resumo?.usuariosAtivos}
          detalhe={resumo ? `+${resumo.novosNoMes} este mês` : ""}
          verde
        />
        <CartaoNumero titulo="Categorias de Resíduos" valor={resumo?.categoriasAtivas} detalhe="Cadastros ativos" />
        <CartaoNumero titulo="Logs Hoje" valor={resumo?.logsHoje} detalhe="Alterações registradas" />
      </div>

      <section className="pn-painel">
        <div className="pn-painel-topo">
          <h2>Gerenciar Usuários</h2>
        </div>

        <form className="pn-filtros" onSubmit={buscar}>
          <input
            type="search"
            placeholder="Buscar por nome ou e-mail"
            value={form.busca}
            onChange={alterar("busca")}
            aria-label="Buscar por nome ou e-mail"
          />
          <select value={form.perfil} onChange={alterar("perfil")} aria-label="Filtrar por perfil">
            <option value="">Todos os perfis</option>
            <option value="Administrador">Administrador</option>
            <option value="Fiscal">Fiscal</option>
          </select>
          <select value={form.ativo} onChange={alterar("ativo")} aria-label="Filtrar por status">
            <option value="">Todos os status</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
          <button type="submit" className="pn-botao">Buscar</button>
          <button type="button" className="pn-botao pn-botao-novo" onClick={() => setModal({ usuario: null })}>
            + Novo usuário
          </button>
        </form>

        {aviso && <div className="pn-sucesso" role="status">{aviso}</div>}

        {erro && (
          <div className="pn-erro">
            <span>{erro}</span>
            <button type="button" className="pn-botao-claro" onClick={() => setTentativa((n) => n + 1)}>
              Tentar novamente
            </button>
          </div>
        )}

        <div className="pn-tabela-wrap">
          <table className="pn-tabela">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Último acesso</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="pn-usuario">
                      <span className="pn-usuario-avatar" style={{ background: corDoAvatar(u.nome) }}>
                        {u.nome.charAt(0).toUpperCase()}
                      </span>
                      {u.nome}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`pn-chip ${u.perfil === "Administrador" ? "pn-chip-admin" : "pn-chip-fiscal"}`}>
                      {u.perfil}
                    </span>
                  </td>
                  <td>
                    <span className={`pn-chip ${u.ativo ? "pn-chip-ativo" : "pn-chip-inativo"}`}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>{formatarUltimoAcesso(u.ultimoAcesso)}</td>
                  <td>
                    <button type="button" className="pn-link" onClick={() => setModal({ usuario: u })}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {carregando && <p className="pn-vazio-tabela">Carregando…</p>}
          {!carregando && !erro && itens.length === 0 && (
            <p className="pn-vazio-tabela">Nenhum usuário encontrado.</p>
          )}
        </div>

        {dados && dados.total > 0 && (
          <div className="pn-paginacao">
            <span>
              Página {dados.pagina + 1} de {totalPaginas} · {contar(dados.total, "usuário", "usuários")}
            </span>
            <div>
              <button type="button" disabled={pagina === 0 || carregando} onClick={() => setPagina((p) => p - 1)}>
                Anterior
              </button>
              <button type="button" disabled={dados.ultima || carregando} onClick={() => setPagina((p) => p + 1)}>
                Próxima
              </button>
            </div>
          </div>
        )}
      </section>

      {modal && (
        <UsuarioModal
          usuario={modal.usuario}
          idLogado={eu.id}
          aoSalvar={aoSalvar}
          aoFechar={() => setModal(null)}
        />
      )}
    </>
  );
}