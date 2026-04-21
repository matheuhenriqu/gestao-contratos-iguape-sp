import { useEffect, useMemo, useState } from 'react';
import type { Contrato } from '../../types/contrato';
import type { OrdenacaoCampo, OrdenacaoDirecao } from '../../hooks/useFiltros';
import {
  formatDataOuTraco,
  formatMoedaBRL,
  formatMoedaCompactaBRL,
  formatNumeroInteiro,
  formatPrazoCompacto,
  textoOuNaoInformado,
} from '../../utils/format';
import {
  getCriticidadeTextClass,
  getFaixaTone,
  getStatusClasses,
  getStatusLabel,
} from '../shared/contratoAppearance';
import { ChevronDownIcon } from '../shared/icons';
import { groupContratosByModalidade } from '../shared/groupContratosByModalidade';

type ContratosMobileListProps = {
  contratos: Contrato[];
  totalResultados: number;
  ordenacao: {
    campo: OrdenacaoCampo;
    direcao: OrdenacaoDirecao;
  };
  onSortChange: (campo: OrdenacaoCampo, direcao: OrdenacaoDirecao) => void;
  onOpenDetail: (contrato: Contrato) => void;
};

const SORT_OPTIONS: Array<{ value: `${OrdenacaoCampo}:${OrdenacaoDirecao}`; label: string }> = [
  { value: 'dataVencimento:asc', label: 'Vencimento mais próximo' },
  { value: 'valor:desc', label: 'Maior valor' },
  { value: 'objeto:asc', label: 'Objeto (A-Z)' },
  { value: 'empresaContratada:asc', label: 'Empresa (A-Z)' },
  { value: 'statusNormalizado:asc', label: 'Status' },
];

export function ContratosMobileList({
  contratos,
  totalResultados,
  ordenacao,
  onSortChange,
  onOpenDetail,
}: ContratosMobileListProps) {
  const groups = groupContratosByModalidade(contratos);
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

  function toggleGroup(key: string) {
    setCollapsed((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="grid gap-3 md:hidden">
      <div className="surface-card flex items-center justify-between gap-2 p-3">
        <p className="tnum text-sm font-medium text-text">
          {formatNumeroInteiro(totalResultados)} contrato{totalResultados === 1 ? '' : 's'}
        </p>

        <select
          aria-label="Ordenar"
          value={`${ordenacao.campo}:${ordenacao.direcao}`}
          onChange={(event) => {
            const [campo, direcao] = event.target.value.split(':') as [
              OrdenacaoCampo,
              OrdenacaoDirecao,
            ];
            onSortChange(campo, direcao);
          }}
          className="field-base min-h-10 min-w-[140px] text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        {groups.map((group) => {
          const isExpanded = !collapsed[group.key];

          return (
            <section
              key={group.key}
              className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft"
            >
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={isExpanded}
                className={`relative flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                  isExpanded ? 'bg-primary-50/70' : 'bg-surface'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
                    isExpanded ? 'bg-primary-600' : 'bg-primary-600/40'
                  }`}
                />

                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`tnum inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${
                      isExpanded
                        ? 'bg-primary-600 text-text-inverse'
                        : 'bg-primary-100 text-primary-800'
                    }`}
                  >
                    {group.abbreviation}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-primary-950">
                      {group.label}
                    </span>
                    <span className="tnum block text-[11px] font-medium text-text-muted">
                      {formatNumeroInteiro(group.quantidade)} contrato
                      {group.quantidade === 1 ? '' : 's'}
                      {group.possuiValorInformado ? (
                        <>
                          <span aria-hidden="true" className="px-1 text-text-subtle">
                            ·
                          </span>
                          <span title={formatMoedaBRL(group.valorTotal)}>
                            {formatMoedaCompactaBRL(group.valorTotal)}
                          </span>
                        </>
                      ) : null}
                    </span>
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              </button>

              {isExpanded ? (
                <div className="grid gap-2.5 border-t border-border-divider bg-surface-2/30 p-3 fade-in">
                  {group.contratos.map((contrato) => (
                    <article
                      key={contrato.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenDetail(contrato)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpenDetail(contrato);
                        }
                      }}
                      className="card-interactive relative grid gap-1.5 overflow-hidden rounded-xl border border-border bg-surface px-3 py-3 pl-3.5 shadow-soft"
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-0 h-full w-1 ${getFaixaTone(contrato.faixaVencimento)}`}
                      />

                      <div className="flex items-center justify-between gap-2">
                        <span className={`status-pill ${getStatusClasses(contrato)}`}>
                          {getStatusLabel(contrato)}
                        </span>
                        <span
                          className={`tnum text-xs font-semibold ${getCriticidadeTextClass(contrato.criticidade)}`}
                        >
                          {formatPrazoCompacto(contrato.diasParaVencimento)}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text">
                        {textoOuNaoInformado(contrato.objeto)}
                      </h3>

                      <p className="line-clamp-1 text-xs text-text-muted">
                        {textoOuNaoInformado(contrato.empresaContratada)}
                      </p>

                      <div className="mt-0.5 flex items-center justify-between gap-3">
                        <span className="tnum text-[11px] text-text-subtle">
                          {formatDataOuTraco(contrato.dataVencimento)}
                        </span>
                        <span className="tnum text-sm font-semibold text-text">
                          {formatMoedaBRL(contrato.valor)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

    </section>
  );
}
