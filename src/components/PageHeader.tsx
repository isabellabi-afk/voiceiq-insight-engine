import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground lg:text-[40px] lg:leading-[1.1]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
