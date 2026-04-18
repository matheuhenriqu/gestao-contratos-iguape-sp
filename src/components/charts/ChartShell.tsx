import type { ReactNode } from 'react';

type ChartShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function ChartShell({ title, subtitle, children }: ChartShellProps) {
  return (
    <article
      className="surface-card grid gap-4 p-4 md:p-5"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '320px' }}
    >
      <div className="grid gap-1">
        <span className="section-kicker">Painel analítico</span>
        <h3 className="text-md font-semibold text-text">{title}</h3>
        <p className="text-sm text-text-muted">{subtitle}</p>
      </div>

      <div className="h-[220px] min-w-0 md:h-[260px]">{children}</div>
    </article>
  );
}
