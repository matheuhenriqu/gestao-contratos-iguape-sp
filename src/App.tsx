import { useState } from 'react';
import { ChartModalidade } from './components/charts/ChartModalidade';
import { ChartStatus } from './components/charts/ChartStatus';
import { ChartTopEmpresasContratos } from './components/charts/ChartTopEmpresasContratos';
import { ChartTopEmpresasValor } from './components/charts/ChartTopEmpresasValor';
import { ChartVencimentos } from './components/charts/ChartVencimentos';
import { ContratoDetail } from './components/detail/ContratoDetail';
import { FiltersBar } from './components/filters/FiltersBar';
import { IndicatorCards } from './components/indicators/IndicatorCards';
import { Header } from './components/layout/Header';
import { ContratosMobileList } from './components/table/ContratosMobileList';
import { ContratosTable } from './components/table/ContratosTable';
import { useContratos } from './hooks/useContratos';
import { useFiltros } from './hooks/useFiltros';
import { formatNumeroInteiro } from './utils/format';

function App() {
  const { contratos, options } = useContratos();
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
    atualizarFiltro,
    atualizarBusca,
    limparFiltros,
    alternarOrdenacao,
    definirOrdenacao,
    definirPagina,
    definirItensPorPagina,
  } = useFiltros(contratos);
  const [contratoSelecionadoId, setContratoSelecionadoId] = useState<string | null>(null);

  const contratoSelecionado =
    contratos.find((contrato) => contrato.id === contratoSelecionadoId) ?? null;

  return (
    <div className="relative min-h-[100svh] overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_right,rgba(41,150,204,0.2),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[260px] bg-[linear-gradient(180deg,rgba(50,84,151,0.08),transparent)]" />

      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1520px] flex-col gap-5 px-[max(1rem,env(safe-area-inset-left))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:gap-6 sm:px-[max(1.5rem,env(safe-area-inset-left))] lg:px-[max(2rem,env(safe-area-inset-left))]">
        <Header
          totalContratos={contratos.length}
          totalResultados={totalResultados}
          filtrosAtivos={filtrosAtivos}
        />

        <IndicatorCards metricas={metricas} />

        <FiltersBar
          filtros={filtros}
          totalResultados={totalResultados}
          totalRegistros={contratos.length}
          filtrosAtivos={filtrosAtivos}
          options={options}
          ordenacao={ordenacao}
          onBuscaChange={atualizarBusca}
          onFilterChange={atualizarFiltro}
          onSortChange={definirOrdenacao}
          onClear={limparFiltros}
        />

        <section className="rounded-[30px] border border-white/70 bg-white/92 shadow-panel ring-1 ring-iguape-100/80 backdrop-blur-sm">
          <div className="border-b border-slate-200/80 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-iguape-700">
                  Consulta principal
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-900">
                  Contratos administrativos
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-500">
                  Ambiente de consulta, acompanhamento e priorização dos contratos com foco em vencimento, integridade cadastral e leitura rápida.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex min-h-10 items-center rounded-full bg-iguape-50 px-4 text-sm font-semibold text-iguape-700">
                  {formatNumeroInteiro(totalResultados)} resultado{totalResultados === 1 ? '' : 's'}
                </span>
                <span className="inline-flex min-h-10 items-center rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-600">
                  Ordenação por{' '}
                  <span className="ml-1 capitalize">
                    {ordenacao.campo === 'numeroModalidade'
                      ? 'nº modalidade'
                      : ordenacao.campo === 'empresaContratada'
                        ? 'empresa'
                        : ordenacao.campo === 'diasParaVencimento'
                          ? 'dias p/ vencimento'
                          : ordenacao.campo === 'statusNormalizado'
                            ? 'status'
                            : ordenacao.campo}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5">
            {totalResultados === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-14 text-center">
                <p className="text-lg font-semibold tracking-[-0.02em] text-slate-800">
                  Nenhum contrato encontrado
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Ajuste os filtros ou limpe a busca para retomar a visualização da base completa.
                </p>
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
                  onSort={alternarOrdenacao}
                  onOpenDetail={(contrato) => setContratoSelecionadoId(contrato.id)}
                  onPageChange={definirPagina}
                  onPageSizeChange={definirItensPorPagina}
                />

                <ContratosMobileList
                  contratos={pagina}
                  totalResultados={totalResultados}
                  paginaAtual={paginaAtual}
                  totalPaginas={totalPaginas}
                  itensPorPagina={itensPorPagina}
                  onOpenDetail={(contrato) => setContratoSelecionadoId(contrato.id)}
                  onPageChange={definirPagina}
                  onPageSizeChange={definirItensPorPagina}
                />
              </>
            )}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-6">
          <div className="2xl:col-span-2">
            <ChartStatus contratos={contratosFiltrados} />
          </div>
          <div className="2xl:col-span-2">
            <ChartModalidade contratos={contratosFiltrados} />
          </div>
          <div className="2xl:col-span-2">
            <ChartVencimentos contratos={contratosFiltrados} />
          </div>
          <div className="2xl:col-span-3">
            <ChartTopEmpresasContratos contratos={contratosFiltrados} />
          </div>
          <div className="2xl:col-span-3">
            <ChartTopEmpresasValor contratos={contratosFiltrados} />
          </div>
        </section>
      </div>

      <ContratoDetail contrato={contratoSelecionado} onClose={() => setContratoSelecionadoId(null)} />
    </div>
  );
}

export default App;
