import type { ReactNode } from 'react';

type SectionHeaderProps = {
  kicker: string;
  title: string;
  description?: string;
  trailing?: ReactNode;
};

export function SectionHeader({ kicker, title, description, trailing }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
      <div className="grid gap-1.5">
        <span className="section-kicker">{kicker}</span>
        <h2 className="text-2xl font-semibold tracking-tight text-text md:text-[26px] md:leading-[32px]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm text-text-muted md:text-base">{description}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
