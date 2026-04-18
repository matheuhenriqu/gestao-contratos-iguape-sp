import type { ReactNode } from 'react';

type ChartShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function ChartShell({ title, subtitle, children }: ChartShellProps) {
  return (
    <article
      className="surface-card grid gap-4 p-4 lg:p-5"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '320px' }}
    >
      <div className="grid gap-1">
        <p className="field-label">Análise</p>
        <h3 className="text-[18px] font-semibold leading-[1.25] text-text">{title}</h3>
        <p className="text-[13px] leading-5 text-muted">{subtitle}</p>
      </div>

      <div className="h-[240px] min-w-0 lg:h-[280px]">{children}</div>
    </article>
  );
}
