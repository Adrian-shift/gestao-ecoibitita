import { useState } from "react";
import PasswordInput from "../components/PasswordInput";

export default function Login({ onNavigate }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [mensagem, setMensagem] = useState("");

  function alterar(campo) {
    return (event) =>
      setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  function entrar(event) {
    event.preventDefault();
    setMensagem(
      "Interface pronta para integração com a API de autenticação."
    );
  }

  return (
    <section className="card login">
      <div className="login-title">
        Preencha os campos abaixo para entrar
      </div>

      <form onSubmit={entrar}>
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
              setMensagem(
                "A recuperação de senha será ligada à API posteriormente."
              )
            }
          >
            Esqueci minha senha
          </button>
        </div>

        <button className="primary" type="submit">
          Entrar
        </button>

        {mensagem && (
          <p className="notice" role="status">
            {mensagem}
          </p>
        )}
      </form>

      <button
        type="button"
        className="account-link link"
        onClick={() => onNavigate("cadastro")}
      >
        Não tenho uma conta
      </button>
    </section>
  );
}
