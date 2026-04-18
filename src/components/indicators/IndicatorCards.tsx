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
    helper: 'base consolidada atual',
    valueKey: 'totalContratos',
    icon: DatabaseIcon,
  },
  {
    key: 'valor',
    label: 'Valor total',
    helper: 'somatório com tooltip completo',
    valueKey: 'valorTotal',
    icon: WalletIcon,
  },
  {
    key: 'ativos',
    label: 'Ativos',
    helper: 'vigentes além de hoje',
    valueKey: 'ativos',
    icon: CheckCircleIcon,
  },
  {
    key: 'vencidos',
    label: 'Vencidos',
    helper: 'prazo expirado',
    valueKey: 'vencidos',
    icon: AlertCircleIcon,
  },
  {
    key: 'proximos',
    label: 'Próximos do vencimento',
    helper: 'até 30 dias sem atraso',
    valueKey: 'proximosDoVencimento',
    icon: ClockIcon,
  },
  {
    key: 'incompletos',
    label: 'Dados incompletos',
    helper: 'campos essenciais ausentes',
    valueKey: 'dadosIncompletos',
    icon: BuildingIcon,
  },
] as const;

function IndicatorCardsComponent({ metricas, activeKpi, onSelect }: IndicatorCardsProps) {
  return (
    <section
      aria-label="Indicadores principais"
      className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
    >
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon;
        const numericValue = metricas[card.valueKey];
        const isActive = activeKpi === card.key;
        const isCurrency = card.key === 'valor';
        const value = isCurrency
          ? formatMoedaCompactaBRL(metricas.valorTotal)
          : formatNumeroInteiro(Number(numericValue));

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelect(card.key)}
            title={isCurrency ? formatMoedaBRL(metricas.valorTotal) : undefined}
            className={`focus-ring surface-card flex min-w-0 flex-col items-start gap-3 p-5 text-left transition hover:border-brand-600/50 hover:bg-primary-100/25 lg:p-6 ${
              isActive ? 'border-brand-600 shadow-soft' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-[18px] w-[18px] text-brand-600" />
              <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-subtle">
                {card.label}
              </span>
            </div>

            <span className="tabular-nums text-[24px] font-semibold leading-none text-text">
              {value}
            </span>

            <span className="text-[13px] leading-5 text-muted">{card.helper}</span>
          </button>
        );
      })}
    </section>
  );
}

export const IndicatorCards = memo(IndicatorCardsComponent);
