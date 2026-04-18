import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Contrato } from '../../types/contrato';
import { formatNumeroInteiro } from '../../utils/format';
import { ChartShell } from './ChartShell';
import { donutPalette, tooltipStyle } from './chartConfig';

type ChartStatusProps = {
  contratos: Contrato[];
  onSelectStatus: (status: 'vencido' | 'critico' | 'atencao' | 'ok' | 'sem_status') => void;
};

export function ChartStatus({ contratos, onSelectStatus }: ChartStatusProps) {
  const data = useMemo(() => {
    const total = contratos.length || 1;

    return [
      {
        key: 'vencido',
        label: 'Vencidos',
        value: contratos.filter((contrato) => contrato.statusNormalizado === 'vencido').length,
        color: donutPalette.vencido,
      },
      {
        key: 'critico',
        label: 'Críticos ≤ 7 dias',
        value: contratos.filter(
          (contrato) =>
            contrato.diasParaVencimento !== null &&
            contrato.diasParaVencimento >= 0 &&
            contrato.diasParaVencimento <= 7,
        ).length,
        color: donutPalette.critico,
      },
      {
        key: 'atencao',
        label: 'Atenção 8–30 dias',
        value: contratos.filter(
          (contrato) =>
            contrato.diasParaVencimento !== null &&
            contrato.diasParaVencimento >= 8 &&
            contrato.diasParaVencimento <= 30,
        ).length,
        color: donutPalette.atencao,
      },
      {
        key: 'ok',
        label: 'Ativos > 30 dias',
        value: contratos.filter(
          (contrato) =>
            contrato.statusNormalizado === 'ativo' &&
            (contrato.diasParaVencimento === null || contrato.diasParaVencimento > 30),
        ).length,
        color: donutPalette.ok,
      },
      {
        key: 'sem_status',
        label: 'Sem vencimento',
        value: contratos.filter((contrato) => contrato.statusNormalizado === null).length,
        color: donutPalette.neutro,
      },
    ]
      .filter((item) => item.value > 0)
      .map((item) => ({ ...item, percentage: Math.round((item.value / total) * 100) }));
  }, [contratos]);

  return (
    <ChartShell
      title="Contratos por status"
      subtitle="Leitura rápida da carteira por atraso, urgência e registros sem vencimento."
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_184px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="64%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="var(--color-surface)"
              strokeWidth={2}
              isAnimationActive
              onClick={(_, index) => {
                const item = data[index];
                if (item) {
                  onSelectStatus(item.key as 'vencido' | 'critico' | 'atencao' | 'ok' | 'sem_status');
                }
              }}
            >
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} cursor="pointer" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatNumeroInteiro(value)}
              contentStyle={tooltipStyle}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="grid content-center gap-2">
          {data.map((entry) => (
            <button
              key={entry.label}
              type="button"
              onClick={() =>
                onSelectStatus(entry.key as 'vencido' | 'critico' | 'atencao' | 'ok' | 'sem_status')
              }
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-left transition hover:border-primary-200"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-pill" style={{ backgroundColor: entry.color }} />
                <span className="truncate text-sm text-text">{entry.label}</span>
              </div>
              <div className="tnum text-right text-sm text-text-muted">
                {formatNumeroInteiro(entry.value)} · {entry.percentage}%
              </div>
            </button>
          ))}
        </div>
      </div>
    </ChartShell>
  );
}
