import { useEffect } from 'react';
import type { Contrato } from '../../types/contrato';
import {
  formatCriticidade,
  formatDataBR,
  formatDiasParaVencimento,
  formatFaixaVencimento,
  formatMoedaBRL,
  formatStatusNormalizado,
  textoOuNaoInformado,
} from '../../utils/format';
import { getStatusClasses, getStatusLabel } from '../shared/contratoAppearance';

type ContratoDetailProps = {
  contrato: Contrato | null;
  onClose: () => void;
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

export function ContratoDetail({ contrato, onClose }: ContratoDetailProps) {
  useEffect(() => {
    if (!contrato) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [contrato, onClose]);

  if (!contrato) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:items-stretch lg:justify-end"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalhe do contrato"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_28px_80px_-38px_rgba(15,23,42,0.65)] lg:max-h-full lg:max-w-[520px] lg:rounded-[32px_0_0_32px]"
      >
        <div className="border-b border-slate-200/80 bg-gradient-to-r from-iguape-800 via-iguape-700 to-iguape-500 px-5 py-5 text-white sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/68">
                Contrato {textoOuNaoInformado(contrato.contrato)}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                {textoOuNaoInformado(contrato.objeto)}
              </h2>
              <p className="mt-2 text-sm text-sky-100">{textoOuNaoInformado(contrato.empresaContratada)}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold text-white transition hover:bg-white/20"
              aria-label="Fechar detalhe do contrato"
            >
              ×
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold ${getStatusClasses(contrato)}`}>
              {getStatusLabel(contrato)}
            </span>
            <span className="inline-flex min-h-9 items-center rounded-full border border-white/18 bg-white/10 px-3 text-xs font-semibold text-white">
              {formatDiasParaVencimento(contrato.diasParaVencimento)}
            </span>
            {contrato.dadosIncompletos ? (
              <span className="inline-flex min-h-9 items-center rounded-full border border-amber-200/60 bg-amber-100/18 px-3 text-xs font-semibold text-amber-100">
                Dados essenciais pendentes
              </span>
            ) : null}
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <section className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Modalidade" value={textoOuNaoInformado(contrato.modalidade)} />
            <DetailField label="Nº Modalidade" value={textoOuNaoInformado(contrato.numeroModalidade)} />
            <DetailField label="Processo" value={textoOuNaoInformado(contrato.processo)} />
            <DetailField label="Contrato" value={textoOuNaoInformado(contrato.contrato)} />
            <DetailField label="Empresa contratada" value={textoOuNaoInformado(contrato.empresaContratada)} />
            <DetailField label="Valor" value={formatMoedaBRL(contrato.valor)} />
            <DetailField label="Valor (descrição)" value={textoOuNaoInformado(contrato.valorDescricao)} />
            <DetailField label="Data de início" value={formatDataBR(contrato.dataInicio)} />
            <DetailField label="Data de vencimento" value={formatDataBR(contrato.dataVencimento)} />
            <DetailField
              label="Dias p/ vencimento"
              value={formatDiasParaVencimento(contrato.diasParaVencimento)}
            />
            <DetailField
              label="Status calculado"
              value={contrato.statusNormalizado ? formatStatusNormalizado(contrato.statusNormalizado) : 'Não informado'}
            />
            <DetailField label="Status original" value={textoOuNaoInformado(contrato.statusOriginal)} />
            <DetailField label="Gestor" value={textoOuNaoInformado(contrato.gestor)} />
            <DetailField label="Fiscal" value={textoOuNaoInformado(contrato.fiscal)} />
            <DetailField
              label="Faixa de vencimento"
              value={formatFaixaVencimento(contrato.faixaVencimento)}
            />
            <DetailField label="Criticidade" value={formatCriticidade(contrato.criticidade)} />
          </section>

          <section className="mt-5 rounded-[28px] border border-slate-200/70 bg-white px-4 py-4 shadow-soft">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-iguape-700">
              Observações
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {textoOuNaoInformado(contrato.observacoes)}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
