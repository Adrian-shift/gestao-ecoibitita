import { useState } from "react";
import { ArrowRight } from "lucide-react";
import PasswordInput from "../components/PasswordInput";

export default function Cadastro({ onNavigate }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    confirmacao: "",
  });
  const [mensagem, setMensagem] = useState("");

  function alterar(campo) {
    return (event) =>
      setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  function cadastrar(event) {
    event.preventDefault();

    if (form.password !== form.confirmacao) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    setMensagem(
      "Formulário pronto para integração com a API de cadastro."
    );
  }

  return (
    <section className="card register">
      <header>
        <h1>Crie sua conta</h1>
        <p>Preencha os campos abaixo para se cadastrar</p>
      </header>

      <form onSubmit={cadastrar}>
        <div className="field">
          <label htmlFor="cadastro-nome">
            Nome completo <span>*</span>
          </label>
          <input
            id="cadastro-nome"
            value={form.nome}
            onChange={alterar("nome")}
            placeholder="Digite seu nome completo"
            autoComplete="name"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="cadastro-email">
            E-mail <span>*</span>
          </label>
          <input
            id="cadastro-email"
            type="email"
            value={form.email}
            onChange={alterar("email")}
            placeholder="Digite seu e-mail"
            autoComplete="email"
            required
          />
        </div>

        <PasswordInput
          id="cadastro-password"
          label="Senha"
          value={form.password}
          onChange={alterar("password")}
          placeholder="Digite sua senha"
          autoComplete="new-password"
        />

        <PasswordInput
          id="cadastro-confirmacao"
          label="Confirmar senha"
          value={form.confirmacao}
          onChange={alterar("confirmacao")}
          placeholder="Confirme sua senha"
          autoComplete="new-password"
        />

        {mensagem && (
          <p className="notice" role="status">
            {mensagem}
          </p>
        )}

        <button className="primary" type="submit">
          Cadastrar
        </button>
      </form>

      <div className="or">
        <span>ou</span>
      </div>

      <button
        type="button"
        className="secondary"
        onClick={() => onNavigate("login")}
      >
        <ArrowRight />
        Já tenho uma conta
      </button>
    </section>
  );
}
