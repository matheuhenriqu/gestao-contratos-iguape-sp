import { useEffect, useMemo, useState } from 'react';
import type { FaixaVencimento } from '../../types/contrato';
import type {
  FaixaVencimentoFiltro,
  FiltroChip,
  FiltrosContratosState,
  StatusFiltro,
} from '../../hooks/useFiltros';
import { EMPTY_OPTION_VALUE } from '../../hooks/useContratos';
import { formatFaixaVencimento, formatNumeroInteiro, formatStatusNormalizado } from '../../utils/format';
import { FilterIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from '../shared/icons';

type FiltersBarProps = {
  filtros: FiltrosContratosState;
  totalResultados: number;
  totalRegistros: number;
  filtrosAtivos: number;
  chipsAtivos: FiltroChip[];
  options: {
    modalidades: string[];
    empresas: string[];
    gestores: string[];
    fiscais: string[];
  };
  onFilterChange: <K extends keyof FiltrosContratosState>(
    campo: K,
    value: FiltrosContratosState[K],
  ) => void;
  onClear: () => void;
};

const STATUS_OPTIONS: Array<{ value: StatusFiltro; label: string }> = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'ativo', label: formatStatusNormalizado('ativo') },
  { value: 'vence_hoje', label: formatStatusNormalizado('vence_hoje') },
  { value: 'vencido', label: formatStatusNormalizado('vencido') },
  { value: 'sem_status', label: 'Sem status calculado' },
];

const FAIXA_VENCIMENTO_OPTIONS: Array<{ value: FaixaVencimentoFiltro; label: string }> = [
  { value: 'todos', label: 'Todas as faixas' },
  { value: 'vencidos', label: formatFaixaVencimento('vencidos') },
  { value: 'vencem_hoje', label: formatFaixaVencimento('vencem_hoje') },
  { value: 'ate_7', label: formatFaixaVencimento('ate_7') },
  { value: 'ate_30', label: formatFaixaVencimento('ate_30') },
  { value: 'ate_60', label: formatFaixaVencimento('ate_60') },
  { value: 'ate_90', label: formatFaixaVencimento('ate_90') },
  { value: 'acima_90', label: formatFaixaVencimento('acima_90') },
];

function fieldClass() {
  return 'field-base focus-ring';
}

