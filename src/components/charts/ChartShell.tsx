import type { ReactNode } from 'react';

type ChartShellProps = {
  title: string;
  subtitle: string;
  kicker?: string;
  hint?: string;
  children: ReactNode;
};

export function ChartShell({
  title,
  subtitle,
  kicker = 'Painel analítico',
  hint,
  children,
}: ChartShellProps) {
  return (
    <article
      className="surface-card card-interactive group grid gap-4 p-5 md:p-6"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '320px' }}
    >
      <header className="grid gap-2 border-b border-border-divider pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1.5">
            <span className="section-kicker">{kicker}</span>
            <h3 className="text-lg font-semibold tracking-tight text-text md:text-[19px]">
              {title}
            </h3>
          </div>
          {hint ? (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-pill border border-border bg-surface-2/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-text-subtle md:inline-flex">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-pill bg-primary-600" />
              {hint}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-text-muted">{subtitle}</p>
      </header>

      <div className="h-[220px] min-w-0 md:h-[260px]">{children}</div>
    </article>
  );
}
