import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Contrato } from '../../types/contrato';
import { formatFaixaVencimento, formatNumeroInteiro } from '../../utils/format';
import { ChartShell } from './ChartShell';
import { chartAxisColor, chartGridColor, faixaColors, tooltipStyle } from './chartConfig';

type ChartVencimentosProps = {
  contratos: Contrato[];
  onSelectFaixa: (
    faixa: 'vencidos' | 'vencem_hoje' | 'ate_7' | 'ate_30' | 'ate_60' | 'ate_90' | 'acima_90',
  ) => void;
};

const ORDER = ['vencidos', 'vencem_hoje', 'ate_7', 'ate_30', 'ate_60', 'ate_90', 'acima_90'] as const;

export function ChartVencimentos({ contratos, onSelectFaixa }: ChartVencimentosProps) {
  const data = useMemo(
    () =>
      ORDER.map((faixa) => ({
        key: faixa,
        label: formatFaixaVencimento(faixa),
        total: contratos.filter((contrato) => contrato.faixaVencimento === faixa).length,
        fill: faixaColors[faixa],
      })),
    [contratos],
  );

  return (
    <ChartShell
      title="Vencimentos por período"
      subtitle="Distribuição cronológica nas faixas oficiais de vencimento."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 12, left: 0 }}>
          <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: chartAxisColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={58}
          />
          <YAxis tick={{ fill: chartAxisColor, fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value: number) => formatNumeroInteiro(value)} contentStyle={tooltipStyle} />
          <Bar
            dataKey="total"
            radius={[8, 8, 0, 0]}
            cursor="pointer"
            onClick={(_, index) => {
              const item = data[index];
              if (item) {
                onSelectFaixa(item.key);
              }
            }}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} cursor="pointer" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
