const hora = (data) => data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const mesmoDia = (a, b) => a.toDateString() === b.toDateString();

// "Hoje, 08:42" / "Ontem, 14:00" / "20/10/2026, 09:15"
export function formatarUltimoAcesso(iso) {
  if (!iso) return "Nunca acessou";
  const data = new Date(iso);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (mesmoDia(data, hoje)) return `Hoje, ${hora(data)}`;
  if (mesmoDia(data, ontem)) return `Ontem, ${hora(data)}`;
  return `${data.toLocaleDateString("pt-BR")}, ${hora(data)}`;
}

const CORES = ["#4f5bb5", "#2b3036", "#7b1d1d", "#c2399e", "#0f7a46", "#a8620a"];

// a mesma pessoa sempre recebe a mesma cor de avatar
export function corDoAvatar(nome) {
  let soma = 0;
  for (const letra of nome) soma += letra.charCodeAt(0);
  return CORES[soma % CORES.length];
}