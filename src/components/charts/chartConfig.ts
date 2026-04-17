import { formatMoedaBRL, formatNumeroInteiro } from '../../utils/format';

export const chartPalette = [
  '#325497',
  '#3a5ea6',
  '#2996cc',
  '#4daed5',
  '#88c4de',
  '#b7d8ea',
  '#d7e8f6',
];

export const chartGridColor = '#dbe5f1';
export const chartAxisColor = '#5d6f86';

export const statusColors: Record<string, string> = {
  ativo: '#3a5ea6',
  vence_hoje: '#d48a1e',
  vencido: '#b54e52',
  sem_status: '#94a3b8',
};

export const faixaColors: Record<string, string> = {
  vencidos: '#b54e52',
  vencem_hoje: '#d48a1e',
  ate_7: '#e2a43d',
  ate_30: '#5b86c2',
  ate_60: '#3a5ea6',
  ate_90: '#4daed5',
  acima_90: '#88c4de',
};

export const tooltipStyle = {
  borderRadius: '18px',
  border: '1px solid #d7e2f1',
  backgroundColor: 'rgba(255,255,255,0.98)',
  boxShadow: '0 20px 45px -30px rgba(34, 54, 100, 0.35)',
};

export function formatTooltipNumber(value: number): string {
  return formatNumeroInteiro(value);
}

export function formatTooltipCurrency(value: number): string {
  return formatMoedaBRL(value);
}

export function truncateLabel(value: string, maxLength = 26): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
