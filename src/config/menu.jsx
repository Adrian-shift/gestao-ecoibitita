import { CircleUser, ClipboardList, FileText, LayoutDashboard, Map } from "lucide-react";

export const MENU = {
  Administrador: [
    { rotulo: "Usuários", caminho: "/usuarios", icone: CircleUser },
  ],
  Fiscal: [
    { rotulo: "Dashboard", caminho: "/dashboard", icone: LayoutDashboard },
    { rotulo: "Mapa Georreferenciado", caminho: "/mapa", icone: Map },
    { rotulo: "Gerenciar Denúncias", caminho: "/denuncias", icone: ClipboardList },
    { rotulo: "Relatórios", caminho: "/relatorios", icone: FileText },
  ],
};

export const TITULOS = {
  "/usuarios": {
    titulo: "Administração do Sistema",
    subtitulo: "Gerencie usuários e permissões do EcoIbititá.",
  },
  "/dashboard": {
    titulo: "Visão Geral da Operação",
    subtitulo: "Acompanhamento de limpeza urbana em Ibititá-BA",
  },
  "/mapa": { titulo: "Mapa Georreferenciado", subtitulo: "" },
  "/denuncias": { titulo: "Gerenciar Denúncias", subtitulo: "" },
  "/relatorios": { titulo: "Relatórios", subtitulo: "" },
};

// para onde cada perfil vai depois do login
export function inicioDo(perfil) {
  return perfil === "Administrador" ? "/usuarios" : "/dashboard";
}