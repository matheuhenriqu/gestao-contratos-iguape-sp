import { formatMoedaCompactaBRL, formatNumeroInteiro } from '../../utils/format';

export const chartPalette = [
  'var(--color-primary-900)',
  'var(--color-primary-700)',
  'var(--color-primary-600)',
  'var(--color-primary-500)',
  'var(--color-primary-200)',
];

export const donutPalette = {
  vencido: 'var(--color-status-critico)',
  critico: 'var(--color-status-atencao)',
  atencao: 'var(--color-primary-500)',
  ok: 'var(--color-primary-700)',
  neutro: 'var(--color-status-neutro)',
};

export const faixaColors: Record<string, string> = {
  vencidos: 'var(--color-status-critico)',
  vencem_hoje: 'var(--color-status-critico)',
  ate_7: 'var(--color-status-atencao)',
  ate_30: 'var(--color-primary-500)',
  ate_60: 'var(--color-primary-600)',
  ate_90: 'var(--color-primary-700)',
  acima_90: 'var(--color-primary-900)',
};

export const chartGridColor = 'var(--color-border)';
export const chartAxisColor = 'var(--color-text-subtle)';

export const tooltipStyle = {
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  boxShadow: 'var(--shadow-raised)',
  color: 'var(--color-text)',
  fontSize: '12px',
  lineHeight: '18px',
  padding: '8px 10px',
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
