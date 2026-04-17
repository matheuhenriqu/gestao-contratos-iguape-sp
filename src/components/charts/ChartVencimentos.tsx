import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import type { Contrato } from '../../types/contrato';
import { formatFaixaVencimento, formatNumeroInteiro } from '../../utils/format';
import { ChartShell } from './ChartShell';
import { chartAxisColor, chartGridColor, faixaColors, tooltipStyle } from './chartConfig';

type ChartVencimentosProps = {
  contratos: Contrato[];
};

const ORDER = ['vencidos', 'vencem_hoje', 'ate_7', 'ate_30', 'ate_60', 'ate_90', 'acima_90'] as const;

export function ChartVencimentos({ contratos }: ChartVencimentosProps) {
  const data = ORDER.map((faixa) => ({
    key: faixa,
    label: formatFaixaVencimento(faixa),
    total: contratos.filter((contrato) => contrato.faixaVencimento === faixa).length,
    fill: faixaColors[faixa],
  }));

  return (
    <ChartShell
      title="Vencimentos por período"
      subtitle="Faixas oficiais calculadas em runtime conforme as regras do painel."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={chartGridColor} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: chartAxisColor, fontSize: 12 }}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={64}
          />
          <YAxis tick={{ fill: chartAxisColor, fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => formatNumeroInteiro(value)}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="total" radius={[10, 10, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
