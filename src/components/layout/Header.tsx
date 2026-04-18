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
    <header className="sticky top-0 z-40">
      <a href="#main" className="skip-link">
        Pular para o conteúdo
      </a>

      <div
        className="border-b border-white/10"
        style={{
          background:
            'linear-gradient(180deg, var(--color-primary-800) 0%, var(--color-primary-700) 100%)',
          paddingTop: 'var(--safe-top)',
        }}
      >
        <div className="app-shell">
          <div className="flex h-[60px] items-center justify-between gap-3 md:h-[72px]">
            <div className="flex min-w-0 items-center gap-3 md:gap-4">
              <img
                src={logoIguape}
                alt="Brasão da Prefeitura de Iguape"
                className="h-9 w-auto shrink-0 object-contain md:h-11"
              />

              <div
                className="hidden shrink-0 sm:block"
                aria-hidden="true"
                style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,.18)' }}
              />

              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-[-0.01em] text-text-inverse">
                  Gestão de Contratos
                </h1>
                <p
                  className="hidden truncate text-sm font-medium uppercase tracking-[0.12em] sm:block min-[360px]:block"
                  style={{ color: 'rgba(255,255,255,.78)' }}
                >
                  Prefeitura de Iguape/SP
                </p>
              </div>
            </div>

            <div className="hidden text-right lg:block">
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,.65)' }}>
                Atualizado em {buildDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[3px] w-full bg-secondary-600" aria-hidden="true" />
    </header>
  );
}
