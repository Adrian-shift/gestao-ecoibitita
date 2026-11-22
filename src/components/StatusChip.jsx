export default function StatusChip({ codigo, texto }) {
  return <span className={`pn-chip pn-status-${codigo.toLowerCase()}`}>{texto}</span>;
}