import type { Contrato } from '../../types/contrato';
import type { OrdenacaoCampo } from '../../hooks/useFiltros';
import {
  formatDataBR,
  formatDiasParaVencimento,
  formatMoedaBRL,
  formatNumeroInteiro,
  textoOuNaoInformado,
} from '../../utils/format';
import {
  getCriticidadeClasses,
  getStatusClasses,
  getStatusLabel,
} from '../shared/contratoAppearance';
import { Pagination } from '../shared/Pagination';

type ContratosTableProps = {
  contratos: Contrato[];
  totalResultados: number;
  paginaAtual: number;
  totalPaginas: number;
  itensPorPagina: number;
  ordenacao: {
    campo: OrdenacaoCampo;
    direcao: 'asc' | 'desc';
  };
  onSort: (campo: OrdenacaoCampo) => void;
  onOpenDetail: (contrato: Contrato) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number) => void;
};

const COLUMNS: Array<{ key: OrdenacaoCampo; label: string; align?: 'left' | 'right' }> = [
  { key: 'modalidade', label: 'Modalidade' },
  { key: 'numeroModalidade', label: 'Nº Modalidade' },
  { key: 'objeto', label: 'Objeto' },
  { key: 'processo', label: 'Processo' },
  { key: 'contrato', label: 'Contrato' },
  { key: 'empresaContratada', label: 'Empresa Contratada' },
  { key: 'valor', label: 'Valor', align: 'right' },
  { key: 'dataInicio', label: 'Data Início' },
  { key: 'dataVencimento', label: 'Data Vencimento' },
  { key: 'diasParaVencimento', label: 'Dias p/ Vencimento', align: 'right' },
  { key: 'statusNormalizado', label: 'Status' },
  { key: 'gestor', label: 'Gestor' },
  { key: 'fiscal', label: 'Fiscal' },
] as const;

function SortButton({
  label,
  field,
  align = 'left',
  ordenacao,
  onSort,
}: {
  label: string;
  field: OrdenacaoCampo;
  align?: 'left' | 'right' | undefined;
  ordenacao: ContratosTableProps['ordenacao'];
  onSort: (campo: OrdenacaoCampo) => void;
}) {
  const active = ordenacao.campo === field;
  const arrow = active ? (ordenacao.direcao === 'asc' ? '↑' : '↓') : '↕';

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 transition hover:text-iguape-700 ${
        align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
      }`}
    >
      <span>{label}</span>
      <span className={`text-[0.68rem] ${active ? 'text-iguape-700' : 'text-slate-400'}`}>{arrow}</span>
    </button>
  );
}

export function ContratosTable({
  contratos,
  totalResultados,
  paginaAtual,
  totalPaginas,
  itensPorPagina,
  ordenacao,
  onSort,
  onOpenDetail,
  onPageChange,
  onPageSizeChange,
}: ContratosTableProps) {
  const inicio = totalResultados === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalResultados);

  return (
    <section className="hidden xl:block">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white">
        <div className="border-b border-slate-200/80 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Mostrando {formatNumeroInteiro(inicio)} a {formatNumeroInteiro(fim)} de{' '}
                {formatNumeroInteiro(totalResultados)} contratos
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Clique em uma linha para abrir o detalhe completo do contrato.
              </p>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-500">
              <span>Itens por página</span>
              <select
                value={itensPorPagina}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-iguape-400 focus:ring-4 focus:ring-iguape-100"
              >
                {[10, 12, 20, 30].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[6.5%]" />
              <col className="w-[15%]" />
              <col className="w-[5.5%]" />
              <col className="w-[5.5%]" />
              <col className="w-[10.5%]" />
              <col className="w-[8%]" />
              <col className="w-[6.5%]" />
              <col className="w-[6.5%]" />
              <col className="w-[6.5%]" />
              <col className="w-[6.5%]" />
              <col className="w-[7.5%]" />
              <col className="w-[7.5%]" />
            </colgroup>
            <thead className="bg-white">
              <tr className="border-b border-slate-200/80">
                {COLUMNS.map((column) => (
                  <th key={column.key} className="px-3 py-3">
                    <SortButton
                      label={column.label}
                      field={column.key}
                      align={column.align}
                      ordenacao={ordenacao}
                      onSort={onSort}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-[0.8rem] text-slate-700">
              {contratos.map((contrato) => (
                <tr
                  key={contrato.id}
                  tabIndex={0}
                  onClick={() => onOpenDetail(contrato)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenDetail(contrato);
                    }
                  }}
                  className="cursor-pointer bg-white transition hover:bg-iguape-50/60 focus-visible:bg-iguape-50/70 focus-visible:outline-none"
                >
                  <td className="px-3 py-3 align-top" title={textoOuNaoInformado(contrato.modalidade)}>
                    <span className="block truncate font-medium">{textoOuNaoInformado(contrato.modalidade)}</span>
                  </td>
                  <td className="px-3 py-3 align-top" title={textoOuNaoInformado(contrato.numeroModalidade)}>
                    <span className="block truncate">{textoOuNaoInformado(contrato.numeroModalidade)}</span>
                  </td>
                  <td className="px-3 py-3 align-top" title={textoOuNaoInformado(contrato.objeto)}>
                    <span className="block truncate font-semibold text-slate-800">
                      {textoOuNaoInformado(contrato.objeto)}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top" title={textoOuNaoInformado(contrato.processo)}>
                    <span className="block truncate">{textoOuNaoInformado(contrato.processo)}</span>
                  </td>
                  <td className="px-3 py-3 align-top" title={textoOuNaoInformado(contrato.contrato)}>
                    <span className="block truncate">{textoOuNaoInformado(contrato.contrato)}</span>
                  </td>
                  <td
                    className="px-3 py-3 align-top"
                    title={textoOuNaoInformado(contrato.empresaContratada)}
                  >
                    <span className="block truncate">{textoOuNaoInformado(contrato.empresaContratada)}</span>
                  </td>
                  <td className="px-3 py-3 text-right align-top font-semibold text-slate-800">
                    {formatMoedaBRL(contrato.valor)}
                  </td>
                  <td className="px-3 py-3 align-top">{formatDataBR(contrato.dataInicio)}</td>
                  <td className="px-3 py-3 align-top">{formatDataBR(contrato.dataVencimento)}</td>
                  <td
                    className={`px-3 py-3 text-right align-top font-semibold ${getCriticidadeClasses(
                      contrato.criticidade,
                    )}`}
                  >
                    {formatDiasParaVencimento(contrato.diasParaVencimento)}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span
                      className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold ${getStatusClasses(
                        contrato,
                      )}`}
                    >
                      {getStatusLabel(contrato)}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top" title={textoOuNaoInformado(contrato.gestor)}>
                    <span className="block truncate">{textoOuNaoInformado(contrato.gestor)}</span>
                  </td>
                  <td className="px-3 py-3 align-top" title={textoOuNaoInformado(contrato.fiscal)}>
                    <span className="block truncate">{textoOuNaoInformado(contrato.fiscal)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end border-t border-slate-200/80 px-5 py-4">
          <Pagination currentPage={paginaAtual} totalPages={totalPaginas} onPageChange={onPageChange} />
        </div>
      </div>
    </section>
  );
}
