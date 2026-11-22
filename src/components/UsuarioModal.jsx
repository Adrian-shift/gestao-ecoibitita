import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { criarUsuario, editarUsuario } from "../services/api";

function CampoSenha({ id, rotulo, valor, aoAlterar, obrigatorio, dica }) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <div className="pn-campo">
      <label htmlFor={id}>
        {rotulo} {obrigatorio && <span>*</span>}
      </label>
      <div className="pn-senha">
        <input
          id={id}
          type={mostrar ? "text" : "password"}
          value={valor}
          onChange={aoAlterar}
          minLength={8}
          maxLength={72}
          required={obrigatorio}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setMostrar((v) => !v)}
          aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
        >
          {mostrar ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {dica && <small>{dica}</small>}
    </div>
  );
}

// usuario = null cria um novo; com usuario, edita
export default function UsuarioModal({ usuario, idLogado, aoSalvar, aoFechar }) {
  const editando = Boolean(usuario);
  const ehVoce = editando && usuario.id === idLogado;

  const [form, setForm] = useState({
    nome: usuario?.nome ?? "",
    email: usuario?.email ?? "",
    perfil: usuario?.perfil ?? "Fiscal",
    ativo: usuario?.ativo ?? true,
    senha: "",
    confirmacao: "",
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const aoTeclar = (event) => {
      if (event.key === "Escape" && !enviando) aoFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar, enviando]);

  function alterar(campo) {
    return (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  async function enviar(event) {
    event.preventDefault();
    if (enviando) return;
    if (form.senha !== form.confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    setErro("");
    try {
      const resposta = editando
        ? await editarUsuario(usuario.id, {
            nome: form.nome.trim(),
            perfil: form.perfil,
            ativo: form.ativo,
            novaSenha: form.senha || null,
          })
        : await criarUsuario({
            nome: form.nome.trim(),
            email: form.email.trim(),
            senha: form.senha,
            perfil: form.perfil,
          });
      aoSalvar(resposta, editando);
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  return (
    <div className="pn-overlay" role="presentation">
      <div className="pn-modal" role="dialog" aria-modal="true" aria-labelledby="pn-modal-titulo">
        <header className="pn-modal-topo">
          <h2 id="pn-modal-titulo">{editando ? "Editar usuário" : "Novo usuário"}</h2>
          <button type="button" className="pn-modal-fechar" onClick={aoFechar} disabled={enviando} aria-label="Fechar">
            <X size={22} />
          </button>
        </header>

        <form className="pn-modal-form" onSubmit={enviar}>
          <div className="pn-campo">
            <label htmlFor="usuario-nome">
              Nome completo <span>*</span>
            </label>
            <input
              id="usuario-nome"
              value={form.nome}
              onChange={alterar("nome")}
              maxLength={150}
              autoComplete="off"
              autoFocus
              required
            />
          </div>

          <div className="pn-campo">
            <label htmlFor="usuario-email">
              E-mail <span>*</span>
            </label>
            <input
              id="usuario-email"
              type="email"
              value={form.email}
              onChange={alterar("email")}
              maxLength={150}
              autoComplete="off"
              readOnly={editando}
              required
            />
            {editando && <small>O e-mail não pode ser alterado.</small>}
          </div>

          <div className="pn-campo">
            <label htmlFor="usuario-perfil">
              Perfil <span>*</span>
            </label>
            <select id="usuario-perfil" value={form.perfil} onChange={alterar("perfil")} disabled={ehVoce}>
              <option value="Fiscal">Fiscal</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          {editando && (
            <div className="pn-campo">
              <label htmlFor="usuario-status">Status</label>
              <select
                id="usuario-status"
                value={form.ativo ? "true" : "false"}
                onChange={(e) => setForm((atual) => ({ ...atual, ativo: e.target.value === "true" }))}
                disabled={ehVoce}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
              {ehVoce && <small>Você não pode desativar a sua conta nem alterar o seu perfil.</small>}
            </div>
          )}

          <CampoSenha
            id="usuario-senha"
            rotulo={editando ? "Nova senha" : "Senha"}
            valor={form.senha}
            aoAlterar={alterar("senha")}
            obrigatorio={!editando}
            dica={editando ? "Deixe em branco para manter a senha atual." : "Mínimo de 8 caracteres. Repasse-a ao usuário."}
          />
          <CampoSenha
            id="usuario-confirmacao"
            rotulo="Confirmar senha"
            valor={form.confirmacao}
            aoAlterar={alterar("confirmacao")}
            obrigatorio={!editando || form.senha !== ""}
          />

          {erro && <p className="pn-erro-form" role="alert">{erro}</p>}

          <div className="pn-modal-acoes">
            <button type="button" className="pn-botao-claro" onClick={aoFechar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="pn-botao" disabled={enviando}>
              {enviando ? "Salvando…" : editando ? "Salvar alterações" : "Criar usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}