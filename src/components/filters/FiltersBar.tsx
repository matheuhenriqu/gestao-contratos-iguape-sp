import { useState } from 'react';
import type { FaixaVencimento } from '../../types/contrato';
import type {
  FaixaVencimentoFiltro,
  FaixaValorFiltro,
  FiltrosContratosState,
  OrdenacaoCampo,
  OrdenacaoDirecao,
  StatusFiltro,
} from '../../hooks/useFiltros';
import { EMPTY_OPTION_VALUE } from '../../hooks/useContratos';
import { formatFaixaVencimento, formatNumeroInteiro, formatStatusNormalizado } from '../../utils/format';

type FiltersBarProps = {
  filtros: FiltrosContratosState;
  totalResultados: number;
  totalRegistros: number;
  filtrosAtivos: number;
  options: {
    modalidades: string[];
    empresas: string[];
    gestores: string[];
    fiscais: string[];
  };
  ordenacao: {
    campo: OrdenacaoCampo;
    direcao: OrdenacaoDirecao;
  };
  onBuscaChange: (value: string) => void;
  onFilterChange: <K extends keyof FiltrosContratosState>(
    campo: K,
    value: FiltrosContratosState[K],
  ) => void;
  onSortChange: (campo: OrdenacaoCampo, direcao: OrdenacaoDirecao) => void;
  onClear: () => void;
};

const FIELD_CLASS =
  'w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-iguape-400 focus:ring-4 focus:ring-iguape-100';

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

const FAIXA_VALOR_OPTIONS: Array<{ value: FaixaValorFiltro; label: string }> = [
  { value: 'todos', label: 'Todas as faixas de valor' },
  { value: 'ate_50000', label: 'Até R$ 50 mil' },
  { value: '50000_250000', label: 'De R$ 50 mil a R$ 250 mil' },
  { value: '250000_1000000', label: 'De R$ 250 mil a R$ 1 milhão' },
  { value: 'acima_1000000', label: 'Acima de R$ 1 milhão' },
  { value: 'sem_valor', label: 'Sem valor informado' },
];

const SORT_OPTIONS: Array<{ value: `${OrdenacaoCampo}:${OrdenacaoDirecao}`; label: string }> = [
  { value: 'dataVencimento:asc', label: 'Ordenar por vencimento mais próximo' },
  { value: 'dataVencimento:desc', label: 'Ordenar por vencimento mais distante' },
  { value: 'valor:desc', label: 'Ordenar por maior valor' },
  { value: 'valor:asc', label: 'Ordenar por menor valor' },
  { value: 'objeto:asc', label: 'Ordenar por objeto (A-Z)' },
  { value: 'empresaContratada:asc', label: 'Ordenar por empresa (A-Z)' },
];

type OptionFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  includeNotInformed?: boolean;
};

function OptionField({
  label,
  value,
  onChange,
  options,
  includeNotInformed = true,
}: OptionFieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <select className={FIELD_CLASS} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="todos">Todos</option>
        {includeNotInformed ? <option value={EMPTY_OPTION_VALUE}>Não informado</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FiltersBar({
  filtros,
  totalResultados,
  totalRegistros,
  filtrosAtivos,
  options,
  ordenacao,
  onBuscaChange,
  onFilterChange,
  onSortChange,
  onClear,
}: FiltersBarProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <section className="rounded-[30px] border border-white/70 bg-white/92 p-4 shadow-panel ring-1 ring-iguape-100/80 backdrop-blur-sm sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-iguape-700">
                Filtros e ordenação
              </p>
              <span className="inline-flex min-h-9 items-center rounded-full bg-iguape-50 px-3 text-xs font-semibold text-iguape-700">
                {formatNumeroInteiro(totalResultados)} de {formatNumeroInteiro(totalRegistros)} contratos
              </span>
              {filtrosAtivos > 0 ? (
                <span className="inline-flex min-h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-600">
                  {formatNumeroInteiro(filtrosAtivos)} filtro{filtrosAtivos > 1 ? 's' : ''} ativo
                  {filtrosAtivos > 1 ? 's' : ''}
                </span>
              ) : null}
            </div>

            <label className="mt-3 flex min-w-0 flex-col gap-2">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Busca geral
              </span>
              <input
                type="search"
                value={filtros.busca}
                onChange={(event) => onBuscaChange(event.target.value)}
                placeholder="Buscar por objeto, empresa, contrato, processo, gestor ou fiscal"
                className={FIELD_CLASS}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Ordenação
              </span>
              <select
                className={FIELD_CLASS}
                value={`${ordenacao.campo}:${ordenacao.direcao}`}
                onChange={(event) => {
                  const [campo, direcao] = event.target.value.split(':') as [
                    OrdenacaoCampo,
                    OrdenacaoDirecao,
                  ];
                  onSortChange(campo, direcao);
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-end gap-3">
              <button
                type="button"
                onClick={() => setMobileExpanded((current) => !current)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-iguape-200 bg-iguape-50 px-4 text-sm font-semibold text-iguape-700 transition hover:bg-iguape-100 md:hidden"
              >
                {mobileExpanded ? 'Ocultar filtros' : 'Refinar consulta'}
              </button>

              <button
                type="button"
                onClick={onClear}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-iguape-300 hover:text-iguape-700"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </div>

        <div className={`${mobileExpanded ? 'grid' : 'hidden'} gap-3 md:grid md:grid-cols-2 xl:grid-cols-4`}>
          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Status
            </span>
            <select
              className={FIELD_CLASS}
              value={filtros.status}
              onChange={(event) => onFilterChange('status', event.target.value as StatusFiltro)}
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
            onChange={(value) => onFilterChange('modalidade', value)}
            options={options.modalidades}
          />

          <OptionField
            label="Empresa contratada"
            value={filtros.empresaContratada}
            onChange={(value) => onFilterChange('empresaContratada', value)}
            options={options.empresas}
          />

          <OptionField
            label="Gestor"
            value={filtros.gestor}
            onChange={(value) => onFilterChange('gestor', value)}
            options={options.gestores}
          />

          <OptionField
            label="Fiscal"
            value={filtros.fiscal}
            onChange={(value) => onFilterChange('fiscal', value)}
            options={options.fiscais}
          />

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Faixa de vencimento
            </span>
            <select
              className={FIELD_CLASS}
              value={filtros.faixaVencimento}
              onChange={(event) =>
                onFilterChange('faixaVencimento', event.target.value as FaixaVencimentoFiltro)
              }
            >
              {FAIXA_VENCIMENTO_OPTIONS.map((option) => (
                <option key={option.value ?? 'null'} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Faixa de valor
            </span>
            <select
              className={FIELD_CLASS}
              value={filtros.faixaValor}
              onChange={(event) => onFilterChange('faixaValor', event.target.value as FaixaValorFiltro)}
            >
              {FAIXA_VALOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Pendência de dados
            </span>
            <button
              type="button"
              aria-pressed={filtros.apenasDadosIncompletos}
              onClick={() => onFilterChange('apenasDadosIncompletos', !filtros.apenasDadosIncompletos)}
              className={`inline-flex min-h-[50px] items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition ${
                filtros.apenasDadosIncompletos
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-iguape-300 hover:text-iguape-700'
              }`}
            >
              <span>Apenas contratos com dados incompletos</span>
              <span
                className={`ml-4 inline-flex h-6 w-11 rounded-full p-1 transition ${
                  filtros.apenasDadosIncompletos ? 'bg-amber-300/80' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    filtros.apenasDadosIncompletos ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </label>
        </div>
      </div>
    </section>
  );
}
