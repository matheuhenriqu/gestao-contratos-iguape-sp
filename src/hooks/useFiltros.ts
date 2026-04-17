import { startTransition, useDeferredValue, useState } from 'react';
import type { Contrato, FaixaVencimento, StatusNormalizado } from '../types/contrato';
import { EMPTY_OPTION_VALUE } from './useContratos';

export type StatusFiltro = Exclude<StatusNormalizado, null> | 'sem_status' | 'todos';
export type FaixaVencimentoFiltro = Exclude<FaixaVencimento, null> | 'todos';
export type FaixaValorFiltro =
  | 'todos'
  | 'ate_50000'
  | '50000_250000'
  | '250000_1000000'
  | 'acima_1000000'
  | 'sem_valor';

export type OrdenacaoDirecao = 'asc' | 'desc';
export type OrdenacaoCampo =
  | 'modalidade'
  | 'numeroModalidade'
  | 'objeto'
  | 'processo'
  | 'contrato'
  | 'empresaContratada'
  | 'valor'
  | 'dataInicio'
  | 'dataVencimento'
  | 'diasParaVencimento'
  | 'statusNormalizado'
  | 'gestor'
  | 'fiscal';

export type FiltrosContratosState = {
  busca: string;
  status: StatusFiltro;
  modalidade: string;
  empresaContratada: string;
  gestor: string;
  fiscal: string;
  faixaVencimento: FaixaVencimentoFiltro;
  faixaValor: FaixaValorFiltro;
  apenasDadosIncompletos: boolean;
};

type OrdenacaoState = {
  campo: OrdenacaoCampo;
  direcao: OrdenacaoDirecao;
};

type MetricasFiltros = {
  totalContratos: number;
  valorTotal: number;
  ativos: number;
  vencidos: number;
  proximosDoVencimento: number;
  dadosIncompletos: number;
};

const FILTROS_INICIAIS: FiltrosContratosState = {
  busca: '',
  status: 'todos',
  modalidade: 'todos',
  empresaContratada: 'todos',
  gestor: 'todos',
  fiscal: 'todos',
  faixaVencimento: 'todos',
  faixaValor: 'todos',
  apenasDadosIncompletos: false,
};

const ORDENACAO_INICIAL: OrdenacaoState = {
  campo: 'dataVencimento',
  direcao: 'asc',
};

