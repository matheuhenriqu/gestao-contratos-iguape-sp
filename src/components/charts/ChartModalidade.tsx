import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import type { Contrato } from '../../types/contrato';
import { formatNumeroInteiro, textoOuNaoInformado } from '../../utils/format';
import { ChartShell } from './ChartShell';
import { chartAxisColor, chartGridColor, chartPalette, tooltipStyle, truncateLabel } from './chartConfig';

type ChartModalidadeProps = {
  contratos: Contrato[];
};

export function ChartModalidade({ contratos }: ChartModalidadeProps) {
  const data = Object.values(
    contratos.reduce<Record<string, { label: string; total: number }>>((accumulator, contrato) => {
      const label = textoOuNaoInformado(contrato.modalidade);

      if (!accumulator[label]) {
        accumulator[label] = { label, total: 0 };
      }

      accumulator[label].total += 1;
      return accumulator;
    }, {}),
  )
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'pt-BR'))
    .slice(0, 8)
    .map((item, index) => ({
      ...item,
      fill: chartPalette[index % chartPalette.length],
      shortLabel: truncateLabel(item.label, 24),
    }));

  return (
    <ChartShell
      title="Contratos por modalidade"
      subtitle="Modalidades com maior presença na base filtrada."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={chartGridColor} horizontal={false} />
          <XAxis type="number" tick={{ fill: chartAxisColor, fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="shortLabel"
            width={110}
            tick={{ fill: chartAxisColor, fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatNumeroInteiro(value)}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="total" radius={[0, 10, 10, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
