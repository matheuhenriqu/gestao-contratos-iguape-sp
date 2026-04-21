import type { ReactNode } from 'react';

type SectionHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  trailing?: ReactNode;
  tone?: 'default' | 'danger';
};

export function SectionHeader({ kicker, title, description, trailing, tone = 'default' }: SectionHeaderProps) {
  const accentColor = tone === 'danger' ? 'bg-status-critical' : 'bg-primary-600';

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden="true" className={`h-7 w-1 shrink-0 rounded-pill ${accentColor}`} />
        <div className="grid min-w-0 gap-0.5">
          {kicker ? <span className="section-kicker">{kicker}</span> : null}
          <h2 className="truncate text-xl font-semibold tracking-tight text-text md:text-[22px] md:leading-tight">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm text-text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