function FieldLabel({ children }: { children: string }) {
  return <span className="field-label">{children}</span>;
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative flex min-w-0 flex-1">
      <span className="sr-only">Buscar contratos</span>
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${fieldClass()} min-h-11 w-full rounded-md pl-11 pr-4 text-[14px]`}
        aria-label="Buscar por objeto, empresa, contrato, processo, gestor ou fiscal"
      />
    </label>
  );
}

function OptionField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass()}>
        <option value="todos">Todos</option>
        <option value={EMPTY_OPTION_VALUE}>Não informado</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Chips({ chips }: { chips: FiltroChip[] }) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.onRemove}
          className="focus-ring inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-border bg-surface px-3 text-[13px] font-medium text-muted transition hover:border-brand-600 hover:text-brand-700"
        >
          <span className="truncate">{chip.label}</span>
          <XIcon className="h-3.5 w-3.5 shrink-0" />
        </button>
      ))}
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`focus-ring flex min-h-11 w-full items-center justify-between rounded-md border px-4 text-[14px] font-medium transition ${
        checked
          ? 'border-brand-600 bg-primary-100 text-brand-700'
          : 'border-border bg-surface text-muted hover:border-brand-600/50'
      }`}
    >
      <span>{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? 'bg-brand-600' : 'bg-border-strong'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-soft transition ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}

function AdvancedFilters({
  filtros,
  options,
  onFilterChange,
}: {
  filtros: FiltersBarProps['filtros'];
  options: FiltersBarProps['options'];
  onFilterChange: FiltersBarProps['onFilterChange'];
}) {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <label className="flex min-w-0 flex-col gap-2">
        <FieldLabel>Status</FieldLabel>
        <select
          value={filtros.status}
          onChange={(event) => onFilterChange('status', event.target.value as StatusFiltro)}
          className={fieldClass()}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <OptionField
        label="Modalidade"
        value={filtros.modalidade}
        options={options.modalidades}
        onChange={(value) => onFilterChange('modalidade', value)}
      />

      <OptionField
        label="Empresa contratada"
        value={filtros.empresaContratada}
        options={options.empresas}
        onChange={(value) => onFilterChange('empresaContratada', value)}
      />

      <OptionField
        label="Gestor"
        value={filtros.gestor}
        options={options.gestores}
        onChange={(value) => onFilterChange('gestor', value)}
      />

      <OptionField
        label="Fiscal"
        value={filtros.fiscal}
        options={options.fiscais}
        onChange={(value) => onFilterChange('fiscal', value)}
      />

      <label className="flex min-w-0 flex-col gap-2">
        <FieldLabel>Faixa de vencimento</FieldLabel>
        <select
          value={filtros.faixaVencimento}
          onChange={(event) =>
            onFilterChange('faixaVencimento', event.target.value as Exclude<FaixaVencimento, null> | 'todos')
          }
          className={fieldClass()}
        >
          {FAIXA_VENCIMENTO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex min-w-0 flex-col gap-2">
          <FieldLabel>Valor mínimo</FieldLabel>
          <input
            value={filtros.valorMin}
            onChange={(event) => onFilterChange('valorMin', event.target.value)}
            placeholder="R$ 0,00"
            inputMode="decimal"
            className={fieldClass()}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-2">
          <FieldLabel>Valor máximo</FieldLabel>
          <input
            value={filtros.valorMax}
            onChange={(event) => onFilterChange('valorMax', event.target.value)}
            placeholder="R$ 999.999,99"
            inputMode="decimal"
            className={fieldClass()}
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 xl:justify-end">
        <FieldLabel>Pendência de dados</FieldLabel>
        <ToggleField
          label="Apenas dados incompletos"
          checked={filtros.apenasDadosIncompletos}
          onChange={(checked) => onFilterChange('apenasDadosIncompletos', checked)}
        />
      </div>
    </div>
  );
}

export function FiltersBar({
  filtros,
  totalResultados,
  totalRegistros,
  filtrosAtivos,
  chipsAtivos,
  options,
  onFilterChange,
  onClear,
}: FiltersBarProps) {
  const [desktopExpanded, setDesktopExpanded] = useState(filtrosAtivos > 0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const resultLabel = useMemo(
    () =>
      `Exibindo ${formatNumeroInteiro(totalResultados)} de ${formatNumeroInteiro(totalRegistros)} contratos`,
    [totalRegistros, totalResultados],
  );

  return (
    <>
      <section className="hidden lg:block">
        <div className="surface-card flex flex-col gap-4 p-4 lg:p-4">
          <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <SearchField
                value={filtros.busca}
                onChange={(value) => onFilterChange('busca', value)}
                placeholder="Buscar por objeto, empresa, contrato, processo…"
              />

              <button
                type="button"
                onClick={() => setDesktopExpanded((current) => !current)}
                className="button-secondary focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 px-4"
                aria-expanded={desktopExpanded}
                aria-controls="desktop-filtros-avancados"
              >
                <SlidersHorizontalIcon className="h-4 w-4" />
                <span>Filtros</span>
                {filtrosAtivos > 0 ? (
                  <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[12px] font-semibold text-white">
                    {filtrosAtivos}
                  </span>
                ) : null}
              </button>

              {filtrosAtivos > 0 ? (
                <button type="button" onClick={onClear} className="button-ghost focus-ring min-h-11 px-4">
                  Limpar
                </button>
              ) : null}
            </div>

            <p className="text-[13px] font-medium text-muted">{resultLabel}</p>
          </div>

          {desktopExpanded ? (
            <div id="desktop-filtros-avancados" className="grid gap-4 border-t border-border pt-4">
              <AdvancedFilters filtros={filtros} options={options} onFilterChange={onFilterChange} />
            </div>
          ) : null}

          <Chips chips={chipsAtivos} />
        </div>
      </section>

      <section className="sticky top-[calc(var(--header-height-mobile)+var(--safe-top)+8px)] z-30 lg:hidden">
        <div className="surface-card flex flex-col gap-3 p-3">
          <div className="flex items-center gap-3">
            <SearchField
              value={filtros.busca}
              onChange={(value) => onFilterChange('busca', value)}
              placeholder="Buscar contratos"
            />

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="focus-ring inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted transition hover:border-brand-600 hover:text-brand-700"
              aria-label="Abrir filtros"
            >
              <div className="relative">
                <FilterIcon className="h-5 w-5" />
                {filtrosAtivos > 0 ? (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[11px] font-semibold text-white">
                    {filtrosAtivos}
                  </span>
                ) : null}
              </div>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-medium text-muted">{resultLabel}</p>
            <Chips chips={chipsAtivos} />
          </div>
        </div>
      </section>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          role="presentation"
          onClick={() => setMobileOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filtros-title"
            className="absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col rounded-t-[12px] bg-surface shadow-raised"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-center py-2">
              <span className="h-1.5 w-12 rounded-full bg-border-strong" />
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-border px-4 pb-4">
              <div>
                <h2 id="mobile-filtros-title" className="text-[18px] font-semibold text-text">
                  Filtros
                </h2>
                <p className="text-[13px] text-muted">{resultLabel}</p>
              </div>

              <div className="flex items-center gap-2">
                {filtrosAtivos > 0 ? (
                  <button type="button" onClick={onClear} className="button-ghost focus-ring min-h-11 px-3">
                    Limpar
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-surface text-muted"
                  aria-label="Fechar filtros"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-4 pb-6 pt-4">
              <div className="grid gap-5">
                <div className="grid gap-3">
                  <FieldLabel>Busca geral</FieldLabel>
                  <SearchField
                    value={filtros.busca}
                    onChange={(value) => onFilterChange('busca', value)}
                    placeholder="Objeto, empresa, contrato, processo…"
                  />
                </div>

                <AdvancedFilters filtros={filtros} options={options} onFilterChange={onFilterChange} />

                <div className="grid gap-3">
                  <FieldLabel>Filtros ativos</FieldLabel>
                  <Chips chips={chipsAtivos} />
                </div>
              </div>
            </div>

            <div className="border-t border-border px-4 pb-[calc(var(--safe-bottom)+16px)] pt-4">
              <button type="button" onClick={() => setMobileOpen(false)} className="button-primary focus-ring w-full min-h-11">
                Ver {formatNumeroInteiro(totalResultados)} resultado{totalResultados === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
