// mesmo cartão de números da tela de Usuários, com cores opcionais
// tom (detalhe): "verde" | "ambar" | "vermelho" — destaque (valor): "vermelho"
export default function CartaoNumero({ titulo, valor, detalhe, tom, destaque }) {
  return (
    <div className="pn-kpi">
      <span className="pn-kpi-titulo">{titulo}</span>
      <strong className={`pn-kpi-valor${destaque ? ` ${destaque}` : ""}`}>{valor ?? "—"}</strong>
      <span className={`pn-kpi-detalhe${tom ? ` ${tom}` : ""}`}>{detalhe}</span>
    </div>
  );
}