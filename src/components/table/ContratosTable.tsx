import { Fragment } from 'react';
import type { Contrato } from '../../types/contrato';
import type { OrdenacaoCampo } from '../../hooks/useFiltros';
import {
  formatDataOuTraco,
  formatDiasParaVencimento,
  formatMoedaBRL,
  formatMoedaCompactaBRL,
  formatNumeroInteiro,
  textoOuNaoInformado,
} from '../../utils/format';
import {
  getCriticidadeAccentColor,
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

function modalidadeAnchor(key: string): string {
  return `modalidade-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-soft md:px-5">
        <div className="grid gap-0.5">
          <p className="section-kicker">Por modalidade</p>
          <p className="text-sm text-text-muted">
            Cada modalidade é apresentada como um bloco independente, com contagem e valor consolidado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {groups.length > 0 ? (
            <span className="tnum inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface-2/60 px-3 py-1.5 text-xs font-medium text-text-muted">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-pill bg-primary-600" />
              {formatNumeroInteiro(groups.length)} modalidade{groups.length === 1 ? '' : 's'} nesta página
            </span>
          ) : null}

          <button type="button" onClick={onToggleCompactMode} className="button-secondary shrink-0">
            {compactMode ? 'Modo confortável' : 'Modo compacto'}
          </button>
        </div>
      </div>

      {groups.length > 1 ? (
        <nav
          aria-label="Índice de modalidades"
          className="mb-4 flex items-center gap-2 overflow-x-auto rounded-xl border border-border-divider bg-surface-2/40 px-3 py-2"
        >
          <span className="shrink-0 pr-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-subtle">
            Ir para
          </span>
          {groups.map((group) => (
            <a
              key={group.key}
              href={`#${modalidadeAnchor(group.key)}`}
              className="group inline-flex shrink-0 items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
            >
              <span className="truncate max-w-[200px]">{group.label}</span>
              <span className="tnum inline-flex items-center rounded-pill bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-text-subtle group-hover:bg-primary-100 group-hover:text-primary-800">
                {formatNumeroInteiro(group.quantidade)}
              </span>
            </a>
          ))}
        </nav>
      ) : null}

      <div className="grid gap-5">
        {groups.map((group) => (
          <article
            key={group.key}
            id={modalidadeAnchor(group.key)}
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft scroll-mt-24"
          >
            <header className="flex flex-col gap-3 border-b border-border-divider bg-primary-50/60 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span aria-hidden="true" className="h-10 w-1.5 shrink-0 rounded-pill bg-primary-600" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-700">
                    Modalidade
                  </p>
                  <h3 className="truncate text-lg font-semibold tracking-tight text-primary-950">
                    {group.label}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="tnum inline-flex items-center gap-1.5 rounded-pill border border-primary-200 bg-surface px-3 py-1 text-xs font-semibold text-primary-800">
                  <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-pill bg-primary-600" />
                  {formatNumeroInteiro(group.quantidade)} contrato{group.quantidade === 1 ? '' : 's'}
                </span>
                {group.possuiValorInformado ? (
                  <span
                    className="tnum inline-flex items-center gap-1.5 rounded-pill border border-secondary-500/40 bg-[rgba(43,144,148,0.08)] px-3 py-1 text-xs font-semibold text-secondary-700"
                    title={formatMoedaBRL(group.valorTotal)}
                  >
                    <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-pill bg-secondary-600" />
                    {formatMoedaCompactaBRL(group.valorTotal)}
                  </span>
                ) : null}
              </div>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[2000px] border-separate border-spacing-0">
                <thead>
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
                  {group.contratos.map((contrato, index) => (
                    <Fragment key={contrato.id}>
                      <tr
                        tabIndex={0}
                        role="button"
                        aria-label={`Abrir detalhes do contrato ${textoOuNaoInformado(contrato.contrato)}`}
                        onClick={() => onOpenDetail(contrato)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onOpenDetail(contrato);
                          }
                        }}
                        className={`focus-row cursor-pointer outline-none transition hover:bg-primary-50 ${
                          index % 2 === 0 ? 'bg-surface' : 'bg-[rgba(238,242,246,.5)]'
                        }`}
                      >
                        <td
                          className={`border-b border-border-divider pl-4 pr-3 align-middle ${rowPadding}`}
                          style={{ boxShadow: `inset 3px 0 0 0 ${getCriticidadeAccentColor(contrato.criticidade)}` }}
                        >
                          <span className={`status-pill ${getStatusClasses(contrato)}`}>{getStatusLabel(contrato)}</span>
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
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-soft lg:flex-row lg:items-center lg:justify-between lg:px-5">
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
    </section>
  );
}