function normalizarTexto(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesOption(value: string | null, filtro: string): boolean {
  if (filtro === 'todos') {
    return true;
  }

  if (filtro === EMPTY_OPTION_VALUE) {
    return value === null;
  }

  return value === filtro;
}

function matchesFaixaValor(valor: number | null, faixa: FaixaValorFiltro): boolean {
  if (faixa === 'todos') {
    return true;
  }

  if (faixa === 'sem_valor') {
    return valor === null;
  }

  if (valor === null) {
    return false;
  }

  switch (faixa) {
    case 'ate_50000':
      return valor <= 50_000;
    case '50000_250000':
      return valor > 50_000 && valor <= 250_000;
    case '250000_1000000':
      return valor > 250_000 && valor <= 1_000_000;
    case 'acima_1000000':
      return valor > 1_000_000;
    default:
      return true;
  }
}

function compareNullableText(a: string | null, b: string | null): number {
  if (a === b) {
    return 0;
  }

  if (a === null) {
    return 1;
  }

  if (b === null) {
    return -1;
  }

  return a.localeCompare(b, 'pt-BR');
}

function compareNullableNumber(a: number | null, b: number | null): number {
  if (a === b) {
    return 0;
  }

  if (a === null) {
    return 1;
  }

  if (b === null) {
    return -1;
  }

  return a - b;
}

function compareNullableDate(a: string | null, b: string | null): number {
  if (a === b) {
    return 0;
  }

  if (a === null) {
    return 1;
  }

  if (b === null) {
    return -1;
  }

  return a.localeCompare(b);
}

function compareStatus(a: StatusNormalizado, b: StatusNormalizado): number {
  const order: Record<string, number> = {
    vencido: 0,
    vence_hoje: 1,
    ativo: 2,
    null: 3,
  };
  const fallback = 3;

  return (order[String(a)] ?? fallback) - (order[String(b)] ?? fallback);
}

function compareByCampo(a: Contrato, b: Contrato, campo: OrdenacaoCampo): number {
  switch (campo) {
    case 'valor':
    case 'diasParaVencimento':
      return compareNullableNumber(a[campo], b[campo]);
    case 'dataInicio':
    case 'dataVencimento':
      return compareNullableDate(a[campo], b[campo]);
    case 'statusNormalizado':
      return compareStatus(a.statusNormalizado, b.statusNormalizado);
    default:
      return compareNullableText(a[campo], b[campo]);
  }
}

function ordenarContratos(contratos: Contrato[], ordenacao: OrdenacaoState): Contrato[] {
  const ordenados = [...contratos];

  ordenados.sort((a, b) => {
    const comparacaoModalidade = compareNullableText(a.modalidade, b.modalidade);

    if (ordenacao.campo !== 'modalidade' && comparacaoModalidade !== 0) {
      return comparacaoModalidade;
    }

    let resultado =
      ordenacao.campo === 'modalidade'
        ? comparacaoModalidade
        : compareByCampo(a, b, ordenacao.campo);

    if (resultado === 0) {
      resultado = compareNullableText(a.objeto, b.objeto);
    }

    if (resultado === 0) {
      resultado = compareNullableText(a.contrato, b.contrato);
    }

    return ordenacao.campo === 'modalidade'
      ? ordenacao.direcao === 'asc'
        ? resultado
        : resultado * -1
      : ordenacao.direcao === 'asc'
        ? resultado
        : resultado * -1;
  });

  return ordenados;
}

function calcularMetricas(contratos: Contrato[]): MetricasFiltros {
  return contratos.reduce<MetricasFiltros>(
    (accumulator, contrato) => {
      accumulator.totalContratos += 1;
      accumulator.valorTotal += contrato.valor ?? 0;

      if (contrato.statusNormalizado === 'ativo') {
        accumulator.ativos += 1;
      }

      if (contrato.statusNormalizado === 'vencido') {
        accumulator.vencidos += 1;
      }

      if (
        contrato.diasParaVencimento !== null &&
        contrato.diasParaVencimento >= 0 &&
        contrato.diasParaVencimento <= 30
      ) {
        accumulator.proximosDoVencimento += 1;
      }

      if (contrato.dadosIncompletos) {
        accumulator.dadosIncompletos += 1;
      }

      return accumulator;
    },
    {
      totalContratos: 0,
      valorTotal: 0,
      ativos: 0,
      vencidos: 0,
      proximosDoVencimento: 0,
      dadosIncompletos: 0,
    },
  );
}

export function useFiltros(contratos: Contrato[]) {
  const [filtros, setFiltros] = useState<FiltrosContratosState>(FILTROS_INICIAIS);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoState>(ORDENACAO_INICIAL);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(12);
  const buscaDiferida = useDeferredValue(filtros.busca);

  const contratosFiltrados = contratos.filter((contrato) => {
    const busca = normalizarTexto(buscaDiferida);

    if (busca) {
      const haystack = normalizarTexto(
        [
          contrato.objeto,
          contrato.empresaContratada,
          contrato.contrato,
          contrato.processo,
          contrato.gestor,
          contrato.fiscal,
        ]
          .filter(Boolean)
          .join(' '),
      );

      if (!haystack.includes(busca)) {
        return false;
      }
    }

    if (filtros.status !== 'todos') {
      if (filtros.status === 'sem_status') {
        if (contrato.statusNormalizado !== null) {
          return false;
        }
      } else if (contrato.statusNormalizado !== filtros.status) {
        return false;
      }
    }

    if (!matchesOption(contrato.modalidade, filtros.modalidade)) {
      return false;
    }

    if (!matchesOption(contrato.empresaContratada, filtros.empresaContratada)) {
      return false;
    }

    if (!matchesOption(contrato.gestor, filtros.gestor)) {
      return false;
    }

    if (!matchesOption(contrato.fiscal, filtros.fiscal)) {
      return false;
    }

    if (filtros.faixaVencimento !== 'todos' && contrato.faixaVencimento !== filtros.faixaVencimento) {
      return false;
    }

    if (!matchesFaixaValor(contrato.valor, filtros.faixaValor)) {
      return false;
    }

    if (filtros.apenasDadosIncompletos && !contrato.dadosIncompletos) {
      return false;
    }

    return true;
  });

  const contratosOrdenados = ordenarContratos(contratosFiltrados, ordenacao);
  const totalPaginas = Math.max(1, Math.ceil(contratosOrdenados.length / itensPorPagina));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaSegura - 1) * itensPorPagina;
  const pagina = contratosOrdenados.slice(indiceInicial, indiceInicial + itensPorPagina);
  const metricas = calcularMetricas(contratosFiltrados);

  const filtrosAtivos = [
    filtros.busca.trim().length > 0,
    filtros.status !== 'todos',
    filtros.modalidade !== 'todos',
    filtros.empresaContratada !== 'todos',
    filtros.gestor !== 'todos',
    filtros.fiscal !== 'todos',
    filtros.faixaVencimento !== 'todos',
    filtros.faixaValor !== 'todos',
    filtros.apenasDadosIncompletos,
  ].filter(Boolean).length;

  function atualizarFiltro<K extends keyof FiltrosContratosState>(
    campo: K,
    value: FiltrosContratosState[K],
  ) {
    startTransition(() => {
      setFiltros((current) => ({ ...current, [campo]: value }));
      setPaginaAtual(1);
    });
  }

  function atualizarBusca(value: string) {
    atualizarFiltro('busca', value);
  }

  function limparFiltros() {
    startTransition(() => {
      setFiltros(FILTROS_INICIAIS);
      setOrdenacao(ORDENACAO_INICIAL);
      setItensPorPagina(12);
      setPaginaAtual(1);
    });
  }

  function alternarOrdenacao(campo: OrdenacaoCampo) {
    startTransition(() => {
      setOrdenacao((current) => {
        if (current.campo === campo) {
          return {
            campo,
            direcao: current.direcao === 'asc' ? 'desc' : 'asc',
          };
        }

        return {
          campo,
          direcao: campo === 'valor' || campo === 'diasParaVencimento' ? 'desc' : 'asc',
        };
      });
      setPaginaAtual(1);
    });
  }

  function definirOrdenacao(campo: OrdenacaoCampo, direcao: OrdenacaoDirecao) {
    startTransition(() => {
      setOrdenacao({ campo, direcao });
      setPaginaAtual(1);
    });
  }

  function definirPagina(page: number) {
    startTransition(() => {
      setPaginaAtual(Math.max(1, Math.min(page, totalPaginas)));
    });
  }

  function definirItensPorPagina(value: number) {
    startTransition(() => {
      setItensPorPagina(value);
      setPaginaAtual(1);
    });
  }

  return {
    filtros,
    ordenacao,
    paginaAtual: paginaSegura,
    itensPorPagina,
    totalPaginas,
    totalResultados: contratosOrdenados.length,
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
  };
}
