import type { FaixaVencimento } from '../../types/contrato';
import type { Contrato } from '../../types/contrato';
import type { StatusFiltro } from '../../hooks/useFiltros';
import { ChartModalidade } from './ChartModalidade';
import { ChartStatus } from './ChartStatus';
import { ChartTopEmpresasContratos } from './ChartTopEmpresasContratos';
import { ChartTopEmpresasValor } from './ChartTopEmpresasValor';
import { ChartVencimentos } from './ChartVencimentos';

type ChartsSectionProps = {
  contratos: Contrato[];
  onSelectStatus: (status: StatusFiltro) => void;
  onSelectModalidade: (modalidade: string) => void;
  onSelectFaixa: (faixa: Exclude<FaixaVencimento, null>) => void;
  onSelectEmpresa: (empresa: string) => void;
};

export function ChartsSection({
  contratos,
  onSelectStatus,
  onSelectModalidade,
  onSelectFaixa,
  onSelectEmpresa,
}: ChartsSectionProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <ChartStatus contratos={contratos} onSelectStatus={onSelectStatus} />
      <ChartModalidade contratos={contratos} onSelectModalidade={onSelectModalidade} />
      <ChartVencimentos contratos={contratos} onSelectFaixa={onSelectFaixa} />
      <ChartTopEmpresasContratos contratos={contratos} onSelectEmpresa={onSelectEmpresa} />
      <ChartTopEmpresasValor contratos={contratos} onSelectEmpresa={onSelectEmpresa} />
    </section>
  );
}
