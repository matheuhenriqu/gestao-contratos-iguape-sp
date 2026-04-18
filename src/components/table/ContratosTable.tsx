import { Fragment } from 'react';
import type { Contrato } from '../../types/contrato';
import type { OrdenacaoCampo } from '../../hooks/useFiltros';
import {
  formatDataOuTraco,
  formatDiasParaVencimento,
  formatMoedaBRL,
  formatNumeroInteiro,
  textoOuNaoInformado,
} from '../../utils/format';
import {
  getCriticidadeTextClass,
  getStatusClasses,
  getStatusLabel,
} from '../shared/contratoAppearance';
import { Pagination } from '../shared/Pagination';
import { ArrowUpDownIcon } from '../shared/icons';
import { groupContratosByModalidade } from '../shared/groupContratosByModalidade';

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
  compactMode: boolean;
  onToggleCompactMode: () => void;
  onSort: (campo: OrdenacaoCampo) => void;
  onOpenDetail: (contrato: Contrato) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number) => void;
};

const COLUMNS: Array<{
  key: OrdenacaoCampo;
  label: string;
  minWidth: string;
  align?: 'left' | 'right';
}> = [
  { key: 'modalidade', label: 'Modalidade', minWidth: '150px' },
  { key: 'numeroModalidade', label: 'Nº Modalidade', minWidth: '130px' },
  { key: 'objeto', label: 'Objeto', minWidth: '280px' },
  { key: 'processo', label: 'Processo', minWidth: '130px' },
  { key: 'contrato', label: 'Contrato', minWidth: '130px' },
  { key: 'empresaContratada', label: 'Empresa Contratada', minWidth: '220px' },
  { key: 'valor', label: 'Valor', minWidth: '160px', align: 'right' },
  { key: 'dataInicio', label: 'Data Início', minWidth: '120px' },
  { key: 'dataVencimento', label: 'Data Vencimento', minWidth: '140px' },
  { key: 'diasParaVencimento', label: 'Dias p/ Vencimento', minWidth: '160px', align: 'right' },
  { key: 'statusNormalizado', label: 'Status', minWidth: '130px' },
  { key: 'gestor', label: 'Gestor', minWidth: '170px' },
  { key: 'fiscal', label: 'Fiscal', minWidth: '170px' },
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
  align?: 'left' | 'right';
  ordenacao: ContratosTableProps['ordenacao'];
  onSort: (campo: OrdenacaoCampo) => void;
}) {
  const active = ordenacao.campo === field;
  const direction = active ? (ordenacao.direcao === 'asc' ? '↑' : '↓') : null;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`focus-ring inline-flex w-full items-center gap-2 text-[12px] font-medium uppercase tracking-[0.12em] text-subtle transition hover:text-brand-700 ${
        align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
      }`}
    >
      <span>{label}</span>
      {direction ? (
        <span className="text-brand-700">{direction}</span>
      ) : (
        <ArrowUpDownIcon className="h-3.5 w-3.5 text-subtle" />
      )}
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
  compactMode,
  onToggleCompactMode,
  onSort,
  onOpenDetail,
  onPageChange,
  onPageSizeChange,
}: ContratosTableProps) {
  const inicio = totalResultados === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalResultados);
  const groups = groupContratosByModalidade(contratos);
  const rowPadding = compactMode ? 'py-2.5' : 'py-3.5';

  return (
    <section className="hidden md:block">
      <div className="surface-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div>
            <p className="text-[16px] font-semibold text-text">Consulta principal dos contratos</p>
            <p className="text-[13px] text-muted">
              Mostrando {formatNumeroInteiro(inicio)} a {formatNumeroInteiro(fim)} de{' '}
              {formatNumeroInteiro(totalResultados)} contratos filtrados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onToggleCompactMode} className="button-secondary min-h-11 px-4">
              {compactMode ? 'Modo confortável' : 'Modo compacto'}
            </button>

            <label className="flex items-center gap-2 text-[13px] font-medium text-muted">
              <span>Por página</span>
              <select
                value={itensPorPagina}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className="field-base min-w-[88px]"
              >
                {[25, 50, 100].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1880px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-surface">
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className="border-b border-border bg-surface px-4 py-3"
                    style={{ minWidth: column.minWidth }}
                    scope="col"
                  >
                    <SortButton
                      label={column.label}
                      field={column.key}
                      ordenacao={ordenacao}
                      onSort={onSort}
                      {...(column.align ? { align: column.align } : {})}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <Fragment key={group.key}>
                  <tr>
                    <td colSpan={COLUMNS.length} className="border-b border-border bg-surface-2 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="field-label">Modalidade</p>
                          <p className="truncate text-[14px] font-semibold text-text">{group.label}</p>
                        </div>
                        <p className="text-[13px] font-medium text-muted">
                          {formatNumeroInteiro(group.quantidade)} contrato{group.quantidade === 1 ? '' : 's'}
                        </p>
                      </div>
                    </td>
                  </tr>

                  {group.contratos.map((contrato, index) => (
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
                      className={`cursor-pointer transition hover:bg-primary-100/40 focus-visible:bg-primary-100/40 ${
                        index % 2 === 0 ? 'bg-surface' : 'bg-surface-2/45'
                      }`}
                    >
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span className="block truncate text-[14px] text-text" title={textoOuNaoInformado(contrato.modalidade)}>
                          {textoOuNaoInformado(contrato.modalidade)}
                        </span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span className="block truncate text-[14px] text-text" title={textoOuNaoInformado(contrato.numeroModalidade)}>
                          {textoOuNaoInformado(contrato.numeroModalidade)}
                        </span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span
                          className="line-clamp-2 text-[14px] font-medium leading-5 text-text"
                          title={textoOuNaoInformado(contrato.objeto)}
                        >
                          {textoOuNaoInformado(contrato.objeto)}
                        </span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span className="block truncate text-[14px] text-text" title={textoOuNaoInformado(contrato.processo)}>
                          {textoOuNaoInformado(contrato.processo)}
                        </span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span className="block truncate text-[14px] text-text" title={textoOuNaoInformado(contrato.contrato)}>
                          {textoOuNaoInformado(contrato.contrato)}
                        </span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span
                          className="block truncate text-[14px] text-text"
                          title={textoOuNaoInformado(contrato.empresaContratada)}
                        >
                          {textoOuNaoInformado(contrato.empresaContratada)}
                        </span>
                      </td>
                      <td className={`tabular-nums border-b border-border px-4 text-right align-middle ${rowPadding}`}>
                        <span className="text-[14px] font-medium text-text">{formatMoedaBRL(contrato.valor)}</span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span className="text-[14px] text-text">{formatDataOuTraco(contrato.dataInicio)}</span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span className="text-[14px] text-text">{formatDataOuTraco(contrato.dataVencimento)}</span>
                      </td>
                      <td className={`tabular-nums border-b border-border px-4 text-right align-middle ${rowPadding}`}>
                        <span className={`text-[14px] font-medium ${getCriticidadeTextClass(contrato.criticidade)}`}>
                          {formatDiasParaVencimento(contrato.diasParaVencimento)}
                        </span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span
                          className={`inline-flex min-h-6 items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${getStatusClasses(
                            contrato,
                          )}`}
                        >
                          {getStatusLabel(contrato)}
                        </span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span className="block truncate text-[14px] text-text" title={textoOuNaoInformado(contrato.gestor)}>
                          {textoOuNaoInformado(contrato.gestor)}
                        </span>
                      </td>
                      <td className={`border-b border-border px-4 align-middle ${rowPadding}`}>
                        <span className="block truncate text-[14px] text-text" title={textoOuNaoInformado(contrato.fiscal)}>
                          {textoOuNaoInformado(contrato.fiscal)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <p className="text-[13px] text-muted">
            Navegação paginada para manter a consulta leve e estável em uso administrativo.
          </p>
          <Pagination currentPage={paginaAtual} totalPages={totalPaginas} onPageChange={onPageChange} />
        </div>
      </div>
    </section>
  );
}
