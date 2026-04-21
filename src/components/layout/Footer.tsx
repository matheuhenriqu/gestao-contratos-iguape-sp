function formatBuildDate(value: string | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function Footer() {
  const buildDate = formatBuildDate(import.meta.env.VITE_BUILD_DATE as string | undefined);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-border bg-surface">
      <div className="app-shell">
        <div
          className="flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-text-subtle"
          style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}
        >
          <span>© {year} Prefeitura de Iguape/SP</span>
          <span className="tnum">Atualizado em {buildDate}</span>
        </div>
      </div>
    </footer>
  );
}
