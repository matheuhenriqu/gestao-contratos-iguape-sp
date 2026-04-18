import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Contrato } from '../../types/contrato';
import {
  formatCriticidade,
  formatDataOuTraco,
  formatDiasParaVencimento,
  formatFaixaVencimento,
  formatMoedaBRL,
  getCampoPendenteLabels,
  textoOuNaoInformado,
} from '../../utils/format';
import {
  getCriticidadeSurfaceClass,
  getFaixaTone,
  getStatusClasses,
  getStatusLabel,
} from '../shared/contratoAppearance';
import { ClipboardIcon, XIcon } from '../shared/icons';

type ContratoDetailProps = {
  contrato: Contrato | null;
  onClose: () => void;
};

function DetailField({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid gap-1">
      <p className="field-label">{label}</p>
      <p className={`text-[14px] leading-6 ${strong ? 'font-semibold text-text' : 'text-muted'}`}>{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-subtle">{title}</h3>
      {children}
    </section>
  );
}

function useDialogAccessibility(open: boolean, onClose: () => void, dialogRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    const selectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusable = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(selectors) ?? []).filter(
        (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
      );

    const timer = window.setTimeout(() => {
      focusable()[0]?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const items = focusable();
      if (items.length === 0) {
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialogRef, onClose, open]);
}

function calcularVigenciaPercentual(contrato: Contrato): number | null {
  if (!contrato.dataInicio || !contrato.dataVencimento) {
    return null;
  }

  const inicio = new Date(`${contrato.dataInicio}T00:00:00`);
  const vencimento = new Date(`${contrato.dataVencimento}T00:00:00`);
  const agora = new Date();
  const total = vencimento.getTime() - inicio.getTime();

  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }

  const atual = agora.getTime() - inicio.getTime();
  return Math.max(0, Math.min(100, (atual / total) * 100));
}

export function ContratoDetail({ contrato, onClose }: ContratoDetailProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  useDialogAccessibility(Boolean(contrato), onClose, dialogRef);

  const camposPendentes = useMemo(() => (contrato ? getCampoPendenteLabels(contrato) : []), [contrato]);
  const vigenciaPercentual = useMemo(
    () => (contrato ? calcularVigenciaPercentual(contrato) : null),
    [contrato],
  );

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  if (!contrato) {
    return null;
  }

  const currentContrato = contrato;

  async function handleCopy() {
    if (!currentContrato.contrato) {
      return;
    }

    try {
      await navigator.clipboard.writeText(currentContrato.contrato);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[3px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contrato-detail-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col rounded-t-[12px] bg-surface shadow-raised lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[520px] lg:rounded-none lg:rounded-l-[12px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="lg:hidden flex items-center justify-center py-2">
          <span className="h-1.5 w-12 rounded-full bg-border-strong" />
        </div>

        <header className="grid gap-4 border-b border-border px-4 pb-4 pt-2 lg:px-6 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="field-label">Contrato</p>
              <h2 id="contrato-detail-title" className="truncate text-[20px] font-semibold text-text">
                {textoOuNaoInformado(currentContrato.contrato)}
              </h2>
              <p className="mt-1 text-[14px] leading-6 text-muted">{textoOuNaoInformado(currentContrato.objeto)}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-surface text-muted transition hover:border-brand-600 hover:text-brand-700"
              aria-label="Fechar detalhe do contrato"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex min-h-8 items-center rounded-full px-3 text-[12px] font-medium ${getStatusClasses(
                currentContrato,
              )}`}
            >
              {getStatusLabel(currentContrato)}
            </span>
            <span
              className={`inline-flex min-h-8 items-center rounded-full px-3 text-[12px] font-medium ${getCriticidadeSurfaceClass(
                currentContrato.criticidade,
              )}`}
            >
              {formatCriticidade(currentContrato.criticidade)}
            </span>
            <span className="inline-flex min-h-8 items-center rounded-full bg-primary-100 px-3 text-[12px] font-medium text-brand-700">
              {formatFaixaVencimento(currentContrato.faixaVencimento)}
            </span>
          </div>

          <div className="overflow-hidden rounded-[10px] border border-border bg-surface-2">
            <div className={`h-1.5 ${getFaixaTone(currentContrato.faixaVencimento)}`} />
            <div className="px-4 py-3">
              <p className="text-[13px] font-medium text-muted">
                Situação de vigência: <span className="text-text">{formatDiasParaVencimento(currentContrato.diasParaVencimento)}</span>
              </p>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5">
          <div className="grid gap-6">
            <Section title="Identificação">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField label="Modalidade" value={textoOuNaoInformado(currentContrato.modalidade)} />
                <DetailField label="Nº Modalidade" value={textoOuNaoInformado(currentContrato.numeroModalidade)} />
                <DetailField label="Processo" value={textoOuNaoInformado(currentContrato.processo)} />
                <DetailField label="Contrato" value={textoOuNaoInformado(currentContrato.contrato)} />
                <div className="sm:col-span-2">
                  <DetailField label="Empresa contratada" value={textoOuNaoInformado(currentContrato.empresaContratada)} />
                </div>
              </div>
            </Section>

            <Section title="Financeiro">
              <div className="surface-card-plain grid gap-3 p-4">
                <DetailField label="Valor" value={formatMoedaBRL(currentContrato.valor)} strong />
                <DetailField label="Valor (descrição)" value={textoOuNaoInformado(currentContrato.valorDescricao)} />
              </div>
            </Section>

            <Section title="Vigência">
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailField label="Data de início" value={formatDataOuTraco(currentContrato.dataInicio)} />
                  <DetailField label="Data de vencimento" value={formatDataOuTraco(currentContrato.dataVencimento)} />
                  <DetailField
                    label="Dias p/ vencimento"
                    value={formatDiasParaVencimento(currentContrato.diasParaVencimento)}
                  />
                </div>

                <div className="surface-card-plain grid gap-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-medium text-text">Andamento da vigência</p>
                    <p className="text-[13px] text-muted">
                      {vigenciaPercentual === null ? 'Sem cálculo disponível' : `${Math.round(vigenciaPercentual)}%`}
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-surface-2">
                    <div
                      className="h-2 rounded-full bg-brand-700 transition-all"
                      style={{ width: `${vigenciaPercentual ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Gestão">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField label="Gestor" value={textoOuNaoInformado(currentContrato.gestor)} />
                <DetailField label="Fiscal" value={textoOuNaoInformado(currentContrato.fiscal)} />
              </div>
            </Section>

            <Section title="Observações">
              <div className="rounded-[10px] border border-border bg-surface-2 px-4 py-4">
                <p className="text-[14px] leading-6 text-muted">{textoOuNaoInformado(currentContrato.observacoes)}</p>
              </div>
            </Section>

            <Section title="Integridade">
              {camposPendentes.length > 0 ? (
                <div className="grid gap-2 rounded-[10px] border border-border bg-surface-2 px-4 py-4">
                  {camposPendentes.map((campo) => (
                    <p key={campo} className="text-[13px] text-muted">
                      Não informado: {campo}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="rounded-[10px] border border-border bg-surface-2 px-4 py-4">
                  <p className="text-[13px] text-muted">Registro com campos essenciais preenchidos.</p>
                </div>
              )}
            </Section>
          </div>
        </div>

        <footer className="border-t border-border px-4 py-4 pb-[calc(var(--safe-bottom)+16px)] lg:px-6 lg:pb-5">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!currentContrato.contrato}
            className="button-secondary focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <ClipboardIcon className="h-4 w-4" />
            <span>{copied ? 'Número copiado' : 'Copiar Nº do contrato'}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
