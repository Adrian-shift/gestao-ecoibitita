import { useState } from "react";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import "./App.css";

export default function App() {
  const [pagina, setPagina] = useState(
    window.location.hash === "#cadastro" ? "cadastro" : "login"
  );

  function navegar(novaPagina) {
    setPagina(novaPagina);
    window.location.hash = novaPagina;
  }

  return (
    <main className="page">
      <div className="layout">
        <div className="brand">
          <img src="/assets/ecoibitita-logo.png" alt="EcoIbititá" />
        </div>

        <div className="form">
          {pagina === "login" ? (
            <Login onNavigate={navegar} />
          ) : (
            <Cadastro onNavigate={navegar} />
          )}
        </div>
      </div>
    </main>
  );
}
