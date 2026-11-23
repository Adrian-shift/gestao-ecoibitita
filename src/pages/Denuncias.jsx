import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CartaoNumero from "../components/CartaoNumero";
import DenunciaModal from "../components/DenunciaModal";
import StatusChip from "../components/StatusChip";
import { OPCOES_STATUS } from "../config/status";
import { bairrosDashboard, listarCategorias, listarDenuncias, resumoDenuncias } from "../services/api";
import { formatarData } from "../utils/formatar";

const TAMANHO = 10;

const contar = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;
const dataDoPeriodo = (iso) => iso.split("-").reverse().join("/"); // "2026-07-30" -> "30/07/2026"

// até 5 números de página ao redor da atual
function paginasVisiveis(atual, total) {
  const inicio = Math.max(0, Math.min(atual - 2, total - 5));
  const fim = Math.min(total, inicio + 5);
  const lista = [];
  for (let i = inicio; i < fim; i++) lista.push(i);
  return lista;
}

export default function Denuncias() {
  // vindo do dashboard (?protocolo=ECO-...), já abre a denúncia
  const [searchParams] = useSearchParams();
  const protocoloInicial = searchParams.get("protocolo") ?? "";
  const inicial = { busca: protocoloInicial, status: "", categoriaId: "", bairro: "" };
  const abrirAutomatico = useRef(Boolean(protocoloInicial));

  const [resumo, setResumo] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [form, setForm] = useState(inicial);       // o que está digitado
  const [filtros, setFiltros] = useState(inicial); // o que foi aplicado com "Filtrar"
  const [pagina, setPagina] = useState(0);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [selecionada, setSelecionada] = useState(null); // id da denúncia aberta na janela

  useEffect(() => {
    resumoDenuncias().then(setResumo).catch(() => {});
    listarCategorias().then(setCategorias).catch(() => {});
    bairrosDashboard().then(setBairros).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro("");
    listarDenuncias({ ...filtros, pagina, tamanho: TAMANHO })
      .then((resposta) => {
        if (cancelado) return;
        setDados(resposta);
        if (abrirAutomatico.current) {
          abrirAutomatico.current = false;
          const achada = resposta.itens.find((i) => i.protocolo === protocoloInicial);
          if (achada) setSelecionada(achada.id);
        }
      })
      .catch((e) => !cancelado && setErro(e.message))
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, pagina, tentativa]);

  function filtrar(event) {
    event.preventDefault();
    setPagina(0);
    setFiltros(form);
  }

  function alterar(campo) {
    return (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  const itens = dados?.itens ?? [];
  const totalPaginas = dados ? Math.max(1, Math.ceil(dados.total / dados.tamanho)) : 1;

  return (
    <>
      <div className="pn-kpis">
        <CartaoNumero
          titulo="Total de Registros"
          valor={resumo?.total.toLocaleString("pt-BR")}
          detalhe="Todos os históricos"
          tom="verde"
        />
        <CartaoNumero
          titulo="Últimos 30 dias"
          valor={resumo?.ultimos30Dias.toLocaleString("pt-BR")}
          detalhe="Registros realizados"
          tom="ambar"
        />
        <CartaoNumero
          titulo="Usuários Envolvidos"
          valor={resumo?.usuariosEnvolvidos}
          detalhe="Fiscais e administradores"
          tom="azul"
        />
        <CartaoNumero
          titulo="Período Selecionado"
          valor={resumo ? `${dataDoPeriodo(resumo.periodoInicio)} - ${dataDoPeriodo(resumo.periodoFim)}` : null}
          destaque="texto"
          detalhe="Últimos 30 dias"
          tom="verde"
        />
      </div>

      <section className="pn-painel">
        <div className="pn-painel-topo">
          <h2>Lista de Denúncias</h2>
        </div>

        <form className="pn-filtros" onSubmit={filtrar}>
          <input
            type="search"
            placeholder="Buscar por protocolo ou endereço"
            value={form.busca}
            onChange={alterar("busca")}
            aria-label="Buscar por protocolo ou endereço"
          />
          <select value={form.status} onChange={alterar("status")} aria-label="Filtrar por status">
            <option value="">Todos os status</option>
            {OPCOES_STATUS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
          <select value={form.categoriaId} onChange={alterar("categoriaId")} aria-label="Filtrar por categoria">
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <select value={form.bairro} onChange={alterar("bairro")} aria-label="Filtrar por bairro">
            <option value="">Todos os bairros</option>
            {bairros.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <button type="submit" className="pn-botao">Filtrar</button>
        </form>

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
                <th>Protocolo</th>
                <th>Data</th>
                <th>Local</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.protocolo}</strong></td>
                  <td>{formatarData(d.dataRegistro)}</td>
                  <td>
                    <div className="pn-local">
                      <span>{d.endereco || "Endereço não informado"}</span>
                      <small>{d.bairro}</small>
                    </div>
                  </td>
                  <td>{d.categoria}</td>
                  <td>
                    <StatusChip codigo={d.statusCodigo} texto={d.status} />
                  </td>
                  <td>
                    <button type="button" className="pn-link" onClick={() => setSelecionada(d.id)}>
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {carregando && <p className="pn-vazio-tabela">Carregando…</p>}
          {!carregando && !erro && itens.length === 0 && (
            <p className="pn-vazio-tabela">Nenhuma denúncia encontrada.</p>
          )}
        </div>

        {dados && dados.total > 0 && (
          <div className="pn-paginacao">
            <span>
              Página {dados.pagina + 1} de {totalPaginas} · {contar(dados.total, "denúncia", "denúncias")}
            </span>
            <div>
              <button type="button" disabled={pagina === 0 || carregando} onClick={() => setPagina((p) => p - 1)}>
                ‹
              </button>
              {paginasVisiveis(pagina, totalPaginas).map((n) => (
                <button
                  type="button"
                  key={n}
                  className={n === pagina ? "ativo" : ""}
                  disabled={carregando}
                  onClick={() => setPagina(n)}
                >
                  {n + 1}
                </button>
              ))}
              <button type="button" disabled={dados.ultima || carregando} onClick={() => setPagina((p) => p + 1)}>
                ›
              </button>
            </div>
          </div>
        )}
      </section>

      {selecionada && (
        <DenunciaModal
          id={selecionada}
          aoFechar={() => setSelecionada(null)}
          aoAlterar={() => setTentativa((n) => n + 1)}
        />
      )}
    </>
  );
}