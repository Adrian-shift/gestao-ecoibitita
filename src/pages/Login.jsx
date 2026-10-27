import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { autenticado, entrar } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [mensagem, setMensagem] = useState({ texto: "", erro: false });
  const [enviando, setEnviando] = useState(false);
  const [demorando, setDemorando] = useState(false);

  // o servidor gratuito "dorme" quando fica parado: avisa se a resposta demorar
  useEffect(() => {
    if (!enviando) {
      setDemorando(false);
      return;
    }
    const timer = setTimeout(() => setDemorando(true), 6000);
    return () => clearTimeout(timer);
  }, [enviando]);

  if (autenticado) return <Navigate to="/" replace />;

  function alterar(campo) {
    return (event) =>
      setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  async function enviar(event) {
    event.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setMensagem({ texto: "", erro: false });
    try {
      await entrar(form.email.trim(), form.password);
    } catch (erro) {
      setMensagem({ texto: erro.message, erro: true });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="card login">
      <div className="login-title">Preencha os campos abaixo para entrar</div>

      <form onSubmit={enviar}>
        <div className="field">
          <label htmlFor="login-email">
            E-mail <span>*</span>
          </label>
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={alterar("email")}
            placeholder="Digite seu e-mail"
            autoComplete="email"
            required
          />
        </div>

        <PasswordInput
          id="login-password"
          label="Senha"
          value={form.password}
          onChange={alterar("password")}
          placeholder="Digite sua senha"
          autoComplete="current-password"
        />

        <div className="forgot">
          <button
            type="button"
            className="link"
            onClick={() =>
              setMensagem({
                texto: "A recuperação de senha será ligada à API posteriormente.",
                erro: false,
              })
            }
          >
            Esqueci minha senha
          </button>
        </div>

        <button className="primary" type="submit" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>

        {demorando && (
          <p className="notice" role="status">
            O servidor pode levar até 1 minuto para acordar. Aguarde um instante.
          </p>
        )}
        {mensagem.texto && (
          <p className={`notice ${mensagem.erro ? "erro" : ""}`} role={mensagem.erro ? "alert" : "status"}>
            {mensagem.texto}
          </p>
        )}
      </form>
    </section>
  );
}