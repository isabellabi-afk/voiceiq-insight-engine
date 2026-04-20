import { ReactNode } from "react";

interface GlassTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: ReactNode; color?: string; dataKey?: string }>;
  label?: ReactNode;
  formatter?: (value: any, name?: string) => ReactNode;
}

export function GlassTooltip({ active, payload, label, formatter }: GlassTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip">
      {label !== undefined && label !== "" && (
        <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          {p.color && (
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          )}
          {p.name && <span className="text-muted-foreground">{p.name}</span>}
          <span className="ml-auto font-semibold text-foreground">
            {formatter ? formatter(p.value, p.name) : (p.value as ReactNode)}
          </span>
        </div>
      ))}
    </div>
  );
}
