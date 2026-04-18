import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FiltersBar } from './components/filters/FiltersBar';
import { IndicatorCards } from './components/indicators/IndicatorCards';
import { Header } from './components/layout/Header';
import { ContratosMobileList } from './components/table/ContratosMobileList';
import { ContratosTable } from './components/table/ContratosTable';
import { DatabaseIcon, SearchIcon } from './components/shared/icons';
import { EMPTY_OPTION_VALUE, useContratos } from './hooks/useContratos';
import { useFiltros } from './hooks/useFiltros';
import { formatNumeroInteiro } from './utils/format';

const LazyChartsSection = lazy(() =>
  import('./components/charts/ChartsSection').then((module) => ({ default: module.ChartsSection })),
);

const LazyContratoDetail = lazy(() =>
  import('./components/detail/ContratoDetail').then((module) => ({ default: module.ContratoDetail })),
);

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton-block shimmer ${className}`} />;
}

function useContratoHash(ids: Set<string>, onSelect: (id: string | null) => void) {
  useEffect(() => {
    function syncFromHash() {
      const match = /^#contrato\/(.+)$/.exec(window.location.hash);
      const decoded = match ? decodeURIComponent(match[1] ?? '') : null;

      if (decoded && ids.has(decoded)) {
        onSelect(decoded);
      } else {
        onSelect(null);
      }
    }

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [ids, onSelect]);
}

function buildActiveKpi(
  filtrosAtivos: number,
  filtros: ReturnType<typeof useFiltros>['filtros'],
): 'total' | 'valor' | 'ativos' | 'vencidos' | 'proximos' | 'incompletos' | null {
  if (filtrosAtivos === 0) {
    return null;
  }

  if (filtros.apenasComValor) {
    return 'valor';
  }

  if (filtros.status === 'ativo') {
    return 'ativos';
  }

  if (filtros.status === 'vencido') {
    return 'vencidos';
  }

  if (filtros.somenteProximos30) {
    return 'proximos';
  }

  if (filtros.apenasDadosIncompletos) {
    return 'incompletos';
  }

  return null;
}

function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-border-divider bg-surface px-4 py-16 text-center">
      <div className="grid max-w-md gap-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-surface-2 text-text-subtle">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-text">{title}</h3>
        <p className="text-base text-text-muted">{subtitle}</p>
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </div>
  );
}

function App() {
  const { contratos, contratosById, options, isLoading } = useContratos();
  const {
    filtros,
    ordenacao,
    paginaAtual,
    itensPorPagina,
    totalPaginas,
    totalResultados,
    pagina,
    contratosFiltrados,
    metricas,
    filtrosAtivos,
    chipsAtivos,
    atualizarFiltro,
    aplicarFiltros,
    limparFiltros,
    alternarOrdenacao,
    definirOrdenacao,
    definirPagina,
    definirItensPorPagina,
    ativarKpi,
  } = useFiltros(contratos);

  const [compactMode, setCompactMode] = useState(false);
  const [contratoSelecionadoId, setContratoSelecionadoId] = useState<string | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const tableSectionRef = useRef<HTMLElement | null>(null);

  const contratosIds = useMemo(() => new Set(contratos.map((contrato) => contrato.id)), [contratos]);

  useContratoHash(contratosIds, setContratoSelecionadoId);

  const contratoSelecionado = contratoSelecionadoId ? contratosById.get(contratoSelecionadoId) ?? null : null;
  const activeKpi = buildActiveKpi(filtrosAtivos, filtros);

  function scrollToTable() {
    tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openContrato(id: string) {
    const activeElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lastTriggerRef.current = activeElement;
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#contrato/${encodeURIComponent(id)}`,
    );
    setContratoSelecionadoId(id);
  }

  function closeContrato() {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setContratoSelecionadoId(null);
    window.setTimeout(() => lastTriggerRef.current?.focus(), 0);
  }

  function handleChartStatusSelect(status: 'vencido' | 'critico' | 'atencao' | 'ok' | 'sem_status') {
    if (status === 'vencido') {
      aplicarFiltros({ status: 'vencido', somenteProximos30: false, faixaVencimento: 'todos' });
    } else if (status === 'critico') {
      aplicarFiltros({ faixaVencimento: 'ate_7', status: 'todos', somenteProximos30: false });
    } else if (status === 'atencao') {
      aplicarFiltros({ faixaVencimento: 'ate_30', status: 'todos', somenteProximos30: false });
    } else if (status === 'ok') {
      aplicarFiltros({ status: 'ativo', faixaVencimento: 'todos', somenteProximos30: false });
    } else {
      aplicarFiltros({ status: 'sem_status', faixaVencimento: 'todos', somenteProximos30: false });
    }

    scrollToTable();
  }

  const chartsLoadingFallback = (
    <section className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="surface-card grid gap-4 p-4 md:p-5">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="h-[220px] w-full md:h-[260px]" />
        </div>
      ))}
    </section>
  );

  return (
    <div className="min-h-[100svh] bg-bg text-text">
      <Header />

      <main
        id="main"
        className="app-shell grid gap-4 pb-[calc(var(--safe-bottom)+24px)] pt-4 md:gap-6 md:pt-6"
      >
        {isLoading ? (
          <>
            <section className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 xl:gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="surface-card grid gap-3 p-4 md:p-5">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-8 w-36" />
                  <SkeletonBlock className="h-4 w-40" />
                </div>
              ))}
            </section>

            <div className="surface-card grid gap-4 p-4">
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-28 w-full" />
            </div>

            <div className="surface-card grid gap-4 p-4">
              <SkeletonBlock className="h-5 w-52" />
              <SkeletonBlock className="h-[420px] w-full" />
            </div>
          </>
        ) : contratos.length === 0 ? (
          <section className="grid gap-4">
            <EmptyState
              icon={<DatabaseIcon className="h-6 w-6" />}
              title="Nenhum contrato cadastrado"
              subtitle="A base oficial não retornou registros utilizáveis para exibição."
            />
          </section>
        ) : (
          <>
            <section className="grid gap-2">
              <span className="section-kicker">Painel executivo</span>
              <IndicatorCards metricas={metricas} activeKpi={activeKpi} onSelect={ativarKpi} />
            </section>

            <FiltersBar
              filtros={filtros}
              totalResultados={totalResultados}
              totalRegistros={contratos.length}
              filtrosAtivos={filtrosAtivos}
              chipsAtivos={chipsAtivos}
              options={options}
              onFilterChange={atualizarFiltro}
              onClear={limparFiltros}
            />

            <section ref={tableSectionRef} className="grid gap-4">
              <div className="grid gap-2">
                <span className="section-kicker">Consulta operacional</span>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div className="grid gap-1">
                    <h2 className="text-2xl font-semibold text-text">Base de contratos</h2>
                    <p className="text-base text-text-muted">
                      Leitura administrativa com filtros, ordenação, paginação e detalhe contextual.
                    </p>
                  </div>
                  <p className="tnum text-sm text-text-muted">
                    {formatNumeroInteiro(totalResultados)} contrato{totalResultados === 1 ? '' : 's'} no recorte atual
                  </p>
                </div>
              </div>

              {totalResultados === 0 ? (
                <EmptyState
                  icon={<SearchIcon className="h-6 w-6" />}
                  title="Nenhum contrato encontrado"
                  subtitle="Tente ajustar os filtros para ampliar ou refinar a consulta."
                  action={
                    <button type="button" onClick={limparFiltros} className="button-primary">
                      Limpar filtros
                    </button>
                  }
                />
              ) : (
                <>
                  <ContratosTable
                    contratos={pagina}
                    totalResultados={totalResultados}
                    paginaAtual={paginaAtual}
                    totalPaginas={totalPaginas}
                    itensPorPagina={itensPorPagina}
                    ordenacao={ordenacao}
                    compactMode={compactMode}
                    onToggleCompactMode={() => setCompactMode((current) => !current)}
                    onSort={alternarOrdenacao}
                    onOpenDetail={(contrato) => openContrato(contrato.id)}
                    onPageChange={definirPagina}
                    onPageSizeChange={definirItensPorPagina}
                  />

                  <ContratosMobileList
                    contratos={pagina}
                    totalResultados={totalResultados}
                    paginaAtual={paginaAtual}
                    totalPaginas={totalPaginas}
                    itensPorPagina={itensPorPagina}
                    ordenacao={ordenacao}
                    onSortChange={definirOrdenacao}
                    onOpenDetail={(contrato) => openContrato(contrato.id)}
                    onPageChange={definirPagina}
                    onPageSizeChange={definirItensPorPagina}
                  />
                </>
              )}
            </section>

            <section className="grid gap-2">
              <div className="grid gap-1">
                <span className="section-kicker">Análise visual</span>
                <h2 className="text-2xl font-semibold text-text">Recortes de gestão</h2>
              </div>

              <Suspense fallback={chartsLoadingFallback}>
                <LazyChartsSection
                  contratos={contratosFiltrados}
                  onSelectStatus={handleChartStatusSelect}
                  onSelectModalidade={(modalidade) => {
                    aplicarFiltros({
                      modalidade: modalidade === 'Não informado' ? EMPTY_OPTION_VALUE : modalidade,
                    });
                    scrollToTable();
                  }}
                  onSelectFaixa={(faixa) => {
                    aplicarFiltros({ faixaVencimento: faixa });
                    scrollToTable();
                  }}
                  onSelectEmpresa={(empresa) => {
                    aplicarFiltros({
                      empresaContratada: empresa === 'Não informado' ? EMPTY_OPTION_VALUE : empresa,
                    });
                    scrollToTable();
                  }}
                />
              </Suspense>
            </section>
          </>
        )}
      </main>

      {contratoSelecionado ? (
        <Suspense fallback={null}>
          <LazyContratoDetail contrato={contratoSelecionado} onClose={closeContrato} />
        </Suspense>
      ) : null}
    </div>
  );
}

export default App;
