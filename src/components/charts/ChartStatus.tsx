import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Contrato } from '../../types/contrato';
import { formatNumeroInteiro } from '../../utils/format';
import { ChartShell } from './ChartShell';
import { statusColors, tooltipStyle } from './chartConfig';

type ChartStatusProps = {
  contratos: Contrato[];
};

export function ChartStatus({ contratos }: ChartStatusProps) {
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
      label: 'Sem status calculado',
      value: contratos.filter((contrato) => contrato.statusNormalizado === null).length,
      color: statusColors.sem_status,
    },
  ].filter((item) => item.value > 0);

  return (
    <ChartShell
      title="Contratos por status"
      subtitle="Distribuição calculada com base no vencimento vigente."
    >
      <div className="grid h-full gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              stroke="rgba(255,255,255,0.65)"
              strokeWidth={3}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
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
            <div
              key={entry.key}
              className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{entry.label}</p>
                  <p className="text-sm text-slate-500">{formatNumeroInteiro(entry.value)} contratos</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartShell>
  );
}
