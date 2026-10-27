import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MENU, TITULOS } from "../config/menu";

export default function PainelLayout() {
  const { usuario, sair } = useAuth();
  const { pathname } = useLocation();

  const itens = MENU[usuario.perfil] ?? [];
  const pagina = TITULOS[pathname] ?? { titulo: "EcoIbititá", subtitulo: "" };

  return (
    <div className="pn-app">
      <aside className="pn-sidebar">
        <div className="pn-brand">
          <img src="/assets/ecoibitita-logo.png" alt="EcoIbititá" />
        </div>

        <nav className="pn-nav">
          {itens.map(({ rotulo, caminho, icone: Icone }) => (
            <NavLink
              key={caminho}
              to={caminho}
              className={({ isActive }) => `pn-nav-item${isActive ? " ativo" : ""}`}
            >
              <Icone size={22} />
              <span>{rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pn-user">
          <div className="pn-avatar">{usuario.nome.charAt(0).toUpperCase()}</div>
          <div className="pn-user-text">
            <strong>{usuario.nome}</strong>
            <small>{usuario.perfil}</small>
          </div>
          <button type="button" className="pn-sair" onClick={sair} aria-label="Sair" title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      <div className="pn-main">
        <header className="pn-header">
          <div>
            <h1>{pagina.titulo}</h1>
            {pagina.subtitulo && <p>{pagina.subtitulo}</p>}
          </div>
          <button type="button" className="pn-sino" aria-label="Notificações">
            <Bell size={22} />
            <span className="pn-sino-ponto" />
          </button>
        </header>

        <div className="pn-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}