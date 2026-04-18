import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FiltersBar } from './components/filters/FiltersBar';
import { IndicatorCards } from './components/indicators/IndicatorCards';
import { Header } from './components/layout/Header';
import { ContratosMobileList } from './components/table/ContratosMobileList';
import { ContratosTable } from './components/table/ContratosTable';
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
  return <div className={`animate-pulse rounded-[10px] bg-surface-2 ${className}`} />;
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

  const contratosIds = useMemo(() => new Set(contratos.map((contrato) => contrato.id)), [contratos]);

  useContratoHash(contratosIds, setContratoSelecionadoId);

  const contratoSelecionado = contratoSelecionadoId ? contratosById.get(contratoSelecionadoId) ?? null : null;
  const activeKpi = buildActiveKpi(filtrosAtivos, filtros);

  function openContrato(id: string) {
    const activeElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lastTriggerRef.current = activeElement;
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#contrato/${encodeURIComponent(id)}`);
    setContratoSelecionadoId(id);
  }

  function closeContrato() {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setContratoSelecionadoId(null);
    window.setTimeout(() => lastTriggerRef.current?.focus(), 0);
  }

  const chartsLoadingFallback = (
    <section className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="surface-card grid gap-4 p-4 lg:p-5">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-6 w-52" />
          <SkeletonBlock className="h-[240px] w-full lg:h-[280px]" />
        </div>
      ))}
    </section>
  );

  return (
    <div className="min-h-[100svh] bg-bg text-text">
      <Header />

      <main
        id="conteudo-principal"
        className="app-shell grid gap-4 pb-[calc(var(--safe-bottom)+24px)] pt-4 lg:gap-5 lg:pt-5"
      >
        {isLoading ? (
          <>
            <section className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="surface-card grid gap-3 p-5 lg:p-6">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-8 w-36" />
                  <SkeletonBlock className="h-4 w-32" />
                </div>
              ))}
            </section>

            <div className="surface-card grid gap-4 p-4">
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-28 w-full" />
            </div>

            <div className="surface-card grid gap-4 p-4">
              <SkeletonBlock className="h-6 w-52" />
              <SkeletonBlock className="h-[420px] w-full" />
            </div>
          </>
        ) : (
          <>
            <IndicatorCards metricas={metricas} activeKpi={activeKpi} onSelect={ativarKpi} />

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

            <section className="grid gap-4">
              <div className="surface-card grid gap-4 overflow-hidden p-4 lg:p-5">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                  <div className="grid gap-1">
                    <p className="field-label">Base de contratos</p>
                    <h2 className="text-[20px] font-semibold text-text">Consulta operacional da Prefeitura</h2>
                    <p className="max-w-4xl text-[14px] leading-6 text-muted">
                      Tabela e lista mobile agrupadas por modalidade, com ordenação, paginação e leitura rápida para rotinas administrativas.
                    </p>
                  </div>
                  <p className="text-[13px] font-medium text-muted">
                    Exibindo {formatNumeroInteiro(totalResultados)} contrato{totalResultados === 1 ? '' : 's'} após filtros
                  </p>
                </div>

                {totalResultados === 0 ? (
                  <div className="grid place-items-center rounded-[10px] border border-border bg-surface-2 px-4 py-16 text-center">
                    <div className="grid gap-3">
                      <h3 className="text-[20px] font-semibold text-text">Nenhum contrato encontrado</h3>
                      <p className="text-[14px] text-muted">
                        Ajuste os filtros ativos ou volte para a visão completa da base.
                      </p>
                      <div>
                        <button type="button" onClick={limparFiltros} className="button-primary px-4">
                          Limpar filtros
                        </button>
                      </div>
                    </div>
                  </div>
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
              </div>

              <div data-testid="charts-section">
                <Suspense fallback={chartsLoadingFallback}>
                  <LazyChartsSection
                    contratos={contratosFiltrados}
                    onSelectStatus={(status) => aplicarFiltros({ status })}
                    onSelectModalidade={(modalidade) =>
                      aplicarFiltros({
                        modalidade: modalidade === 'Não informado' ? EMPTY_OPTION_VALUE : modalidade,
                      })
                    }
                    onSelectFaixa={(faixa) => aplicarFiltros({ faixaVencimento: faixa })}
                    onSelectEmpresa={(empresa) =>
                      aplicarFiltros({
                        empresaContratada: empresa === 'Não informado' ? EMPTY_OPTION_VALUE : empresa,
                      })
                    }
                  />
                </Suspense>
              </div>
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
