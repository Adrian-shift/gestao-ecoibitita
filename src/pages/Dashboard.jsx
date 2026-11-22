import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CartaoNumero from "../components/CartaoNumero";
import MapaDenuncias from "../components/MapaDenuncias";
import StatusChip from "../components/StatusChip";
import { OPCOES_STATUS, STATUS, acaoDoStatus } from "../config/status";
import { bairrosDashboard, denunciasDashboard, mapaDashboard, resumoDashboard } from "../services/api";

const SEM_FILTROS = { status: "", bairro: "" };

const dataCurta = (iso) => new Date(iso).toLocaleDateString("pt-BR");
const numero = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [bairros, setBairros] = useState([]);
  const [form, setForm] = useState(SEM_FILTROS);       // o que está escolhido
  const [filtros, setFiltros] = useState(SEM_FILTROS); // o que foi aplicado com "Buscar"
  const [recentes, setRecentes] = useState([]);
  const [pontos, setPontos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    resumoDashboard().then(setResumo).catch(() => {});
    bairrosDashboard().then(setBairros).catch(() => {});
  }, [tentativa]);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro("");
    Promise.all([denunciasDashboard(filtros), mapaDashboard(filtros)])
      .then(([lista, mapa]) => {
        if (cancelado) return;
        setRecentes(lista);
        setPontos(mapa);
      })
      .catch((e) => !cancelado && setErro(e.message))
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [filtros, tentativa]);

  function buscar(event) {
    event.preventDefault();
    setFiltros(form);
  }

  function alterar(campo) {
    return (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  const variacao = resumo?.variacaoMensalPercentual;
  const detalheVolume = !resumo
    ? ""
    : variacao == null
      ? `${resumo.volumeNoMes} este mês`
      : `${variacao > 0 ? "+" : ""}${variacao}% este mês`;

  return (
    <>
      <div className="pn-kpis">
        <CartaoNumero
          titulo="Volume de Solicitações"
          valor={resumo?.volume}
          detalhe={detalheVolume}
          tom={variacao != null && variacao >= 0 ? "verde" : undefined}
        />
        <CartaoNumero
          titulo="Taxa de Resolução"
          valor={resumo ? `${resumo.taxaResolucaoPercentual}%` : null}
          detalhe={resumo ? `${resumo.resolvidas} resolvidas` : ""}
          tom="verde"
        />
        <CartaoNumero
          titulo="Tempo Médio de Atendimento"
          valor={resumo?.tempoMedioHoras != null ? `${numero(resumo.tempoMedioHoras)}h` : null}
          detalhe={resumo ? `Meta: ${resumo.metaHoras}h` : ""}
          tom="ambar"
        />
        <CartaoNumero
          titulo="Bairro mais Crítico"
          valor={resumo?.bairroCritico}
          destaque="vermelho"
          detalhe={
            !resumo
              ? ""
              : resumo.bairroCritico
                ? `${resumo.bairroCriticoAbertas} ocorrências abertas`
                : "Nenhuma ocorrência aberta"
          }
          tom="vermelho"
        />
      </div>

      <div className="pn-dash-grid">
        <section className="pn-painel">
          <div className="pn-painel-topo">
            <h2>Mapeamento</h2>
          </div>
          <div className="pn-painel-espaco" />
          <MapaDenuncias pontos={pontos} />
          <div className="pn-legenda">
            {Object.values(STATUS).map(({ rotulo, cor }) => (
              <span key={rotulo}>
                <i style={{ background: cor }} />
                {rotulo}
              </span>
            ))}
          </div>
        </section>

        <section className="pn-painel">
          <div className="pn-painel-topo">
            <h2>Denúncias Recentes</h2>
          </div>

          <form className="pn-filtros" onSubmit={buscar}>
            <select value={form.status} onChange={alterar("status")} aria-label="Filtrar por status">
              <option value="">Status: Todos</option>
              {OPCOES_STATUS.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>
            <select value={form.bairro} onChange={alterar("bairro")} aria-label="Filtrar por bairro">
              <option value="">Bairro: Todos</option>
              {bairros.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <button type="submit" className="pn-botao">Buscar</button>
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
            <table className="pn-tabela pn-tabela-compacta">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Data</th>
                  <th>Local (Bairro)</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((d) => {
                  const acao = acaoDoStatus(d.statusCodigo);
                  return (
                    <tr key={d.id}>
                      <td>{d.protocolo}</td>
                      <td>{dataCurta(d.dataRegistro)}</td>
                      <td>{d.endereco ? `${d.endereco} (${d.bairro})` : d.bairro}</td>
                      <td>{d.categoria}</td>
                      <td>
                        <StatusChip codigo={d.statusCodigo} texto={d.status} />
                      </td>
                      <td>
                        <Link
                          className={`pn-link${acao.neutro ? " pn-link-neutro" : ""}`}
                          to={`/denuncias?protocolo=${encodeURIComponent(d.protocolo)}`}
                        >
                          {acao.texto}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {carregando && <p className="pn-vazio-tabela">Carregando…</p>}
            {!carregando && !erro && recentes.length === 0 && (
              <p className="pn-vazio-tabela">Nenhuma denúncia encontrada.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}