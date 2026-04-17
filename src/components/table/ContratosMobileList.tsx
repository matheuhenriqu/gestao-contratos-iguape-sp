import type { Contrato } from '../../types/contrato';
import {
  formatDataBR,
  formatDiasParaVencimento,
  formatMoedaBRL,
  formatNumeroInteiro,
  textoOuNaoInformado,
} from '../../utils/format';
import {
  getAccentBorderClasses,
  getCriticidadeClasses,
  getStatusClasses,
  getStatusLabel,
} from '../shared/contratoAppearance';
import { Pagination } from '../shared/Pagination';

type ContratosMobileListProps = {
  contratos: Contrato[];
  totalResultados: number;
  paginaAtual: number;
  totalPaginas: number;
  itensPorPagina: number;
  onOpenDetail: (contrato: Contrato) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number) => void;
};

function InfoItem({ label, value, align = 'left' }: { label: string; value: string; align?: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

export function ContratosMobileList({
  contratos,
  totalResultados,
  paginaAtual,
  totalPaginas,
  itensPorPagina,
  onOpenDetail,
  onPageChange,
  onPageSizeChange,
}: ContratosMobileListProps) {
  const inicio = totalResultados === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalResultados);

  return (
    <section className="xl:hidden">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200/80 bg-white px-4 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Mostrando {formatNumeroInteiro(inicio)} a {formatNumeroInteiro(fim)} de{' '}
              {formatNumeroInteiro(totalResultados)} contratos
            </p>
            <p className="mt-1 text-sm text-slate-500">
              No mobile e tablet, a consulta é reorganizada em cartões para manter a leitura confortável.
            </p>
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-500">
            <span>Itens</span>
            <select
              value={itensPorPagina}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-iguape-400 focus:ring-4 focus:ring-iguape-100"
            >
              {[6, 8, 12].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3">
          {contratos.map((contrato) => (
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
              className={`cursor-pointer rounded-[28px] border border-slate-200/80 bg-white px-4 py-4 shadow-soft transition hover:border-iguape-200 hover:bg-iguape-50/40 ${getAccentBorderClasses(
                contrato.criticidade,
              )}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-iguape-700">
                    {textoOuNaoInformado(contrato.modalidade)}
                  </p>
                  <h3 className="mt-2 text-base font-semibold leading-tight tracking-[-0.02em] text-slate-900">
                    {textoOuNaoInformado(contrato.objeto)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {textoOuNaoInformado(contrato.empresaContratada)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${getStatusClasses(
                    contrato,
                  )}`}
                >
                  {getStatusLabel(contrato)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-3xl bg-slate-50/80 p-3">
                <InfoItem label="Contrato" value={textoOuNaoInformado(contrato.contrato)} />
                <InfoItem label="Processo" value={textoOuNaoInformado(contrato.processo)} align="right" />
                <InfoItem label="Valor" value={formatMoedaBRL(contrato.valor)} />
                <InfoItem
                  label="Dias p/ vencimento"
                  value={formatDiasParaVencimento(contrato.diasParaVencimento)}
                  align="right"
                />
                <InfoItem label="Início" value={formatDataBR(contrato.dataInicio)} />
                <InfoItem label="Vencimento" value={formatDataBR(contrato.dataVencimento)} align="right" />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Gestão
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Gestor: <span className="font-medium">{textoOuNaoInformado(contrato.gestor)}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Fiscal: <span className="font-medium">{textoOuNaoInformado(contrato.fiscal)}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Situação
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${getCriticidadeClasses(contrato.criticidade)}`}>
                    {contrato.dadosIncompletos ? 'Dados pendentes' : 'Cadastro consistente'}
                  </p>
                  <p className="mt-1 text-sm text-iguape-700">Abrir detalhe</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white px-4 py-4 shadow-soft">
          <Pagination currentPage={paginaAtual} totalPages={totalPaginas} onPageChange={onPageChange} />
        </div>
      </div>
    </section>
  );
}
