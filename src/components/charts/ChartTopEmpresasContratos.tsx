import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Contrato } from '../../types/contrato';
import { formatNumeroInteiro, textoOuNaoInformado } from '../../utils/format';
import { ChartShell } from './ChartShell';
import { chartAxisColor, chartGridColor, chartPalette, tooltipStyle, truncateLabel } from './chartConfig';

type ChartTopEmpresasContratosProps = {
  contratos: Contrato[];
  onSelectEmpresa: (empresa: string) => void;
};

export function ChartTopEmpresasContratos({
  contratos,
  onSelectEmpresa,
}: ChartTopEmpresasContratosProps) {
  const data = Object.values(
    contratos.reduce<Record<string, { label: string; total: number }>>((accumulator, contrato) => {
      const label = textoOuNaoInformado(contrato.empresaContratada);
      accumulator[label] ??= { label, total: 0 };
      accumulator[label].total += 1;
      return accumulator;
    }, {}),
  )
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'pt-BR'))
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      shortLabel: truncateLabel(item.label, 24),
      fill: chartPalette[index % chartPalette.length],
    }));

  return (
    <ChartShell
      title="Top 10 empresas com mais contratos"
      subtitle="Ranking por quantidade de contratos na consulta atual."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: chartAxisColor, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortLabel"
            width={120}
            tick={{ fill: chartAxisColor, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => formatNumeroInteiro(value)}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
            contentStyle={tooltipStyle}
          />
          <Bar
            dataKey="total"
            radius={[0, 6, 6, 0]}
            fill={chartPalette[1]}
            onClick={(_, index) => {
              const item = data[index];
              if (item) {
                onSelectEmpresa(item.label);
              }
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
