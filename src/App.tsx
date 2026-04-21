import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FiltersBar } from './components/filters/FiltersBar';
import { IndicatorCards } from './components/indicators/IndicatorCards';
import { BackToTop } from './components/layout/BackToTop';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SectionHeader } from './components/layout/SectionHeader';
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
  action,
}: {
  icon: ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-border-divider bg-surface px-4 py-14 text-center shadow-soft">
      <div className="grid gap-3">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-pill bg-primary-50 text-primary-700">
          {icon}
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-text">{title}</h3>
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
    paginaAtualVencidos,
    totalPaginasVencidos,
    totalResultadosVencidos,
    paginaVencidos,
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
    definirPaginaVencidos,
    definirItensPorPagina,
    ativarKpi,
  } = useFiltros(contratos);

  const [compactMode, setCompactMode] = useState(false);
  const [contratoSelecionadoId, setContratoSelecionadoId] = useState<string | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const tableSectionRef = useRef<HTMLElement | null>(null);
  const vencidosSectionRef = useRef<HTMLElement | null>(null);

  const contratosIds = useMemo(() => new Set(contratos.map((contrato) => contrato.id)), [contratos]);

  useContratoHash(contratosIds, setContratoSelecionadoId);

  const contratoSelecionado = contratoSelecionadoId ? contratosById.get(contratoSelecionadoId) ?? null : null;
  const activeKpi = buildActiveKpi(filtrosAtivos, filtros);

  function scrollToTable() {
    tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scrollToVencidos() {
    vencidosSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      scrollToVencidos();
      return;
    }

    if (status === 'critico') {
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

  function handleKpiSelect(
    alvo: 'total' | 'valor' | 'ativos' | 'vencidos' | 'proximos' | 'incompletos',
  ) {
    ativarKpi(alvo);
    if (alvo === 'vencidos') {
      scrollToVencidos();
    }
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
        className="app-shell grid gap-6 pb-[calc(var(--safe-bottom)+32px)] pt-6 md:gap-8 md:pt-8"
      >
        {isLoading ? (
          <>
            <div className="grid gap-3">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-7 w-72" />
              <SkeletonBlock className="h-4 w-full max-w-lg" />
            </div>

            <section className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 min-[1100px]:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="surface-card grid min-h-[92px] gap-2 p-3.5 md:min-h-[104px] md:p-4">
                  <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="h-7 w-7 rounded-md" />
                  </div>
                  <SkeletonBlock className="h-7 w-20" />
                </div>
              ))}
            </section>

            <div className="surface-card grid gap-4 p-5">
              <div className="flex gap-3">
                <SkeletonBlock className="h-11 flex-1" />
                <SkeletonBlock className="h-11 w-32" />
              </div>
              <SkeletonBlock className="h-28 w-full" />
            </div>

            <div className="surface-card grid gap-4 p-5">
              <SkeletonBlock className="h-5 w-52" />
              <SkeletonBlock className="h-[420px] w-full" />
            </div>
          </>
        ) : contratos.length === 0 ? (
          <section className="grid gap-4">
            <EmptyState
              icon={<DatabaseIcon className="h-5 w-5" />}
              title="Nenhum contrato cadastrado"
            />
          </section>
        ) : (
          <div className="stagger grid gap-6 md:gap-8 xl:gap-10">
            <section className="grid gap-3">
              <IndicatorCards metricas={metricas} activeKpi={activeKpi} onSelect={handleKpiSelect} />
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

            <section ref={tableSectionRef} className="anchor-offset grid gap-4">
              <SectionHeader
                title="Contratos vigentes"
                trailing={
                  <span className="tnum inline-flex items-center rounded-pill border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted">
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-pill bg-primary-600" />
                    {formatNumeroInteiro(totalResultados)} no recorte
                  </span>
                }
              />

              {totalResultados === 0 && totalResultadosVencidos === 0 ? (
                <EmptyState
                  icon={<SearchIcon className="h-5 w-5" />}
                  title="Nenhum contrato encontrado"
                  action={
                    <button type="button" onClick={limparFiltros} className="button-primary">
                      Limpar filtros
                    </button>
                  }
                />
              ) : totalResultados === 0 ? (
                <EmptyState
                  icon={<SearchIcon className="h-5 w-5" />}
                  title="Nenhum contrato vigente"
                  action={
                    <button type="button" onClick={scrollToVencidos} className="button-secondary">
                      {totalResultadosVencidos === 1
                        ? 'Ver 1 contrato vencido'
                        : `Ver ${formatNumeroInteiro(totalResultadosVencidos)} contratos vencidos`}
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

            {totalResultadosVencidos > 0 ? (
              <section
                ref={vencidosSectionRef}
                id="contratos-vencidos"
                className="anchor-offset grid gap-4"
              >
                <SectionHeader
                  title="Contratos vencidos"
                  tone="danger"
                  trailing={
                    <span className="tnum inline-flex items-center rounded-pill border border-status-critical/40 bg-status-criticalBg px-3 py-1.5 text-sm font-medium text-status-critical">
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-pill bg-status-critical" />
                      {formatNumeroInteiro(totalResultadosVencidos)} vencido
                      {totalResultadosVencidos === 1 ? '' : 's'}
                    </span>
                  }
                />

                <ContratosTable
                  contratos={paginaVencidos}
                  totalResultados={totalResultadosVencidos}
                  paginaAtual={paginaAtualVencidos}
                  totalPaginas={totalPaginasVencidos}
                  itensPorPagina={itensPorPagina}
                  ordenacao={ordenacao}
                  compactMode={compactMode}
                  onToggleCompactMode={() => setCompactMode((current) => !current)}
                  onSort={alternarOrdenacao}
                  onOpenDetail={(contrato) => openContrato(contrato.id)}
                  onPageChange={definirPaginaVencidos}
                  onPageSizeChange={definirItensPorPagina}
                />

                <ContratosMobileList
                  contratos={paginaVencidos}
                  totalResultados={totalResultadosVencidos}
                  paginaAtual={paginaAtualVencidos}
                  totalPaginas={totalPaginasVencidos}
                  itensPorPagina={itensPorPagina}
                  ordenacao={ordenacao}
                  onSortChange={definirOrdenacao}
                  onOpenDetail={(contrato) => openContrato(contrato.id)}
                  onPageChange={definirPaginaVencidos}
                  onPageSizeChange={definirItensPorPagina}
                />
              </section>
            ) : null}

            <section className="grid gap-4">
              <SectionHeader title="Análise visual" />

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
          </div>
        )}
      </main>

      <Footer />

      <BackToTop />

      {contratoSelecionado ? (
        <Suspense fallback={null}>
          <LazyContratoDetail contrato={contratoSelecionado} onClose={closeContrato} />
        </Suspense>
      ) : null}
    </div>
  );
}

export default App;
