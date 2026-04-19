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
import { Pagination } from '../shared/Pagination';
import { groupContratosByModalidade } from '../shared/groupContratosByModalidade';

type ContratosMobileListProps = {
  contratos: Contrato[];
  totalResultados: number;
  paginaAtual: number;
  totalPaginas: number;
  itensPorPagina: number;
  ordenacao: {
    campo: OrdenacaoCampo;
    direcao: OrdenacaoDirecao;
  };
  onSortChange: (campo: OrdenacaoCampo, direcao: OrdenacaoDirecao) => void;
  onOpenDetail: (contrato: Contrato) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number) => void;
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
  paginaAtual,
  totalPaginas,
  itensPorPagina,
  ordenacao,
  onSortChange,
  onOpenDetail,
  onPageChange,
  onPageSizeChange,
}: ContratosMobileListProps) {
  const groups = groupContratosByModalidade(contratos);

  return (
    <section className="grid gap-3 md:hidden">
      <div className="surface-card grid gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="tnum text-sm font-medium text-text">
            {formatNumeroInteiro(totalResultados)} contrato{totalResultados === 1 ? '' : 's'}
          </p>

          <label className="flex items-center gap-2 text-sm text-text-muted">
            <span>Ordenar</span>
            <select
              value={`${ordenacao.campo}:${ordenacao.direcao}`}
              onChange={(event) => {
                const [campo, direcao] = event.target.value.split(':') as [
                  OrdenacaoCampo,
                  OrdenacaoDirecao,
                ];
                onSortChange(campo, direcao);
              }}
              className="field-base min-h-11 min-w-[168px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-text-muted">
          <span>Por página</span>
          <select
            value={itensPorPagina}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="field-base min-h-11 w-[96px]"
          >
            {[25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
          <section key={group.key} className="grid gap-2.5">
            <div className="overflow-hidden rounded-xl border border-primary-200 bg-primary-50 shadow-soft">
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span aria-hidden="true" className="mt-1 h-5 w-1 shrink-0 rounded-pill bg-primary-600" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-800/80">
                      Modalidade
                    </p>
                    <h3 className="truncate text-sm font-semibold text-primary-950">{group.label}</h3>
                  </div>
                </div>
                <span className="tnum inline-flex shrink-0 items-center rounded-pill bg-surface px-2 py-0.5 text-xs font-semibold text-primary-800 ring-1 ring-primary-200">
                  {formatNumeroInteiro(group.quantidade)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-primary-200/70 bg-primary-50/60 px-4 py-2 text-[11px] font-medium text-primary-800">
                <span className="tnum inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-pill bg-primary-600" />
                  {formatNumeroInteiro(group.quantidade)} contrato{group.quantidade === 1 ? '' : 's'}
                </span>
                {group.possuiValorInformado ? (
                  <span
                    className="tnum inline-flex items-center gap-1.5"
                    title={formatMoedaBRL(group.valorTotal)}
                  >
                    <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-pill bg-secondary-600" />
                    {formatMoedaCompactaBRL(group.valorTotal)}
                  </span>
                ) : null}
              </div>
            </div>

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
                className="card-interactive relative grid gap-2 overflow-hidden rounded-xl border border-border bg-surface px-3.5 py-3.5 pl-4 shadow-soft"
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-full w-1 ${getFaixaTone(contrato.faixaVencimento)}`}
                />

                <div className="flex items-center justify-between gap-3">
                  <span className={`status-pill ${getStatusClasses(contrato)}`}>{getStatusLabel(contrato)}</span>
                  <span className={`text-sm font-semibold ${getCriticidadeTextClass(contrato.criticidade)}`}>
                    {formatPrazoCompacto(contrato.diasParaVencimento)}
                  </span>
                </div>

                <h3 className="line-clamp-2 text-md font-semibold leading-snug text-text">
                  {textoOuNaoInformado(contrato.objeto)}
                </h3>

                <p className="line-clamp-1 text-sm text-text-muted">
                  {textoOuNaoInformado(contrato.empresaContratada)}
                </p>

                <div className="flex items-end justify-between gap-3 border-t border-border-divider pt-2">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-xs text-text-subtle">
                      Nº {textoOuNaoInformado(contrato.contrato)}
                    </p>
                    <p className="line-clamp-1 text-xs text-text-subtle">
                      Venc. {formatDataOuTraco(contrato.dataVencimento)}
                    </p>
                  </div>

                  <p className="tnum text-md font-semibold text-text">{formatMoedaBRL(contrato.valor)}</p>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>

      <div className="surface-card flex justify-center p-3">
        <Pagination
          currentPage={paginaAtual}
          totalPages={totalPaginas}
          onPageChange={onPageChange}
          compact
        />
      </div>
    </section>
  );
}
