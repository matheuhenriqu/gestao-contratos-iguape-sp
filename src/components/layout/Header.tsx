export function Header() {
  const logoIguape = `${import.meta.env.BASE_URL}logo-iguape.png`;

  return (
    <header className="sticky top-0 z-40 border-b border-primary-900/18 bg-brand-700 text-white shadow-soft">
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo
      </a>

      <div className="h-[calc(var(--header-height-mobile)+var(--safe-top))] pt-[var(--safe-top)] lg:h-[calc(var(--header-height)+var(--safe-top))]">
        <div className="mx-auto flex h-[var(--header-height-mobile)] max-w-[1600px] items-center gap-3 px-[max(16px,var(--safe-left))] pr-[max(16px,var(--safe-right))] lg:h-[var(--header-height)] lg:gap-4 lg:px-[max(24px,var(--safe-left))] lg:pr-[max(24px,var(--safe-right))]">
          <img
            src={logoIguape}
            alt="Brasão da Prefeitura de Iguape"
            className="h-9 w-auto shrink-0 object-contain lg:h-11"
          />

          <div className="h-9 w-px shrink-0 bg-white/20 lg:h-11" aria-hidden="true" />

          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-semibold leading-tight text-white">
              Gestão de Contratos
            </h1>
            <p className="hidden text-[13px] font-normal leading-tight text-white/80 sm:block">
              Prefeitura de Iguape/SP
            </p>
          </div>
        </div>
      </div>

      <div className="h-1 w-full bg-secondary-600" aria-hidden="true" />
    </header>
  );
}
