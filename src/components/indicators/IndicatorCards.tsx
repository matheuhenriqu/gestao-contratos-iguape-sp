import { memo } from 'react';
import { formatMoedaBRL, formatMoedaCompactaBRL, formatNumeroInteiro } from '../../utils/format';
import {
  AlertCircleIcon,
  BuildingIcon,
  CheckCircleIcon,
  ClockIcon,
  DatabaseIcon,
  WalletIcon,
} from '../shared/icons';

type IndicatorCardsProps = {
  metricas: {
    totalContratos: number;
    valorTotal: number;
    ativos: number;
    vencidos: number;
    proximosDoVencimento: number;
    dadosIncompletos: number;
  };
  activeKpi: 'total' | 'valor' | 'ativos' | 'vencidos' | 'proximos' | 'incompletos' | null;
  onSelect: (kpi: 'total' | 'valor' | 'ativos' | 'vencidos' | 'proximos' | 'incompletos') => void;
};

const CARD_CONFIG = [
  {
    key: 'total',
    label: 'Total de contratos',
    icon: DatabaseIcon,
    tone: 'primary',
  },
  {
    key: 'valor',
    label: 'Valor total',
    icon: WalletIcon,
    tone: 'secondary',
  },
  {
    key: 'ativos',
    label: 'Ativos',
    icon: CheckCircleIcon,
    tone: 'success',
  },
  {
    key: 'vencidos',
    label: 'Vencidos',
    icon: AlertCircleIcon,
    tone: 'danger',
  },
  {
    key: 'proximos',
    label: 'Próximos',
    icon: ClockIcon,
    tone: 'warning',
  },
  {
    key: 'incompletos',
    label: 'Dados incompletos',
    icon: BuildingIcon,
    tone: 'neutral',
  },
] as const;

type Tone = (typeof CARD_CONFIG)[number]['tone'];

const TONE_STYLES: Record<
  Tone,
  { iconBg: string; iconColor: string; accent: string; activeBorder: string; activeRing: string }
> = {
  primary: {
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-700',
    accent: 'bg-primary-600',
    activeBorder: 'border-primary-600',
    activeRing: 'ring-primary-200',
  },
  secondary: {
    iconBg: 'bg-[rgba(43,144,148,0.12)]',
    iconColor: 'text-secondary-700',
    accent: 'bg-secondary-600',
    activeBorder: 'border-secondary-600',
    activeRing: 'ring-[rgba(43,144,148,0.25)]',
  },
  success: {
    iconBg: 'bg-status-okBg',
    iconColor: 'text-status-ok',
    accent: 'bg-status-ok',
    activeBorder: 'border-status-ok',
    activeRing: 'ring-[rgba(28,122,74,0.18)]',
  },
  danger: {
    iconBg: 'bg-status-criticalBg',
    iconColor: 'text-status-critical',
    accent: 'bg-status-critical',
    activeBorder: 'border-status-critical',
    activeRing: 'ring-[rgba(180,35,24,0.18)]',
  },
  warning: {
    iconBg: 'bg-status-warningBg',
    iconColor: 'text-status-warning',
    accent: 'bg-status-warning',
    activeBorder: 'border-status-warning',
    activeRing: 'ring-[rgba(163,93,0,0.18)]',
  },
  neutral: {
    iconBg: 'bg-surface-2',
    iconColor: 'text-text-muted',
    accent: 'bg-text-subtle',
    activeBorder: 'border-text-subtle',
    activeRing: 'ring-[rgba(107,122,142,0.25)]',
  },
};

function formatPercent(value: number, base: number): string {
  if (!base) {
    return '—';
  }

  const pct = (value / base) * 100;
  return `${pct.toFixed(1).replace('.', ',')}%`;
}

function getHelper(
  key: IndicatorCardsProps['activeKpi'] | (typeof CARD_CONFIG)[number]['key'],
  metricas: IndicatorCardsProps['metricas'],
): string {
  switch (key) {
    case 'total':
      return 'Base integral da planilha oficial';
    case 'valor':
      return `${formatNumeroInteiro(metricas.totalContratos)} contratos com valor consolidado`;
    case 'ativos':
      return `${formatNumeroInteiro(metricas.proximosDoVencimento)} vencem em até 30 dias`;
    case 'vencidos':
      return `${formatNumeroInteiro(metricas.vencidos)} registros com prazo expirado`;
    case 'proximos':
      return 'Até 30 dias, sem atraso';
    case 'incompletos':
      return 'Campos essenciais ausentes';
    default:
      return '';
  }
}

function getRelativeShare(
  key: (typeof CARD_CONFIG)[number]['key'],
  metricas: IndicatorCardsProps['metricas'],
): string | null {
  const base = metricas.totalContratos;

  if (!base) {
    return null;
  }

  switch (key) {
    case 'ativos':
      return `${formatPercent(metricas.ativos, base)} da base`;
    case 'vencidos':
      return `${formatPercent(metricas.vencidos, base)} da base`;
    case 'proximos':
      return `${formatPercent(metricas.proximosDoVencimento, base)} da base`;
    case 'incompletos':
      return `${formatPercent(metricas.dadosIncompletos, base)} da base`;
    default:
      return null;
  }
}

function IndicatorCardsComponent({ metricas, activeKpi, onSelect }: IndicatorCardsProps) {
  return (
    <section
      aria-label="Indicadores principais"
      className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 xl:gap-4"
    >
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon;
        const isActive = activeKpi === card.key;
        const tone = TONE_STYLES[card.tone];
        const numericValue =
          card.key === 'total'
            ? metricas.totalContratos
            : card.key === 'valor'
              ? metricas.valorTotal
              : card.key === 'ativos'
                ? metricas.ativos
                : card.key === 'vencidos'
                  ? metricas.vencidos
                  : card.key === 'proximos'
                    ? metricas.proximosDoVencimento
                    : metricas.dadosIncompletos;

        const value =
          card.key === 'valor'
            ? formatMoedaCompactaBRL(metricas.valorTotal)
            : formatNumeroInteiro(Number(numericValue));
        const share = getRelativeShare(card.key, metricas);

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelect(card.key)}
            title={card.key === 'valor' ? formatMoedaBRL(metricas.valorTotal) : undefined}
            className={`card-interactive group relative flex min-h-[148px] flex-col items-start gap-3 overflow-hidden rounded-xl border bg-surface px-4 py-4 text-left md:px-5 md:py-5 ${
              isActive
                ? `${tone.activeBorder} shadow-raised ring-2 ${tone.activeRing} -translate-y-0.5`
                : 'border-border shadow-soft'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 h-full w-1 ${tone.accent} ${isActive ? 'opacity-100' : 'opacity-0 transition-opacity group-hover:opacity-60'}`}
            />

            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-subtle">
                {card.label}
              </span>
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tone.iconBg} ${tone.iconColor}`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
            </div>

            <div className="flex w-full items-baseline gap-2">
              <span className="tnum text-3xl font-semibold leading-none tracking-tight text-text">
                {value}
              </span>
              {share ? (
                <span
                  className={`tnum rounded-pill border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${tone.iconBg} ${tone.iconColor} border-transparent`}
                >
                  {share}
                </span>
              ) : null}
            </div>

            <span className="text-sm leading-snug text-text-muted">
              {getHelper(card.key, metricas)}
            </span>
          </button>
        );
      })}
    </section>
  );
}

export const IndicatorCards = memo(IndicatorCardsComponent);
