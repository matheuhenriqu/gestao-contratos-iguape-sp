import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Contrato } from '../../types/contrato';
import { formatNumeroInteiro } from '../../utils/format';
import { ChartShell } from './ChartShell';
import { statusColors, tooltipStyle } from './chartConfig';

type ChartStatusProps = {
  contratos: Contrato[];
  onSelectStatus: (status: 'ativo' | 'vence_hoje' | 'vencido' | 'sem_status') => void;
};

export function ChartStatus({ contratos, onSelectStatus }: ChartStatusProps) {
  const data = [
    {
      key: 'ativo',
      label: 'Ativos',
      value: contratos.filter((contrato) => contrato.statusNormalizado === 'ativo').length,
      color: statusColors.ativo,
    },
    {
      key: 'vence_hoje',
      label: 'Vence hoje',
      value: contratos.filter((contrato) => contrato.statusNormalizado === 'vence_hoje').length,
      color: statusColors.vence_hoje,
    },
    {
      key: 'vencido',
      label: 'Vencidos',
      value: contratos.filter((contrato) => contrato.statusNormalizado === 'vencido').length,
      color: statusColors.vencido,
    },
    {
      key: 'sem_status',
      label: 'Sem vencimento calculado',
      value: contratos.filter((contrato) => contrato.statusNormalizado === null).length,
      color: statusColors.sem_status,
    },
  ].filter((item) => item.value > 0);

  return (
    <ChartShell
      title="Contratos por status"
      subtitle="Distribuição consolidada pelo status calculado em runtime."
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_168px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="60%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
              onClick={(_, index) => {
                const item = data[index];
                if (item) {
                  onSelectStatus(item.key as 'ativo' | 'vence_hoje' | 'vencido' | 'sem_status');
                }
              }}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} cursor="pointer" />
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
              key={entry.key}
              type="button"
              onClick={() =>
                onSelectStatus(entry.key as 'ativo' | 'vence_hoje' | 'vencido' | 'sem_status')
              }
              className="focus-ring flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2.5 text-left transition hover:border-brand-600 hover:bg-primary-100/35"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true"
                />
                <span className="text-[13px] font-medium text-text">{entry.label}</span>
              </div>
              <span className="tabular-nums text-[13px] font-medium text-muted">
                {formatNumeroInteiro(entry.value)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </ChartShell>
  );
}
