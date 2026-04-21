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
  { key: 'total', label: 'Total', icon: DatabaseIcon, tone: 'primary' },
  { key: 'valor', label: 'Valor', icon: WalletIcon, tone: 'secondary' },
  { key: 'ativos', label: 'Ativos', icon: CheckCircleIcon, tone: 'success' },
  { key: 'vencidos', label: 'Vencidos', icon: AlertCircleIcon, tone: 'danger' },
  { key: 'proximos', label: 'Próx. 30d', icon: ClockIcon, tone: 'warning' },
  { key: 'incompletos', label: 'Incompletos', icon: BuildingIcon, tone: 'neutral' },
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
    iconBg: 'bg-[var(--color-secondary-soft)]',
    iconColor: 'text-secondary-700',
    accent: 'bg-secondary-600',
    activeBorder: 'border-secondary-600',
    activeRing: 'ring-[var(--color-secondary-ring)]',
  },
  success: {
    iconBg: 'bg-status-okBg',
    iconColor: 'text-status-ok',
    accent: 'bg-status-ok',
    activeBorder: 'border-status-ok',
    activeRing: 'ring-[var(--color-status-ok-ring)]',
  },
  danger: {
    iconBg: 'bg-status-criticalBg',
    iconColor: 'text-status-critical',
    accent: 'bg-status-critical',
    activeBorder: 'border-status-critical',
    activeRing: 'ring-[var(--color-status-critico-ring)]',
  },
  warning: {
    iconBg: 'bg-status-warningBg',
    iconColor: 'text-status-warning',
    accent: 'bg-status-warning',
    activeBorder: 'border-status-warning',
    activeRing: 'ring-[var(--color-status-atencao-ring)]',
  },
  neutral: {
    iconBg: 'bg-surface-2',
    iconColor: 'text-text-muted',
    accent: 'bg-text-subtle',
    activeBorder: 'border-text-subtle',
    activeRing: 'ring-[var(--color-status-neutro-ring)]',
  },
};

function IndicatorCardsComponent({ metricas, activeKpi, onSelect }: IndicatorCardsProps) {
  return (
    <section
      aria-label="Indicadores principais"
      className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 min-[1100px]:grid-cols-6"
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

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelect(card.key)}
            aria-pressed={isActive}
            title={card.key === 'valor' ? formatMoedaBRL(metricas.valorTotal) : undefined}
            className={`card-interactive group relative flex min-h-[92px] flex-col justify-between gap-2 overflow-hidden rounded-xl border bg-surface px-3.5 py-3 text-left md:min-h-[104px] md:px-4 md:py-3.5 ${
              isActive
                ? `${tone.activeBorder} shadow-raised ring-2 ${tone.activeRing}`
                : 'border-border shadow-soft'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 h-full w-0.5 ${tone.accent} transition-opacity duration-200 ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
              }`}
            />

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
                {card.label}
              </span>
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${tone.iconBg} ${tone.iconColor}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <span className="tnum text-2xl font-semibold leading-none tracking-tight text-text md:text-[26px]">
              {value}
            </span>
          </button>
        );
      })}
    </section>
  );
}

export const IndicatorCards = memo(IndicatorCardsComponent);
