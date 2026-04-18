import { formatMoedaCompactaBRL, formatNumeroInteiro } from '../../utils/format';

export const chartPalette = ['#1f3767', '#3a5ea6', '#5579be', '#7f9cd0', '#aec1e1', '#d6e0f2'];

export const chartGridColor = '#e2e6ec';
export const chartAxisColor = '#6b7280';

export const statusColors: Record<string, string> = {
  ativo: '#2f6f5f',
  vence_hoje: '#b37a28',
  vencido: '#9e4c4b',
  sem_status: '#9aa3b2',
};

export const faixaColors: Record<string, string> = {
  vencidos: '#9e4c4b',
  vencem_hoje: '#b37a28',
  ate_7: '#5579be',
  ate_30: '#3a5ea6',
  ate_60: '#5478a6',
  ate_90: '#6e90bb',
  acima_90: '#2f8aa3',
};

export const tooltipStyle = {
  borderRadius: '10px',
  border: '1px solid #e2e6ec',
  backgroundColor: '#ffffff',
  boxShadow: '0 12px 30px -18px rgba(15, 23, 42, 0.35)',
  fontSize: '13px',
};

export function truncateLabel(value: string, maxLength = 28): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export function formatAxisCurrency(value: number): string {
  return formatMoedaCompactaBRL(value).replace(',0 ', ' ');
}

export function formatAxisNumber(value: number): string {
  return formatNumeroInteiro(value);
}
