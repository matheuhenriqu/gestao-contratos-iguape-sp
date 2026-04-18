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
  },
  {
    key: 'valor',
    label: 'Valor total',
    icon: WalletIcon,
  },
  {
    key: 'ativos',
    label: 'Ativos',
    icon: CheckCircleIcon,
  },
  {
    key: 'vencidos',
    label: 'Vencidos',
    icon: AlertCircleIcon,
  },
  {
    key: 'proximos',
    label: 'Próximos',
    icon: ClockIcon,
  },
  {
    key: 'incompletos',
    label: 'Dados incompletos',
    icon: BuildingIcon,
  },
] as const;

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

function IndicatorCardsComponent({ metricas, activeKpi, onSelect }: IndicatorCardsProps) {
  return (
    <section
      aria-label="Indicadores principais"
      className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 xl:gap-4"
    >
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon;
        const isActive = activeKpi === card.key;
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
            title={card.key === 'valor' ? formatMoedaBRL(metricas.valorTotal) : undefined}
            className={`relative flex min-h-[132px] flex-col items-start gap-3 overflow-hidden rounded-lg border bg-surface px-4 py-4 text-left transition duration-150 md:px-5 md:py-5 ${
              isActive
                ? 'border-primary-600 shadow-raised'
                : 'border-border shadow-soft hover:border-primary-600 hover:shadow-raised'
            }`}
          >
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-3 left-0 w-[3px] rounded-r-pill bg-secondary-600"
              />
            ) : null}

            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-subtle">
                {card.label}
              </span>
            </div>

            <span className="tnum text-2xl font-semibold text-text">{value}</span>

            <span className="text-sm text-text-muted">{getHelper(card.key, metricas)}</span>
          </button>
        );
      })}
    </section>
  );
}

export const IndicatorCards = memo(IndicatorCardsComponent);
