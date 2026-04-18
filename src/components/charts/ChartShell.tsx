import type { ReactNode } from 'react';

type ChartShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function ChartShell({ title, subtitle, children }: ChartShellProps) {
  return (
    <article
      className="surface-card group grid gap-4 p-5 transition-shadow hover:shadow-raised md:p-6"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '320px' }}
    >
      <header className="grid gap-1.5 border-b border-border-divider pb-4">
        <span className="section-kicker">Painel analítico</span>
        <h3 className="text-lg font-semibold tracking-tight text-text">{title}</h3>
        <p className="text-sm text-text-muted">{subtitle}</p>
      </header>

      <div className="h-[220px] min-w-0 md:h-[260px]">{children}</div>
    </article>
  );
}
