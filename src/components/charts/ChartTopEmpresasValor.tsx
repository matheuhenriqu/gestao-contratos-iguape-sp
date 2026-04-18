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
import { formatMoedaBRL, textoOuNaoInformado } from '../../utils/format';
import { ChartShell } from './ChartShell';
import {
  chartAxisColor,
  chartGridColor,
  formatAxisCurrency,
  tooltipStyle,
  truncateLabel,
} from './chartConfig';

type ChartTopEmpresasValorProps = {
  contratos: Contrato[];
  onSelectEmpresa: (empresa: string) => void;
};

export function ChartTopEmpresasValor({ contratos, onSelectEmpresa }: ChartTopEmpresasValorProps) {
  const data = useMemo(
    () =>
      Object.values(
        contratos.reduce<Record<string, { label: string; total: number }>>((accumulator, contrato) => {
          const label = textoOuNaoInformado(contrato.empresaContratada);
          accumulator[label] ??= { label, total: 0 };
          accumulator[label].total += contrato.valor ?? 0;
          return accumulator;
        }, {}),
      )
        .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'pt-BR'))
        .slice(0, 10)
        .map((item) => ({
          ...item,
          shortLabel: truncateLabel(item.label, 24),
        })),
    [contratos],
  );

  return (
    <ChartShell
      title="Top 10 empresas por valor contratado"
      subtitle="Volume financeiro acumulado por empresa no recorte atual."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: chartAxisColor, fontSize: 11 }}
            tickFormatter={formatAxisCurrency}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortLabel"
            width={142}
            tick={{ fill: chartAxisColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => formatMoedaBRL(value)}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
            contentStyle={tooltipStyle}
          />
          <Bar
            dataKey="total"
            fill="var(--color-primary-700)"
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
              formatter={(value: number) => formatAxisCurrency(value)}
              style={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
