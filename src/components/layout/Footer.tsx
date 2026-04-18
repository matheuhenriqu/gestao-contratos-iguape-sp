function formatBuildDate(value: string | undefined): string {
  if (!value) {
    return 'Não disponível';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Não disponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function Footer() {
  const buildDate = formatBuildDate(import.meta.env.VITE_BUILD_DATE as string | undefined);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-border bg-surface">
      <div className="app-shell">
        <div
          className="grid gap-4 py-6 text-sm text-text-muted md:flex md:items-center md:justify-between md:py-8"
          style={{ paddingBottom: 'calc(24px + var(--safe-bottom))' }}
        >
          <div className="grid gap-1">
            <p className="font-semibold text-text">
              Prefeitura Municipal de Iguape/SP
            </p>
            <p className="text-sm text-text-muted">
              Painel institucional de gestão de contratos administrativos.
            </p>
          </div>

          <div className="grid gap-1 md:text-right">
            <p className="text-xs uppercase tracking-[0.1em] text-text-subtle">
              Atualização
            </p>
            <p className="tnum text-sm font-medium text-text">{buildDate}</p>
          </div>
        </div>

        <div className="border-t border-border-divider py-4 text-center text-xs text-text-subtle">
          © {year} Prefeitura de Iguape · Dados de origem administrativa, apresentados para consulta pública.
        </div>
      </div>
    </footer>
  );
}
