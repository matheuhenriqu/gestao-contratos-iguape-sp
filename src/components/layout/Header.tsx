function formatBuildDate(value: string | undefined): string {
  if (!value) {
    return 'Não disponível';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Não disponível';
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function Header() {
  const logoIguape = `${import.meta.env.BASE_URL}logo-iguape.png`;
  const buildDate = formatBuildDate(import.meta.env.VITE_BUILD_DATE as string | undefined);

  return (
    <header className="sticky top-0 z-40 shadow-header">
      <a href="#main" className="skip-link">
        Pular para o conteúdo
      </a>

      <div
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 45%, var(--color-primary-700) 100%)',
          paddingTop: 'var(--safe-top)',
          borderBottom: '1px solid var(--color-on-primary-surface-10)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 200px at 100% 0%, rgba(79, 176, 180, 0.22), transparent 60%), radial-gradient(500px 180px at 0% 100%, rgba(198, 144, 80, 0.12), transparent 60%)',
          }}
        />

        <div className="app-shell relative">
          <div className="flex h-[64px] items-center justify-between gap-3 md:h-[80px]">
            <div className="flex min-w-0 items-center gap-3 md:gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg p-1.5 backdrop-blur-sm md:h-12 md:w-12 md:p-2"
                style={{
                  background: 'var(--color-on-primary-surface-10)',
                  boxShadow: 'inset 0 0 0 1px var(--color-on-primary-surface-15)',
                }}
              >
                <img
                  src={logoIguape}
                  alt="Brasão da Prefeitura de Iguape"
                  className="h-full w-full object-contain"
                />
              </div>

              <div
                className="hidden shrink-0 sm:block"
                aria-hidden="true"
                style={{ width: '1px', height: '36px', background: 'var(--color-on-primary-surface-20)' }}
              />

              <div className="min-w-0">
                <p
                  className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] sm:block"
                  style={{ color: 'var(--color-on-primary-75)' }}
                >
                  Prefeitura de Iguape/SP
                </p>
                <h1 className="truncate text-xl font-semibold tracking-[-0.01em] text-text-inverse md:text-2xl">
                  Gestão de Contratos
                </h1>
              </div>
            </div>

            <div className="hidden lg:block">
              <div
                className="inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
                style={{
                  background: 'var(--color-on-primary-surface-10)',
                  border: '1px solid var(--color-on-primary-surface-15)',
                  color: 'var(--color-on-primary-90)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-pill bg-secondary-500"
                />
                <span>Atualizado em {buildDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="h-[3px] w-full"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, var(--color-secondary-600) 0%, var(--color-primary-600) 50%, var(--color-accent-600) 100%)',
        }}
      />
    </header>
  );
}
