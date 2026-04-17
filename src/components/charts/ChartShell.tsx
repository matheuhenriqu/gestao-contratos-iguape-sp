import type { ReactNode } from 'react';

type ChartShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function ChartShell({ title, subtitle, children }: ChartShellProps) {
  return (
    <article className="rounded-[30px] border border-white/70 bg-white/92 p-4 shadow-panel ring-1 ring-iguape-100/80 backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-iguape-700">
            Análise
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="h-[290px] min-w-0 sm:h-[320px]">{children}</div>
    </article>
  );
}
