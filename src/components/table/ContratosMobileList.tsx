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
  const inicio = totalResultados === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalResultados);
  const groups = groupContratosByModalidade(contratos);

  return (
    <section className="grid gap-4 md:hidden">
      <div className="surface-card flex flex-col gap-3 p-4">
        <p className="text-[13px] text-muted">
          Mostrando {formatNumeroInteiro(inicio)} a {formatNumeroInteiro(fim)} de{' '}
          {formatNumeroInteiro(totalResultados)} contratos.
        </p>

        <div className="grid gap-3 min-[520px]:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-2">
            <span className="field-label">Ordenar por</span>
            <select
              value={`${ordenacao.campo}:${ordenacao.direcao}`}
              onChange={(event) => {
                const [campo, direcao] = event.target.value.split(':') as [
                  OrdenacaoCampo,
                  OrdenacaoDirecao,
                ];
                onSortChange(campo, direcao);
              }}
              className="field-base"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="field-label">Por página</span>
            <select
              value={itensPorPagina}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="field-base"
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

      <div className="grid gap-3">
        {groups.map((group) => (
          <section key={group.key} className="grid gap-3">
            <div className="flex items-center justify-between rounded-[10px] border border-border bg-surface-2 px-4 py-3">
              <div className="min-w-0">
                <p className="field-label">Modalidade</p>
                <h3 className="truncate text-[14px] font-semibold text-text">{group.label}</h3>
              </div>
              <p className="text-[13px] font-medium text-muted">
                {formatNumeroInteiro(group.quantidade)} contrato{group.quantidade === 1 ? '' : 's'}
              </p>
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
                className="surface-card focus-ring grid gap-3 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex min-h-6 items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${getStatusClasses(
                      contrato,
                    )}`}
                  >
                    {getStatusLabel(contrato)}
                  </span>
                  <span className={`text-[13px] font-medium ${getCriticidadeTextClass(contrato.criticidade)}`}>
                    {formatPrazoCompacto(contrato.diasParaVencimento)}
                  </span>
                </div>

                <div className="grid gap-1.5">
                  <h3 className="line-clamp-2 text-[15px] font-medium leading-5 text-text">
                    {textoOuNaoInformado(contrato.objeto)}
                  </h3>
                  <p className="text-[13px] leading-5 text-muted">
                    {textoOuNaoInformado(contrato.empresaContratada)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <p className="field-label">Contrato</p>
                    <p className="truncate text-[13px] font-medium text-text">
                      Nº {textoOuNaoInformado(contrato.contrato)}
                    </p>
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="field-label">Vencimento</p>
                    <p className="truncate text-[13px] font-medium text-text">
                      {formatDataOuTraco(contrato.dataVencimento)}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="field-label">Processo</p>
                    <p className="truncate text-[13px] text-muted">
                      {textoOuNaoInformado(contrato.processo)}
                    </p>
                  </div>
                  <p className="tabular-nums text-right text-[16px] font-semibold text-text">
                    {formatMoedaBRL(contrato.valor)}
                  </p>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>

      <div className="surface-card p-4">
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
