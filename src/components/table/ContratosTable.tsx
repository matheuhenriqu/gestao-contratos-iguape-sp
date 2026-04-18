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
  { key: 'statusNormalizado', label: 'Status', minWidth: '120px' },
  { key: 'modalidade', label: 'Modalidade', minWidth: '140px' },
  { key: 'numeroModalidade', label: 'Nº Modalidade', minWidth: '100px' },
  { key: 'contrato', label: 'Contrato', minWidth: '110px' },
  { key: 'processo', label: 'Processo', minWidth: '140px' },
  { key: 'objeto', label: 'Objeto', minWidth: '420px' },
  { key: 'empresaContratada', label: 'Empresa contratada', minWidth: '240px' },
  { key: 'valor', label: 'Valor', minWidth: '130px', align: 'right' },
  { key: 'dataInicio', label: 'Data início', minWidth: '110px' },
  { key: 'dataVencimento', label: 'Data vencimento', minWidth: '110px' },
  { key: 'diasParaVencimento', label: 'Dias p/ vencimento', minWidth: '130px', align: 'right' },
  { key: 'gestor', label: 'Gestor', minWidth: '180px' },
  { key: 'fiscal', label: 'Fiscal', minWidth: '180px' },
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

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition ${
        align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
      } ${active ? 'text-primary-700' : 'text-text-subtle hover:text-primary-700'}`}
    >
      <span>{label}</span>
      {active ? (
        <span aria-hidden="true">{ordenacao.direcao === 'asc' ? '↑' : '↓'}</span>
      ) : (
        <ArrowUpDownIcon className="h-3.5 w-3.5" />
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
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-border-divider px-4 py-4 lg:px-5">
          <div className="grid gap-1">
            <p className="section-kicker">Consulta principal</p>
            <h2 className="text-xl font-semibold text-text">Contratos separados por modalidade</h2>
          </div>

          <button type="button" onClick={onToggleCompactMode} className="button-secondary hidden lg:inline-flex">
            {compactMode ? 'Modo confortável' : 'Modo compacto'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[2120px] border-separate border-spacing-0">
            <thead
              className="sticky z-20"
              style={{ top: 'calc(var(--header-height-desktop) + var(--safe-top) + 16px)' }}
            >
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    style={{ minWidth: column.minWidth }}
                    className="border-b border-border-strong bg-surface-2 px-3 py-3 first:pl-4 last:pr-4"
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
                    <td colSpan={COLUMNS.length} className="border-b border-border-divider bg-surface px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="grid gap-0.5">
                          <span className="section-kicker">Modalidade</span>
                          <span className="text-base font-semibold text-text">{group.label}</span>
                        </div>
                        <span className="tnum text-sm text-text-muted">
                          {formatNumeroInteiro(group.quantidade)} contrato{group.quantidade === 1 ? '' : 's'}
                        </span>
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
                      className={`transition ${
                        index % 2 === 0 ? 'bg-surface' : 'bg-[rgba(238,242,246,.5)]'
                      } hover:cursor-pointer hover:bg-primary-50 focus-visible:bg-primary-50`}
                    >
                      <td className={`border-b border-border-divider px-3 align-middle first:pl-4 ${rowPadding}`}>
                        <span className={`status-pill ${getStatusClasses(contrato)}`}>{getStatusLabel(contrato)}</span>
                      </td>

                      <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                        <span className="block truncate text-sm text-text" title={textoOuNaoInformado(contrato.modalidade)}>
                          {textoOuNaoInformado(contrato.modalidade)}
                        </span>
                      </td>

                      <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                        <span className="block truncate text-sm text-text" title={textoOuNaoInformado(contrato.numeroModalidade)}>
                          {textoOuNaoInformado(contrato.numeroModalidade)}
                        </span>
                      </td>

                      <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                        <span className="block truncate text-sm font-medium text-text" title={textoOuNaoInformado(contrato.contrato)}>
                          {textoOuNaoInformado(contrato.contrato)}
                        </span>
                      </td>

                      <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                        <span className="block truncate text-sm text-text" title={textoOuNaoInformado(contrato.processo)}>
                          {textoOuNaoInformado(contrato.processo)}
                        </span>
                      </td>

                      <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                        <span className="line-clamp-2 text-sm leading-5 text-text" title={textoOuNaoInformado(contrato.objeto)}>
                          {textoOuNaoInformado(contrato.objeto)}
                        </span>
                      </td>

                      <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                        <span className="block truncate text-sm text-text" title={textoOuNaoInformado(contrato.empresaContratada)}>
                          {textoOuNaoInformado(contrato.empresaContratada)}
                        </span>
                      </td>

                      <td className={`tnum border-b border-border-divider px-3 text-right align-middle ${rowPadding}`}>
                        <span className="text-sm font-medium text-text">{formatMoedaBRL(contrato.valor)}</span>
                      </td>

                      <td className={`tnum border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                        <span className="text-sm text-text">{formatDataOuTraco(contrato.dataInicio)}</span>
                      </td>

                      <td className={`tnum border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                        <span className="text-sm text-text">{formatDataOuTraco(contrato.dataVencimento)}</span>
                      </td>

                      <td className={`tnum border-b border-border-divider px-3 text-right align-middle ${rowPadding}`}>
                        <span className={`text-sm font-medium ${getCriticidadeTextClass(contrato.criticidade)}`}>
                          {formatDiasParaVencimento(contrato.diasParaVencimento)}
                        </span>
                      </td>

                      <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                        <span className="block truncate text-sm text-text" title={textoOuNaoInformado(contrato.gestor)}>
                          {textoOuNaoInformado(contrato.gestor)}
                        </span>
                      </td>

                      <td className={`border-b border-border-divider px-3 align-middle last:pr-4 ${rowPadding}`}>
                        <span className="block truncate text-sm text-text" title={textoOuNaoInformado(contrato.fiscal)}>
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

        <div className="flex flex-col gap-3 border-t border-border-divider px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <span>Por página</span>
              <select
                value={itensPorPagina}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className="field-base min-h-8 min-w-[92px] px-2 py-1"
              >
                {[25, 50, 100].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <p className="tnum text-sm text-text-muted">
              {formatNumeroInteiro(inicio)}–{formatNumeroInteiro(fim)} de {formatNumeroInteiro(totalResultados)}
            </p>
          </div>

          <p className="text-sm text-text-muted">Página {paginaAtual} de {totalPaginas}</p>

          <Pagination currentPage={paginaAtual} totalPages={totalPaginas} onPageChange={onPageChange} />
        </div>
      </div>
    </section>
  );
}
