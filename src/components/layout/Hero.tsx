import {
  AlertCircleIcon,
  ClockIcon,
  DatabaseIcon,
  WalletIcon,
} from '../shared/icons';
import {
  formatMoedaCompactaBRL,
  formatNumeroInteiro,
} from '../../utils/format';

type HeroProps = {
  totalContratos: number;
  valorTotal: number;
  vencidos: number;
  proximosDoVencimento: number;
};

type StatItemProps = {
  label: string;
  value: string;
  icon: typeof DatabaseIcon;
  accent: string;
};

function StatItem({ label, value, icon: Icon, accent }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/15 ${accent}`}
      >
        <Icon className="h-[18px] w-[18px] text-white" />
      </span>
      <div className="min-w-0">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: 'rgba(255,255,255,.65)' }}
        >
          {label}
        </p>
        <p className="tnum truncate text-lg font-semibold tracking-tight text-text-inverse">
          {value}
        </p>
      </div>
    </div>
  );
}

export function Hero({
  totalContratos,
  valorTotal,
  vencidos,
  proximosDoVencimento,
}: HeroProps) {
  return (
    <section
      aria-label="Resumo da base"
      className="relative overflow-hidden border-b border-white/10"
      style={{
        background:
          'linear-gradient(180deg, var(--color-primary-800) 0%, var(--color-primary-900) 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(500px 200px at 90% 0%, rgba(79, 176, 180, 0.18), transparent 60%), radial-gradient(400px 180px at 10% 100%, rgba(198, 144, 80, 0.1), transparent 60%)',
        }}
      />

      <div className="app-shell relative">
        <div className="grid gap-5 py-6 md:gap-6 md:py-8">
          <div className="grid max-w-3xl gap-2">
            <span
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: 'rgba(255,255,255,.75)' }}
            >
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-pill bg-secondary-500"
              />
              Transparência em dados
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-text-inverse md:text-3xl">
              Acompanhamento dos contratos administrativos
            </h2>
            <p className="text-sm md:text-base" style={{ color: 'rgba(255,255,255,.78)' }}>
              Base oficial consolidada, com filtros, ordenação e painéis analíticos para a
              gestão do ciclo contratual da Prefeitura de Iguape/SP.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm md:grid-cols-4 md:gap-4 md:p-5">
            <StatItem
              label="Contratos"
              value={formatNumeroInteiro(totalContratos)}
              icon={DatabaseIcon}
              accent="bg-white/10"
            />
            <StatItem
              label="Valor total"
              value={formatMoedaCompactaBRL(valorTotal)}
              icon={WalletIcon}
              accent="bg-[rgba(79,176,180,.25)]"
            />
            <StatItem
              label="Próximos 30d"
              value={formatNumeroInteiro(proximosDoVencimento)}
              icon={ClockIcon}
              accent="bg-[rgba(198,144,80,.3)]"
            />
            <StatItem
              label="Vencidos"
              value={formatNumeroInteiro(vencidos)}
              icon={AlertCircleIcon}
              accent="bg-[rgba(180,35,24,.3)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
