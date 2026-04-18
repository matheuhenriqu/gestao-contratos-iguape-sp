import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FaixaVencimento } from '../../types/contrato';
import type {
  FaixaVencimentoFiltro,
  FiltroChip,
  FiltrosContratosState,
  StatusFiltro,
} from '../../hooks/useFiltros';
import { EMPTY_OPTION_VALUE } from '../../hooks/useContratos';
import {
  formatFaixaVencimento,
  formatNumeroInteiro,
  formatStatusNormalizado,
} from '../../utils/format';
import {
  FilterIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from '../shared/icons';

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
  { value: 'sem_status', label: 'Sem vencimento calculado' },
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
      <span className="sr-only">Busca geral</span>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field-base pl-9 pr-3"
        aria-label="Buscar por objeto, empresa, contrato, processo, gestor ou fiscal"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="field-label">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="field-base">
        {children}
      </select>
    </label>
  );
}

function OptionSelect({
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
    <SelectField label={label} value={value} onChange={onChange}>
      <option value="todos">Todos</option>
      <option value={EMPTY_OPTION_VALUE}>Não informado</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </SelectField>
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
      className="flex min-h-11 items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-base text-text transition hover:border-primary-200"
    >
      <span>{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-pill transition ${
          checked ? 'bg-primary-600' : 'bg-surface-3'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-pill bg-surface shadow-soft transition ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
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
          className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-pill border border-primary-200 bg-primary-50 px-3 text-xs font-medium text-primary-800 transition hover:border-primary-600"
        >
          <span className="truncate">{chip.label}</span>
          <XIcon className="h-3.5 w-3.5 shrink-0" />
        </button>
      ))}
    </div>
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
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <SelectField
        label="Status"
        value={filtros.status}
        onChange={(value) => onFilterChange('status', value as StatusFiltro)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <OptionSelect
        label="Modalidade"
        value={filtros.modalidade}
        options={options.modalidades}
        onChange={(value) => onFilterChange('modalidade', value)}
      />

      <OptionSelect
        label="Empresa contratada"
        value={filtros.empresaContratada}
        options={options.empresas}
        onChange={(value) => onFilterChange('empresaContratada', value)}
      />

      <OptionSelect
        label="Gestor"
        value={filtros.gestor}
        options={options.gestores}
        onChange={(value) => onFilterChange('gestor', value)}
      />

      <OptionSelect
        label="Fiscal"
        value={filtros.fiscal}
        options={options.fiscais}
        onChange={(value) => onFilterChange('fiscal', value)}
      />

      <SelectField
        label="Faixa de vencimento"
        value={filtros.faixaVencimento}
        onChange={(value) =>
          onFilterChange('faixaVencimento', value as Exclude<FaixaVencimento, null> | 'todos')
        }
      >
        {FAIXA_VENCIMENTO_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-2">
          <span className="field-label">Valor mínimo</span>
          <input
            value={filtros.valorMin}
            onChange={(event) => onFilterChange('valorMin', event.target.value)}
            placeholder="R$ 0,00"
            inputMode="decimal"
            className="field-base"
          />
        </label>

        <label className="grid gap-2">
          <span className="field-label">Valor máximo</span>
          <input
            value={filtros.valorMax}
            onChange={(event) => onFilterChange('valorMax', event.target.value)}
            placeholder="R$ 999.999,99"
            inputMode="decimal"
            className="field-base"
          />
        </label>
      </div>

      <div className="grid gap-2">
        <span className="field-label">Pendência de dados</span>
        <ToggleField
          label="Apenas contratos pendentes"
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

  useEffect(() => {
    if (filtrosAtivos > 0) {
      setDesktopExpanded(true);
    }
  }, [filtrosAtivos]);

  const resultLabel = useMemo(
    () =>
      `Exibindo ${formatNumeroInteiro(totalResultados)} de ${formatNumeroInteiro(totalRegistros)} contratos`,
    [totalResultados, totalRegistros],
  );

  return (
    <>
      <section className="hidden lg:block">
        <div className="surface-card flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <SearchField
              value={filtros.busca}
              onChange={(value) => onFilterChange('busca', value)}
              placeholder="Buscar por objeto, empresa, contrato, processo…"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDesktopExpanded((current) => !current)}
                className="button-secondary shrink-0"
                aria-expanded={desktopExpanded}
                aria-controls="desktop-filtros-avancados"
              >
                <SlidersHorizontalIcon className="h-4 w-4" />
                <span>Filtros</span>
                {filtrosAtivos > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary-600 px-1.5 text-xs font-semibold text-text-inverse">
                    {filtrosAtivos}
                  </span>
                ) : null}
              </button>

              {filtrosAtivos > 0 ? (
                <button type="button" onClick={onClear} className="button-ghost shrink-0">
                  Limpar
                </button>
              ) : null}
            </div>
          </div>

          {desktopExpanded ? (
            <div
              id="desktop-filtros-avancados"
              className="grid gap-4 rounded-lg border border-border-divider bg-surface-2/60 p-4"
            >
              <AdvancedFilters filtros={filtros} options={options} onFilterChange={onFilterChange} />
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border-divider pt-3 xl:flex-row xl:items-center xl:justify-between">
            <Chips chips={chipsAtivos} />
            <p role="status" aria-live="polite" className="tnum shrink-0 text-sm text-text-muted">
              {resultLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-[calc(var(--header-height-mobile)+var(--safe-top)+10px)] z-30 lg:hidden">
        <div className="surface-card flex items-center gap-2 p-3">
          <SearchField
            value={filtros.busca}
            onChange={(value) => onFilterChange('busca', value)}
            placeholder="Buscar por objeto, empresa, contrato…"
          />

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="icon-button shrink-0"
            aria-label="Abrir filtros"
          >
            <span className="relative">
              <FilterIcon className="h-5 w-5" />
              {filtrosAtivos > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary-600 px-1 text-xs font-semibold text-text-inverse">
                  {filtrosAtivos}
                </span>
              ) : null}
            </span>
          </button>
        </div>
      </section>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-[rgba(15,23,42,.35)] backdrop-blur-[4px] lg:hidden"
          role="presentation"
          onClick={() => setMobileOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filtros-title"
            className="absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col rounded-t-xl bg-surface shadow-drawer fade-in"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-center py-2">
              <span className="h-1 w-9 rounded-pill bg-border-strong" />
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-border px-4 pb-4">
              <div>
                <h2 id="mobile-filtros-title" className="text-xl font-semibold text-text">
                  Filtros
                </h2>
                <p role="status" aria-live="polite" className="text-sm text-text-muted">
                  {resultLabel}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {filtrosAtivos > 0 ? (
                  <button type="button" onClick={onClear} className="button-ghost">
                    Limpar
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="icon-button"
                  aria-label="Fechar filtros"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <span className="field-label">Busca</span>
                  <SearchField
                    value={filtros.busca}
                    onChange={(value) => onFilterChange('busca', value)}
                    placeholder="Buscar por objeto, empresa, contrato…"
                  />
                </div>

                <div className="grid gap-6">
                  <AdvancedFilters filtros={filtros} options={options} onFilterChange={onFilterChange} />
                </div>

                <div className="grid gap-3">
                  <span className="field-label">Filtros ativos</span>
                  <Chips chips={chipsAtivos} />
                </div>
              </div>
            </div>

            <div
              className="border-t border-border bg-surface px-4 py-3"
              style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}
            >
              <button type="button" onClick={() => setMobileOpen(false)} className="button-primary w-full">
                Ver {formatNumeroInteiro(totalResultados)} resultado{totalResultados === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
