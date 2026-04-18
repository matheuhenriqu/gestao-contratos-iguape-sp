import type { Contrato } from '../../types/contrato';
import type { OrdenacaoCampo, OrdenacaoDirecao } from '../../hooks/useFiltros';
import {
  formatDataOuTraco,
  formatMoedaBRL,
  formatNumeroInteiro,
  formatPrazoCompacto,
  textoOuNaoInformado,
} from '../../utils/format';
import {
  getCriticidadeTextClass,
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

      <div className="grid gap-3">
        {groups.map((group) => (
          <section key={group.key} className="grid gap-2">
            <div className="rounded-lg border border-border-divider bg-surface-2 px-4 py-3">
              <p className="section-kicker">Modalidade</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <h3 className="truncate text-base font-semibold text-text">{group.label}</h3>
                <span className="tnum text-sm text-text-muted">
                  {formatNumeroInteiro(group.quantidade)}
                </span>
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
                className="grid gap-2 rounded-lg border border-border bg-surface px-3.5 py-3.5 shadow-soft transition hover:border-primary-200 hover:shadow-raised"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`status-pill ${getStatusClasses(contrato)}`}>{getStatusLabel(contrato)}</span>
                  <span className={`text-sm font-medium ${getCriticidadeTextClass(contrato.criticidade)}`}>
                    {formatPrazoCompacto(contrato.diasParaVencimento)}
                  </span>
                </div>

                <h3 className="line-clamp-2 text-md font-medium text-text">
                  {textoOuNaoInformado(contrato.objeto)}
                </h3>

                <p className="line-clamp-1 text-sm text-text-muted">
                  {textoOuNaoInformado(contrato.empresaContratada)}
                </p>

                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm text-text-muted">
                      Contrato · Nº {textoOuNaoInformado(contrato.contrato)}
                    </p>
                    <p className="line-clamp-1 text-sm text-text-muted">
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
