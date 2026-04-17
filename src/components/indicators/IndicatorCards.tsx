import { formatMoedaBRL, formatNumeroInteiro } from '../../utils/format';

type IndicatorCardsProps = {
  metricas: {
    totalContratos: number;
    valorTotal: number;
    ativos: number;
    vencidos: number;
    proximosDoVencimento: number;
    dadosIncompletos: number;
  };
};

const CARDS = [
  {
    key: 'totalContratos',
    label: 'Total de contratos',
    tone: 'text-iguape-700',
    helper: 'registros na consulta atual',
    featured: false,
  },
  {
    key: 'valorTotal',
    label: 'Valor total',
    tone: 'text-iguape-800',
    helper: 'soma dos valores informados',
    featured: true,
  },
  {
    key: 'ativos',
    label: 'Contratos ativos',
    tone: 'text-sky-700',
    helper: 'vigentes além de hoje',
    featured: false,
  },
  {
    key: 'vencidos',
    label: 'Contratos vencidos',
    tone: 'text-rose-700',
    helper: 'com vencimento expirado',
    featured: false,
  },
  {
    key: 'proximosDoVencimento',
    label: 'Próximos do vencimento',
    tone: 'text-amber-700',
    helper: 'até 30 dias, sem atraso',
    featured: false,
  },
  {
    key: 'dadosIncompletos',
    label: 'Dados incompletos',
    tone: 'text-slate-700',
    helper: 'campos essenciais ausentes',
    featured: false,
  },
] as const;

export function IndicatorCards({ metricas }: IndicatorCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {CARDS.map((card) => {
        const value =
          card.key === 'valorTotal'
            ? formatMoedaBRL(metricas.valorTotal)
            : formatNumeroInteiro(metricas[card.key]);

        return (
          <article
            key={card.key}
            className={`rounded-[28px] border border-white/70 bg-white/90 px-4 py-4 shadow-soft ring-1 ring-iguape-100/70 backdrop-blur-sm ${
              card.featured ? 'sm:col-span-2 xl:col-span-2' : 'xl:col-span-1'
            }`}
          >
            <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-iguape-600 to-iguape-400" />
            <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {card.label}
            </p>
            <p
              className={`mt-3 break-words text-[1.35rem] font-semibold tracking-[-0.04em] sm:text-[1.55rem] ${card.tone}`}
            >
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{card.helper}</p>
          </article>
        );
      })}
    </section>
  );
}
