import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { inicioDo } from "./config/menu";
import RotaProtegida from "./components/RotaProtegida";
import PainelLayout from "./components/PainelLayout";
import Login from "./pages/Login";
import EmConstrucao from "./pages/EmConstrucao";
import "./App.css";
import "./painel.css";

// a tela de login mantém o fundo e o logo do Figma
function PaginaLogin() {
  return (
    <main className="page">
      <div className="layout">
        <div className="brand">
          <img src="/assets/ecoibitita-logo.png" alt="EcoIbititá" />
        </div>
        <div className="form">
          <Login />
        </div>
      </div>
    </main>
  );
}

// "/" leva cada perfil à sua primeira tela
function Inicio() {
  const { autenticado, verificando, usuario } = useAuth();
  if (verificando) return <p className="pn-carregando">Verificando sessão…</p>;
  return <Navigate to={autenticado ? inicioDo(usuario.perfil) : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<PaginaLogin />} />

          <Route element={<RotaProtegida />}>
            <Route element={<PainelLayout />}>
              <Route element={<RotaProtegida perfis={["Administrador"]} />}>
                <Route path="/usuarios" element={<EmConstrucao />} />
              </Route>
              <Route element={<RotaProtegida perfis={["Fiscal"]} />}>
                <Route path="/dashboard" element={<EmConstrucao />} />
                <Route path="/mapa" element={<EmConstrucao />} />
                <Route path="/denuncias" element={<EmConstrucao />} />
                <Route path="/relatorios" element={<EmConstrucao />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}