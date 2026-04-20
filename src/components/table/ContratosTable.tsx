import { Fragment, useEffect, useMemo, useState } from 'react';
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
import { ArrowUpDownIcon, ChevronDownIcon } from '../shared/icons';
import {
  groupContratosByModalidade,
  type ContratoModalidadeGroup,
} from '../shared/groupContratosByModalidade';

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
  { key: 'contrato', label: 'Contrato', minWidth: '120px' },
  { key: 'objeto', label: 'Objeto', minWidth: '420px' },
  { key: 'empresaContratada', label: 'Empresa contratada', minWidth: '240px' },
  { key: 'valor', label: 'Valor', minWidth: '130px', align: 'right' },
  { key: 'dataVencimento', label: 'Vencimento', minWidth: '110px' },
  { key: 'diasParaVencimento', label: 'Dias', minWidth: '120px', align: 'right' },
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

function GroupHeader({
  group,
  expanded,
  onToggle,
  panelId,
}: {
  group: ContratoModalidadeGroup;
  expanded: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={panelId}
      className={`group relative flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${
        expanded ? 'bg-primary-50/70' : 'bg-surface hover:bg-primary-50/40'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-1 rounded-l-xl transition-opacity ${
          expanded ? 'bg-primary-600 opacity-100' : 'bg-primary-600 opacity-40 group-hover:opacity-70'
        }`}
      />

      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={`tnum inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tracking-[0.04em] transition-colors ${
            expanded
              ? 'bg-primary-600 text-text-inverse'
              : 'bg-primary-100 text-primary-800 group-hover:bg-primary-200'
          }`}
        >
          {group.abbreviation}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold tracking-tight text-primary-950 md:text-[17px]">
            {group.label}
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.1em] text-text-subtle">
            Modalidade
          </span>
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-3">
        <span className="tnum hidden items-center gap-2 text-sm font-medium text-text-muted sm:inline-flex">
          <span>
            {formatNumeroInteiro(group.quantidade)} contrato{group.quantidade === 1 ? '' : 's'}
          </span>
          {group.possuiValorInformado ? (
            <>
              <span aria-hidden="true" className="text-text-subtle">
                ·
              </span>
              <span
                className="font-semibold text-text"
                title={formatMoedaBRL(group.valorTotal)}
              >
                {formatMoedaCompactaBRL(group.valorTotal)}
              </span>
            </>
          ) : null}
        </span>

        <span className="tnum inline-flex items-center gap-1 text-xs font-semibold text-text-muted sm:hidden">
          {formatNumeroInteiro(group.quantidade)}
          {group.possuiValorInformado ? (
            <>
              <span aria-hidden="true" className="text-text-subtle">
                ·
              </span>
              {formatMoedaCompactaBRL(group.valorTotal)}
            </>
          ) : null}
        </span>

        <span
          aria-hidden="true"
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-transform duration-200 group-hover:text-primary-700 ${
            expanded ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <ChevronDownIcon className="h-4 w-4" />
        </span>
      </span>
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
  const groupKeys = useMemo(() => groups.map((group) => group.key).join('|'), [groups]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCollapsed((current) => {
      const next: Record<string, boolean> = {};
      for (const group of groups) {
        next[group.key] = current[group.key] ?? false;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupKeys]);

  const totalCollapsed = groups.filter((group) => collapsed[group.key]).length;
  const allCollapsed = groups.length > 0 && totalCollapsed === groups.length;

  function toggleGroup(key: string) {
    setCollapsed((current) => ({ ...current, [key]: !current[key] }));
  }

  function toggleAll() {
    const target = !allCollapsed;
    const next: Record<string, boolean> = {};
    for (const group of groups) {
      next[group.key] = target;
    }
    setCollapsed(next);
  }

  return (
    <section className="hidden md:block">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-soft md:px-5">
        <div className="grid gap-0.5">
          <p className="section-kicker">Por modalidade</p>
          <p className="text-sm text-text-muted">
            Cada modalidade é apresentada como um bloco independente. Clique no cabeçalho para expandir ou recolher.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {groups.length > 0 ? (
            <span className="tnum inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface-2/60 px-3 py-1.5 text-xs font-medium text-text-muted">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-pill bg-primary-600" />
              {formatNumeroInteiro(groups.length)} modalidade{groups.length === 1 ? '' : 's'} nesta página
            </span>
          ) : null}

          {groups.length > 1 ? (
            <button type="button" onClick={toggleAll} className="button-secondary shrink-0">
              {allCollapsed ? 'Expandir todas' : 'Recolher todas'}
            </button>
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
              onClick={() => {
                if (collapsed[group.key]) {
                  setCollapsed((current) => ({ ...current, [group.key]: false }));
                }
              }}
              className="group inline-flex shrink-0 items-center gap-2 rounded-pill border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
            >
              <span className="tnum inline-flex h-5 w-5 items-center justify-center rounded-pill bg-primary-100 text-[10px] font-semibold text-primary-800 group-hover:bg-primary-600 group-hover:text-text-inverse">
                {group.abbreviation}
              </span>
              <span className="truncate max-w-[180px]">{group.label}</span>
              <span className="tnum text-[10px] font-semibold text-text-subtle">
                {formatNumeroInteiro(group.quantidade)}
              </span>
            </a>
          ))}
        </nav>
      ) : null}

      <div className="grid gap-4">
        {groups.map((group) => {
          const isExpanded = !collapsed[group.key];
          const panelId = `${modalidadeAnchor(group.key)}-panel`;

          return (
            <article
              key={group.key}
              id={modalidadeAnchor(group.key)}
              className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft scroll-mt-24"
            >
              <GroupHeader
                group={group}
                expanded={isExpanded}
                onToggle={() => toggleGroup(group.key)}
                panelId={panelId}
              />

              {isExpanded ? (
                <div
                  id={panelId}
                  className="overflow-x-auto border-t border-border-divider fade-in"
                >
                  <table className="w-full min-w-[1180px] border-separate border-spacing-0">
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
                              style={{
                                boxShadow: `inset 3px 0 0 0 ${getCriticidadeAccentColor(contrato.criticidade)}`,
                              }}
                            >
                              <span className={`status-pill ${getStatusClasses(contrato)}`}>
                                {getStatusLabel(contrato)}
                              </span>
                            </td>

                            <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                              <span
                                className="block truncate text-sm font-medium text-text"
                                title={textoOuNaoInformado(contrato.contrato)}
                              >
                                {textoOuNaoInformado(contrato.contrato)}
                              </span>
                            </td>

                            <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                              <span
                                className="line-clamp-2 text-sm leading-5 text-text"
                                title={textoOuNaoInformado(contrato.objeto)}
                              >
                                {textoOuNaoInformado(contrato.objeto)}
                              </span>
                            </td>

                            <td className={`border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                              <span
                                className="block truncate text-sm text-text"
                                title={textoOuNaoInformado(contrato.empresaContratada)}
                              >
                                {textoOuNaoInformado(contrato.empresaContratada)}
                              </span>
                            </td>

                            <td
                              className={`tnum border-b border-border-divider px-3 text-right align-middle ${rowPadding}`}
                            >
                              <span className="text-sm font-medium text-text">{formatMoedaBRL(contrato.valor)}</span>
                            </td>

                            <td className={`tnum border-b border-border-divider px-3 align-middle ${rowPadding}`}>
                              <span className="text-sm text-text">{formatDataOuTraco(contrato.dataVencimento)}</span>
                            </td>

                            <td
                              className={`tnum border-b border-border-divider px-3 pr-4 text-right align-middle ${rowPadding}`}
                            >
                              <span className={`text-sm font-medium ${getCriticidadeTextClass(contrato.criticidade)}`}>
                                {formatDiasParaVencimento(contrato.diasParaVencimento)}
                              </span>
                            </td>
                          </tr>
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </article>
          );
        })}
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
