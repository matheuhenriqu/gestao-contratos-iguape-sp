import type { ReactNode } from 'react';

type ChartShellProps = {
  title: string;
  children: ReactNode;
};

export function ChartShell({ title, children }: ChartShellProps) {
  return (
    <article
      className="surface-card card-interactive grid gap-3 p-4 md:p-5"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '320px' }}
    >
      <header className="flex items-center gap-3 border-b border-border-divider pb-3">
        <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-pill bg-primary-600" />
        <h3 className="truncate text-base font-semibold tracking-tight text-text md:text-[17px]">
          {title}
        </h3>
      </header>

      <div className="h-[220px] min-w-0 md:h-[260px]">{children}</div>
    </article>
  );
}
