import { formatNumeroInteiro } from '../../utils/format';

type HeaderProps = {
  totalContratos: number;
  totalResultados: number;
  filtrosAtivos: number;
};

export function Header({ totalContratos, totalResultados, filtrosAtivos }: HeaderProps) {
  const logoIguape = `${import.meta.env.BASE_URL}logo-iguape.png`;

  return (
    <header className="relative overflow-hidden rounded-[30px] border border-iguape-800/10 bg-gradient-to-r from-iguape-800 via-iguape-700 to-iguape-500 text-white shadow-panel">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_50%)] lg:block" />
      <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_45%)]" />

      <div className="relative flex flex-col gap-6 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/96 p-3 shadow-lg shadow-iguape-950/20 ring-1 ring-white/50 sm:h-24 sm:w-24">
            <img
              src={logoIguape}
              alt="Brasão da Prefeitura de Iguape"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/72">
              Painel Administrativo
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
              Gestão de Contratos
            </h1>
            <p className="mt-1 text-sm font-medium text-sky-100 sm:text-base">
              Prefeitura de Iguape/SP
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-[420px] lg:min-w-[360px]">
          <div className="rounded-3xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/65">
              Base oficial
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
              {formatNumeroInteiro(totalContratos)}
            </p>
            <p className="mt-1 text-sm text-white/72">contratos consolidados no acervo</p>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/65">
              Consulta atual
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
              {formatNumeroInteiro(totalResultados)}
            </p>
            <p className="mt-1 text-sm text-white/72">
              {filtrosAtivos > 0
                ? `${formatNumeroInteiro(filtrosAtivos)} filtro${filtrosAtivos > 1 ? 's' : ''} aplicado${filtrosAtivos > 1 ? 's' : ''}`
                : 'visão completa da base'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
