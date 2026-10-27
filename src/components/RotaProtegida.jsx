import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { inicioDo } from "../config/menu";

export default function RotaProtegida({ perfis }) {
  const { autenticado, verificando, usuario } = useAuth();

  if (verificando) return <p className="pn-carregando">Verificando sessão…</p>;
  if (!autenticado) return <Navigate to="/login" replace />;
  if (perfis && !perfis.includes(usuario.perfil)) {
    return <Navigate to={inicioDo(usuario.perfil)} replace />;
  }
  return <Outlet />;
}