import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Contrato } from '../../types/contrato';
import { formatNumeroInteiro, textoOuNaoInformado } from '../../utils/format';
import { ChartShell } from './ChartShell';
import { chartAxisColor, chartGridColor, tooltipStyle, truncateLabel } from './chartConfig';

type ChartTopEmpresasContratosProps = {
  contratos: Contrato[];
  onSelectEmpresa: (empresa: string) => void;
};

export function ChartTopEmpresasContratos({
  contratos,
  onSelectEmpresa,
}: ChartTopEmpresasContratosProps) {
  const data = useMemo(
    () =>
      Object.values(
        contratos.reduce<Record<string, { label: string; total: number }>>((accumulator, contrato) => {
          const label = textoOuNaoInformado(contrato.empresaContratada);
          accumulator[label] ??= { label, total: 0 };
          accumulator[label].total += 1;
          return accumulator;
        }, {}),
      )
        .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'pt-BR'))
        .slice(0, 10)
        .map((item) => ({
          ...item,
          shortLabel: truncateLabel(item.label, 26),
        })),
    [contratos],
  );

  return (
    <ChartShell title="Top 10 empresas por contratos">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: chartAxisColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortLabel"
            width={144}
            tick={{ fill: chartAxisColor, fontSize: 11 }}
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
            fill="var(--color-secondary-600)"
            radius={[0, 8, 8, 0]}
            barSize={14}
            cursor="pointer"
            onClick={(_, index) => {
              const item = data[index];
              if (item) {
                onSelectEmpresa(item.label);
              }
            }}
          >
            <LabelList
              dataKey="total"
              position="right"
              offset={8}
              formatter={(value: number) => formatNumeroInteiro(value)}
              style={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
