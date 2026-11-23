import { useEffect, useState } from "react";
import { X } from "lucide-react";
import StatusChip from "./StatusChip";
import { STATUS } from "../config/status";
import { alterarStatusDenuncia, detalheDenuncia } from "../services/api";
import { formatarDataHora } from "../utils/formatar";

export default function DenunciaModal({ id, aoFechar, aoAlterar }) {
  const [d, setD] = useState(null);
  const [erro, setErro] = useState("");
  const [foto, setFoto] = useState(0);
  const [novoStatus, setNovoStatus] = useState("");
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const aoTeclar = (event) => {
      if (event.key === "Escape" && !enviando) aoFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar, enviando]);

  useEffect(() => {
    let cancelado = false;
    detalheDenuncia(id)
      .then((resposta) => {
        if (cancelado) return;
        setD(resposta);
        setNovoStatus(resposta.statusPermitidos[0] ?? "");
      })
      .catch((e) => !cancelado && setErro(e.message));
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function atualizar(event) {
    event.preventDefault();
    if (enviando || !novoStatus) return;
    if (novoStatus === "CANCELADA" && !observacao.trim()) {
      setErroForm("Informe o motivo do cancelamento.");
      return;
    }

    setEnviando(true);
    setErroForm("");
    setAviso("");
    try {
      const resposta = await alterarStatusDenuncia(id, {
        status: novoStatus,
        observacao: observacao.trim() || null,
      });
      setD(resposta);
      setNovoStatus(resposta.statusPermitidos[0] ?? "");
      setObservacao("");
      setAviso("Status atualizado com sucesso.");
      aoAlterar();
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pn-overlay" role="presentation">
      <div className="pn-modal pn-modal-largo" role="dialog" aria-modal="true" aria-labelledby="pn-denuncia-titulo">
        <header className="pn-modal-topo">
          <div className="pn-modal-titulo">
            <h2 id="pn-denuncia-titulo">{d ? d.protocolo : "Denúncia"}</h2>
            {d && <StatusChip codigo={d.statusCodigo} texto={d.status} />}
          </div>
          <button type="button" className="pn-modal-fechar" onClick={aoFechar} disabled={enviando} aria-label="Fechar">
            <X size={22} />
          </button>
        </header>

        <div className="pn-modal-corpo">
          {erro && <p className="pn-erro-form" role="alert">{erro}</p>}
          {!erro && !d && <p className="pn-vazio-tabela">Carregando…</p>}

          {d && (
            <>
              <section className="pn-secao">
                <h3>Fotos e descrição</h3>
                {d.fotos.length > 0 ? (
                  <>
                    <img className="pn-foto-principal" src={d.fotos[foto]} alt={`Foto ${foto + 1} da denúncia`} />
                    {d.fotos.length > 1 && (
                      <div className="pn-miniaturas">
                        {d.fotos.map((url, i) => (
                          <button
                            type="button"
                            key={url}
                            className={i === foto ? "ativo" : ""}
                            onClick={() => setFoto(i)}
                            aria-label={`Ver foto ${i + 1}`}
                          >
                            <img src={url} alt="" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="pn-texto-suave">Nenhuma foto enviada.</p>
                )}
                <p className="pn-descricao">{d.descricao || "Sem descrição informada."}</p>
              </section>

              <section className="pn-secao">
                <h3>Informações</h3>
                <div className="pn-info">
                  <div>
                    <small>Categoria</small>
                    <strong>{d.categoria}</strong>
                  </div>
                  <div>
                    <small>Data da denúncia</small>
                    <strong>{formatarDataHora(d.dataRegistro)}</strong>
                  </div>
                  <div>
                    <small>Última atualização</small>
                    <strong>{formatarDataHora(d.dataAtualizacao)}</strong>
                  </div>
                  <div>
                    <small>Local</small>
                    <strong>{[d.endereco, d.bairro].filter(Boolean).join(" - ")}</strong>
                  </div>
                  {d.pontoReferencia && (
                    <div>
                      <small>Ponto de referência</small>
                      <strong>{d.pontoReferencia}</strong>
                    </div>
                  )}
                  <div>
                    <small>Localização exata</small>
                    <a
                      className="pn-link"
                      href={`https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=18/${d.latitude}/${d.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir no mapa
                    </a>
                  </div>
                </div>
              </section>

              <section className="pn-secao">
                <h3>Histórico</h3>
                <ol className="pn-historico">
                  <li>
                    <strong>Recebida</strong>
                    <span>Denúncia registrada pelo cidadão.</span>
                    <small>{formatarDataHora(d.dataRegistro)}</small>
                  </li>
                  {d.historico.map((h, i) => (
                    <li key={i}>
                      <strong>{h.status}</strong>
                      {h.observacao && <span>{h.observacao}</span>}
                      <small>
                        {h.responsavel}, {formatarDataHora(h.data)}
                      </small>
                    </li>
                  ))}
                </ol>
              </section>

              {d.statusPermitidos.length > 0 ? (
                <form className="pn-acao-status" onSubmit={atualizar}>
                  <h3>Atualizar status</h3>

                  <div className="pn-campo">
                    <label htmlFor="denuncia-status">Novo status</label>
                    <select
                      id="denuncia-status"
                      value={novoStatus}
                      onChange={(e) => setNovoStatus(e.target.value)}
                    >
                      {d.statusPermitidos.map((codigo) => (
                        <option key={codigo} value={codigo}>
                          {STATUS[codigo]?.rotulo ?? codigo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pn-campo">
                    <label htmlFor="denuncia-obs">
                      Observação {novoStatus === "CANCELADA" && <span>*</span>}
                    </label>
                    <textarea
                      id="denuncia-obs"
                      rows={3}
                      maxLength={255}
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                    />
                    <small>
                      {novoStatus === "CANCELADA"
                        ? "Obrigatória: explique o motivo do cancelamento."
                        : "Opcional. Fica registrada no histórico."}
                    </small>
                  </div>

                  {aviso && <div className="pn-sucesso" role="status">{aviso}</div>}
                  {erroForm && <p className="pn-erro-form" role="alert">{erroForm}</p>}

                  <div className="pn-modal-acoes">
                    <button type="button" className="pn-botao-claro" onClick={aoFechar} disabled={enviando}>
                      Fechar
                    </button>
                    <button type="submit" className="pn-botao" disabled={enviando}>
                      {enviando ? "Salvando…" : "Atualizar status"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {aviso && <div className="pn-sucesso" role="status">{aviso}</div>}
                  <p className="pn-texto-suave">Esta denúncia está encerrada e não pode mais ser alterada.</p>
                  <div className="pn-modal-acoes">
                    <button type="button" className="pn-botao-claro" onClick={aoFechar}>
                      Fechar
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}