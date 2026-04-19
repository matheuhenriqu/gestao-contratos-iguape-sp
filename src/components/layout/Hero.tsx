import {
  AlertCircleIcon,
  CheckCircleIcon,
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
  ativos: number;
  vencidos: number;
  proximosDoVencimento: number;
};

type StatItemProps = {
  label: string;
  value: string;
  icon: typeof DatabaseIcon;
  accent: string;
  hint?: string;
};

function StatItem({ label, value, icon: Icon, accent, hint }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/15 ${accent}`}
      >
        <Icon className="h-[20px] w-[20px] text-white" />
      </span>
      <div className="min-w-0">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: 'rgba(255,255,255,.65)' }}
        >
          {label}
        </p>
        <p className="tnum truncate text-xl font-semibold tracking-tight text-text-inverse">
          {value}
        </p>
        {hint ? (
          <p className="tnum text-[11px]" style={{ color: 'rgba(255,255,255,.6)' }}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function Hero({
  totalContratos,
  valorTotal,
  ativos,
  vencidos,
  proximosDoVencimento,
}: HeroProps) {
  const base = Math.max(totalContratos, 1);
  const pctAtivos = (ativos / base) * 100;
  const pctProximos = (proximosDoVencimento / base) * 100;
  const pctVencidos = (vencidos / base) * 100;
  const pctOutros = Math.max(0, 100 - pctAtivos - pctProximos - pctVencidos);

  const legendItems = [
    { label: 'Ativos', value: ativos, color: 'var(--color-hero-ok)' },
    { label: 'Próximos 30d', value: proximosDoVencimento, color: 'var(--color-hero-warning)' },
    { label: 'Vencidos', value: vencidos, color: 'var(--color-hero-critical)' },
    {
      label: 'Outros',
      value: Math.max(0, totalContratos - ativos - proximosDoVencimento - vencidos),
      color: 'rgba(255,255,255,.3)',
    },
  ];

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
        <div className="grid gap-5 py-6 md:gap-7 md:py-9">
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
            <h2 className="text-2xl font-semibold tracking-tight text-text-inverse md:text-[32px] md:leading-[40px]">
              Acompanhamento dos contratos administrativos
            </h2>
            <p className="text-sm md:text-base" style={{ color: 'rgba(255,255,255,.78)' }}>
              Base oficial consolidada, com filtros, ordenação e painéis analíticos para a
              gestão do ciclo contratual da Prefeitura de Iguape/SP.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm md:p-5">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              <StatItem
                label="Contratos"
                value={formatNumeroInteiro(totalContratos)}
                icon={DatabaseIcon}
                accent="bg-white/10"
                hint="Base integral"
              />
              <StatItem
                label="Valor total"
                value={formatMoedaCompactaBRL(valorTotal)}
                icon={WalletIcon}
                accent="bg-[rgba(79,176,180,.25)]"
                hint="Consolidado"
              />
              <StatItem
                label="Próximos 30d"
                value={formatNumeroInteiro(proximosDoVencimento)}
                icon={ClockIcon}
                accent="bg-[rgba(198,144,80,.3)]"
                hint={`${pctProximos.toFixed(1).replace('.', ',')}% da base`}
              />
              <StatItem
                label="Vencidos"
                value={formatNumeroInteiro(vencidos)}
                icon={AlertCircleIcon}
                accent="bg-[rgba(180,35,24,.3)]"
                hint={`${pctVencidos.toFixed(1).replace('.', ',')}% da base`}
              />
            </div>

            <div className="grid gap-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <span
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: 'rgba(255,255,255,.75)' }}
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Distribuição por situação
                </span>
                <span
                  className="tnum text-[11px] font-medium"
                  style={{ color: 'rgba(255,255,255,.65)' }}
                >
                  {formatNumeroInteiro(totalContratos)} contratos
                </span>
              </div>

              <div
                className="flex h-2.5 w-full overflow-hidden rounded-pill bg-white/10"
                role="img"
                aria-label="Barra de proporção por situação"
              >
                <span
                  className="h-full"
                  style={{ width: `${pctAtivos}%`, background: 'var(--color-hero-ok)' }}
                />
                <span
                  className="h-full"
                  style={{ width: `${pctProximos}%`, background: 'var(--color-hero-warning)' }}
                />
                <span
                  className="h-full"
                  style={{ width: `${pctVencidos}%`, background: 'var(--color-hero-critical)' }}
                />
                <span
                  className="h-full"
                  style={{ width: `${pctOutros}%`, background: 'rgba(255,255,255,.25)' }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                {legendItems.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 text-[11px] font-medium"
                    style={{ color: 'rgba(255,255,255,.78)' }}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 rounded-pill"
                      style={{ background: item.color }}
                    />
                    <span>{item.label}</span>
                    <span className="tnum" style={{ color: 'rgba(255,255,255,.58)' }}>
                      {formatNumeroInteiro(item.value)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
