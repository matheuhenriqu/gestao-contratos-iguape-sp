import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Contrato } from '../../types/contrato';
import {
  formatDataOuTraco,
  formatDiasParaVencimento,
  formatMoedaBRL,
  getCampoPendenteLabels,
  textoOuNaoInformado,
} from '../../utils/format';
import {
  getCriticidadeSurfaceClass,
  getCriticidadeTextClass,
  getFaixaTone,
  getStatusClasses,
  getStatusLabel,
} from '../shared/contratoAppearance';
import { ClipboardIcon, XIcon } from '../shared/icons';

type ContratoDetailProps = {
  contrato: Contrato | null;
  onClose: () => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <div className="grid gap-2">
        <span className="section-kicker">{title}</span>
        <div className="h-px bg-border-divider" />
      </div>
      {children}
    </section>
  );
}

function DetailField({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <span className="field-label">{label}</span>
      <span className={`${strong ? 'text-lg font-semibold text-text' : 'text-base text-text-muted'}`}>
        {value}
      </span>
    </div>
  );
}

function useDialogAccessibility(
  open: boolean,
  onClose: () => void,
  dialogRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const selectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusable = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(selectors) ?? []).filter(
        (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
      );

    const timer = window.setTimeout(() => focusable()[0]?.focus(), 0);

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

      if (event.shiftKey && first && last && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }

      if (!event.shiftKey && first && last && document.activeElement === last) {
        event.preventDefault();
        first.focus();
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
  const hoje = new Date();
  const total = vencimento.getTime() - inicio.getTime();

  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }

  const decorrido = hoje.getTime() - inicio.getTime();
  return Math.max(0, Math.min(100, (decorrido / total) * 100));
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
      className="fixed inset-0 z-50 bg-[rgba(15,23,42,.35)] backdrop-blur-[4px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contrato-detail-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col rounded-t-xl bg-surface shadow-drawer fade-in md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[520px] md:rounded-none md:rounded-l-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center py-2 md:hidden">
          <span className="h-1 w-9 rounded-pill bg-border-strong" />
        </div>

        <header className="sticky top-0 z-10 grid gap-3 border-b border-border bg-surface px-4 pb-4 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <span className="section-kicker">Contrato</span>
              <h2 id="contrato-detail-title" className="text-xl font-semibold text-text">
                {textoOuNaoInformado(currentContrato.contrato)}
              </h2>
              <p className="text-sm text-text-muted">
                {textoOuNaoInformado(currentContrato.modalidade)} · {textoOuNaoInformado(currentContrato.numeroModalidade)} ·{' '}
                {textoOuNaoInformado(currentContrato.processo)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="icon-button"
              aria-label="Fechar detalhe do contrato"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`status-pill ${getStatusClasses(currentContrato)}`}>{getStatusLabel(currentContrato)}</span>
            <span className={`status-pill ${getCriticidadeSurfaceClass(currentContrato.criticidade)}`}>
              {formatDiasParaVencimento(currentContrato.diasParaVencimento)}
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          <div className="grid gap-6">
            <Section title="Identificação">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailField label="Modalidade" value={textoOuNaoInformado(currentContrato.modalidade)} />
                  <DetailField label="Nº Modalidade" value={textoOuNaoInformado(currentContrato.numeroModalidade)} />
                  <DetailField label="Processo" value={textoOuNaoInformado(currentContrato.processo)} />
                  <DetailField label="Contrato" value={textoOuNaoInformado(currentContrato.contrato)} />
                </div>
                <DetailField
                  label="Empresa contratada"
                  value={textoOuNaoInformado(currentContrato.empresaContratada)}
                  strong
                />
              </div>
            </Section>

            <Section title="Financeiro">
              <div className="grid gap-2 rounded-lg border border-border bg-surface px-4 py-4 shadow-soft">
                <span className="field-label">Valor total</span>
                <span className="tnum text-2xl font-semibold text-text">{formatMoedaBRL(currentContrato.valor)}</span>
                {currentContrato.valorDescricao ? (
                  <span className="text-sm text-text-muted">{currentContrato.valorDescricao}</span>
                ) : null}
              </div>
            </Section>

            <Section title="Vigência">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailField label="Data início" value={formatDataOuTraco(currentContrato.dataInicio)} />
                  <DetailField label="Data vencimento" value={formatDataOuTraco(currentContrato.dataVencimento)} />
                </div>

                <div className="grid gap-3 rounded-lg border border-border bg-surface-2 px-4 py-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-text-muted">Andamento da vigência</span>
                    <span className={`font-medium ${getCriticidadeTextClass(currentContrato.criticidade)}`}>
                      {formatDiasParaVencimento(currentContrato.diasParaVencimento)}
                    </span>
                  </div>
                  <div className="h-2 rounded-pill bg-border-divider">
                    <div
                      className={`h-2 rounded-pill ${getFaixaTone(currentContrato.faixaVencimento)}`}
                      style={{ width: `${vigenciaPercentual ?? 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm text-text-subtle">
                    <span>Início {formatDataOuTraco(currentContrato.dataInicio)}</span>
                    <span>Vencimento {formatDataOuTraco(currentContrato.dataVencimento)}</span>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Gestão">
              <div className="grid gap-4 md:grid-cols-2">
                <DetailField label="Gestor" value={textoOuNaoInformado(currentContrato.gestor)} />
                <DetailField label="Fiscal" value={textoOuNaoInformado(currentContrato.fiscal)} />
              </div>
            </Section>

            <Section title="Objeto">
              <p className="whitespace-pre-wrap text-base text-text">{textoOuNaoInformado(currentContrato.objeto)}</p>
            </Section>

            {currentContrato.observacoes ? (
              <Section title="Observações">
                <div className="rounded-md border border-border-divider bg-surface-2 px-3 py-3 text-sm text-text-muted">
                  {currentContrato.observacoes}
                </div>
              </Section>
            ) : null}

            {camposPendentes.length > 0 ? (
              <Section title="Integridade dos dados">
                <div className="flex flex-wrap gap-2">
                  {camposPendentes.map((campo) => (
                    <span key={campo} className="status-pill bg-status-neutralBg text-status-neutral">
                      {campo}
                    </span>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        </div>

        <footer
          className="sticky bottom-0 border-t border-border bg-surface px-4 py-3 md:px-6"
          style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}
        >
            <button
              type="button"
              onClick={handleCopy}
            disabled={!currentContrato.contrato}
            className="button-secondary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ClipboardIcon className="h-4 w-4" />
            <span>{copied ? 'Copiado' : 'Copiar número'}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
