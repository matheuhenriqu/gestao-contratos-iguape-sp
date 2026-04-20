import { startTransition, useEffect, useMemo, useState } from 'react';
import type { Contrato, FaixaVencimento, StatusNormalizado } from '../types/contrato';
import { formatFaixaVencimento, formatMoedaBRL, formatStatusNormalizado } from '../utils/format';
import { EMPTY_OPTION_VALUE } from './useContratos';

export type StatusFiltro = Exclude<StatusNormalizado, null> | 'sem_status' | 'todos';
export type FaixaVencimentoFiltro = Exclude<FaixaVencimento, null> | 'todos';
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
  valorMin: string;
  valorMax: string;
  apenasDadosIncompletos: boolean;
  apenasComValor: boolean;
  somenteProximos30: boolean;
};

export type OrdenacaoState = {
  campo: OrdenacaoCampo;
  direcao: OrdenacaoDirecao;
};

export type FiltroChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

type MetricasFiltros = {
  totalContratos: number;
  valorTotal: number;
  ativos: number;
  vencidos: number;
  proximosDoVencimento: number;
  dadosIncompletos: number;
};

type UseFiltrosResult = {
  filtros: FiltrosContratosState;
  ordenacao: OrdenacaoState;
  paginaAtual: number;
  itensPorPagina: number;
  totalPaginas: number;
  totalResultados: number;
  pagina: Contrato[];
  paginaAtualVencidos: number;
  totalPaginasVencidos: number;
  totalResultadosVencidos: number;
  paginaVencidos: Contrato[];
  contratosFiltrados: Contrato[];
  metricas: MetricasFiltros;
  filtrosAtivos: number;
  chipsAtivos: FiltroChip[];
  atualizarFiltro: <K extends keyof FiltrosContratosState>(
    campo: K,
    value: FiltrosContratosState[K],
  ) => void;
  aplicarFiltros: (patch: Partial<FiltrosContratosState>) => void;
  limparFiltros: () => void;
  alternarOrdenacao: (campo: OrdenacaoCampo) => void;
  definirOrdenacao: (campo: OrdenacaoCampo, direcao: OrdenacaoDirecao) => void;
  definirPagina: (page: number) => void;
  definirPaginaVencidos: (page: number) => void;
  definirItensPorPagina: (value: number) => void;
  contarResultadosComFiltros: (candidate: FiltrosContratosState) => number;
  ativarKpi: (
    alvo: 'total' | 'valor' | 'ativos' | 'vencidos' | 'proximos' | 'incompletos',
  ) => void;
};

const FILTROS_INICIAIS: FiltrosContratosState = {
  busca: '',
  status: 'todos',
  modalidade: 'todos',
  empresaContratada: 'todos',
  gestor: 'todos',
  fiscal: 'todos',
  faixaVencimento: 'todos',
  valorMin: '',
  valorMax: '',
  apenasDadosIncompletos: false,
  apenasComValor: false,
  somenteProximos30: false,
};

const ORDENACAO_INICIAL: OrdenacaoState = {
  campo: 'dataVencimento',
  direcao: 'asc',
};

const DEFAULT_PAGE_SIZE = 25;

function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

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

function parseCurrencyFilterInput(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const sanitized = trimmed.replace(/\s+/g, '').replace(/[R$r$]/g, '').replace(/[^\d,.-]/g, '');

  if (!sanitized) {
    return null;
  }

  const hasComma = sanitized.includes(',');
  const hasDot = sanitized.includes('.');

  let normalized = sanitized;

  if (hasComma && hasDot) {
    const lastComma = sanitized.lastIndexOf(',');
    const lastDot = sanitized.lastIndexOf('.');
    const decimalIndex = Math.max(lastComma, lastDot);
    normalized = `${sanitized.slice(0, decimalIndex).replace(/[.,]/g, '')}.${sanitized
      .slice(decimalIndex + 1)
      .replace(/[.,]/g, '')}`;
  } else if (hasComma) {
    normalized = sanitized.replace(/\./g, '').replace(',', '.');
  } else {
    const parts = sanitized.split('.');
    normalized =
      parts.length > 2 ? `${parts.slice(0, -1).join('')}.${parts.at(-1) ?? ''}` : sanitized;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
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

  return (order[String(a)] ?? 3) - (order[String(b)] ?? 3);
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
  return [...contratos].sort((a, b) => {
    let resultado = compareByCampo(a, b, ordenacao.campo);

    if (resultado === 0) {
      resultado = compareNullableText(a.modalidade, b.modalidade);
    }

    if (resultado === 0) {
      resultado = compareNullableText(a.objeto, b.objeto);
    }

    if (resultado === 0) {
      resultado = compareNullableText(a.contrato, b.contrato);
    }

    return ordenacao.direcao === 'asc' ? resultado : resultado * -1;
  });
}

function filtrarContratos(
  contratos: Contrato[],
  filtros: FiltrosContratosState,
  termoBusca: string,
): Contrato[] {
  const busca = normalizarTexto(termoBusca);
  const valorMin = parseCurrencyFilterInput(filtros.valorMin);
  const valorMax = parseCurrencyFilterInput(filtros.valorMax);

  return contratos.filter((contrato) => {
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

    if (valorMin !== null && (contrato.valor === null || contrato.valor < valorMin)) {
      return false;
    }

    if (valorMax !== null && (contrato.valor === null || contrato.valor > valorMax)) {
      return false;
    }

    if (filtros.apenasDadosIncompletos && !contrato.dadosIncompletos) {
      return false;
    }

    if (filtros.apenasComValor && contrato.valor === null) {
      return false;
    }

    if (
      filtros.somenteProximos30 &&
      !(
        contrato.diasParaVencimento !== null &&
        contrato.diasParaVencimento >= 0 &&
        contrato.diasParaVencimento <= 30
      )
    ) {
      return false;
    }

    return true;
  });
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

function parseInitialSearch(): {
  filtros: FiltrosContratosState;
  ordenacao: OrdenacaoState;
  paginaAtual: number;
  itensPorPagina: number;
} {
  if (typeof window === 'undefined') {
    return {
      filtros: FILTROS_INICIAIS,
      ordenacao: ORDENACAO_INICIAL,
      paginaAtual: 1,
      itensPorPagina: DEFAULT_PAGE_SIZE,
    };
  }

  const params = new URLSearchParams(window.location.search);

  const filtros: FiltrosContratosState = {
    busca: params.get('busca') ?? '',
    status: (params.get('status') as StatusFiltro) ?? FILTROS_INICIAIS.status,
    modalidade: params.get('modalidade') ?? FILTROS_INICIAIS.modalidade,
    empresaContratada: params.get('empresa') ?? FILTROS_INICIAIS.empresaContratada,
    gestor: params.get('gestor') ?? FILTROS_INICIAIS.gestor,
    fiscal: params.get('fiscal') ?? FILTROS_INICIAIS.fiscal,
    faixaVencimento:
      (params.get('faixaVencimento') as FaixaVencimentoFiltro) ?? FILTROS_INICIAIS.faixaVencimento,
    valorMin: params.get('valorMin') ?? '',
    valorMax: params.get('valorMax') ?? '',
    apenasDadosIncompletos: params.get('incompletos') === '1',
    apenasComValor: params.get('comValor') === '1',
    somenteProximos30: params.get('proximos30') === '1',
  };

  const ordenacao: OrdenacaoState = {
    campo: (params.get('ordenar') as OrdenacaoCampo) ?? ORDENACAO_INICIAL.campo,
    direcao: (params.get('direcao') as OrdenacaoDirecao) ?? ORDENACAO_INICIAL.direcao,
  };

  return {
    filtros,
    ordenacao,
    paginaAtual: Number(params.get('pagina') ?? 1),
    itensPorPagina: Number(params.get('itens') ?? DEFAULT_PAGE_SIZE),
  };
}

export function useFiltros(contratos: Contrato[]): UseFiltrosResult {
  const initial = useMemo(() => parseInitialSearch(), []);
  const [filtros, setFiltros] = useState<FiltrosContratosState>(initial.filtros);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoState>(initial.ordenacao);
  const [paginaAtual, setPaginaAtual] = useState(initial.paginaAtual);
  const [paginaAtualVencidos, setPaginaAtualVencidos] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(initial.itensPorPagina || DEFAULT_PAGE_SIZE);
  const buscaDiferida = useDebouncedValue(filtros.busca, 250);

  const contratosFiltrados = useMemo(
    () => filtrarContratos(contratos, filtros, buscaDiferida),
    [buscaDiferida, contratos, filtros],
  );

  const contratosOrdenados = useMemo(
    () => ordenarContratos(contratosFiltrados, ordenacao),
    [contratosFiltrados, ordenacao],
  );

  const contratosAtivosOrdenados = useMemo(
    () => contratosOrdenados.filter((contrato) => contrato.statusNormalizado !== 'vencido'),
    [contratosOrdenados],
  );

  const contratosVencidosOrdenados = useMemo(
    () => contratosOrdenados.filter((contrato) => contrato.statusNormalizado === 'vencido'),
    [contratosOrdenados],
  );

  const totalPaginas = Math.max(1, Math.ceil(contratosAtivosOrdenados.length / itensPorPagina));
  const paginaSegura = Math.min(Math.max(paginaAtual, 1), totalPaginas);

  const pagina = useMemo(() => {
    const indiceInicial = (paginaSegura - 1) * itensPorPagina;
    return contratosAtivosOrdenados.slice(indiceInicial, indiceInicial + itensPorPagina);
  }, [contratosAtivosOrdenados, itensPorPagina, paginaSegura]);

  const totalPaginasVencidos = Math.max(
    1,
    Math.ceil(contratosVencidosOrdenados.length / itensPorPagina),
  );
  const paginaSeguraVencidos = Math.min(
    Math.max(paginaAtualVencidos, 1),
    totalPaginasVencidos,
  );

  const paginaVencidos = useMemo(() => {
    const indiceInicial = (paginaSeguraVencidos - 1) * itensPorPagina;
    return contratosVencidosOrdenados.slice(indiceInicial, indiceInicial + itensPorPagina);
  }, [contratosVencidosOrdenados, itensPorPagina, paginaSeguraVencidos]);

  const metricas = useMemo(() => calcularMetricas(contratosFiltrados), [contratosFiltrados]);

  const filtrosAtivos = [
    filtros.busca.trim().length > 0,
    filtros.status !== 'todos',
    filtros.modalidade !== 'todos',
    filtros.empresaContratada !== 'todos',
    filtros.gestor !== 'todos',
    filtros.fiscal !== 'todos',
    filtros.faixaVencimento !== 'todos',
    filtros.valorMin.trim().length > 0,
    filtros.valorMax.trim().length > 0,
    filtros.apenasDadosIncompletos,
    filtros.apenasComValor,
    filtros.somenteProximos30,
  ].filter(Boolean).length;

  function atualizarFiltro<K extends keyof FiltrosContratosState>(
    campo: K,
    value: FiltrosContratosState[K],
  ) {
    startTransition(() => {
      setFiltros((current) => ({ ...current, [campo]: value }));
      setPaginaAtual(1);
      setPaginaAtualVencidos(1);
    });
  }

  function aplicarFiltros(patch: Partial<FiltrosContratosState>) {
    startTransition(() => {
      setFiltros((current) => ({ ...current, ...patch }));
      setPaginaAtual(1);
      setPaginaAtualVencidos(1);
    });
  }

  function limparFiltros() {
    startTransition(() => {
      setFiltros(FILTROS_INICIAIS);
      setOrdenacao(ORDENACAO_INICIAL);
      setItensPorPagina(DEFAULT_PAGE_SIZE);
      setPaginaAtual(1);
      setPaginaAtualVencidos(1);
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
          direcao:
            campo === 'valor' || campo === 'diasParaVencimento' || campo === 'dataVencimento'
              ? 'desc'
              : 'asc',
        };
      });
      setPaginaAtual(1);
      setPaginaAtualVencidos(1);
    });
  }

  function definirOrdenacao(campo: OrdenacaoCampo, direcao: OrdenacaoDirecao) {
    startTransition(() => {
      setOrdenacao({ campo, direcao });
      setPaginaAtual(1);
      setPaginaAtualVencidos(1);
    });
  }

  function definirPagina(page: number) {
    startTransition(() => {
      setPaginaAtual(Math.max(1, Math.min(page, totalPaginas)));
    });
  }

  function definirPaginaVencidos(page: number) {
    startTransition(() => {
      setPaginaAtualVencidos(Math.max(1, Math.min(page, totalPaginasVencidos)));
    });
  }

  function definirItensPorPagina(value: number) {
    startTransition(() => {
      setItensPorPagina(value);
      setPaginaAtual(1);
      setPaginaAtualVencidos(1);
    });
  }

  function contarResultadosComFiltros(candidate: FiltrosContratosState): number {
    return filtrarContratos(contratos, candidate, candidate.busca).length;
  }

  function ativarKpi(alvo: 'total' | 'valor' | 'ativos' | 'vencidos' | 'proximos' | 'incompletos') {
    if (alvo === 'total') {
      limparFiltros();
      return;
    }

    const basePatch: Partial<FiltrosContratosState> = {
      apenasComValor: false,
      somenteProximos30: false,
      apenasDadosIncompletos: false,
      status: 'todos',
    };

    switch (alvo) {
      case 'valor':
        aplicarFiltros({ ...basePatch, apenasComValor: true });
        break;
      case 'ativos':
        aplicarFiltros({ ...basePatch, status: 'ativo' });
        break;
      case 'vencidos':
        aplicarFiltros({ ...basePatch, status: 'vencido' });
        break;
      case 'proximos':
        aplicarFiltros({ ...basePatch, somenteProximos30: true });
        break;
      case 'incompletos':
        aplicarFiltros({ ...basePatch, apenasDadosIncompletos: true });
        break;
      default:
        break;
    }
  }

  const chipsAtivos = useMemo<FiltroChip[]>(() => {
    const chips: FiltroChip[] = [];

    if (filtros.busca.trim()) {
      chips.push({
        id: 'busca',
        label: `Busca: ${filtros.busca.trim()}`,
        onRemove: () => atualizarFiltro('busca', ''),
      });
    }

    if (filtros.status !== 'todos') {
      chips.push({
        id: 'status',
        label:
          filtros.status === 'sem_status'
            ? 'Sem status calculado'
            : `Status: ${formatStatusNormalizado(filtros.status)}`,
        onRemove: () => atualizarFiltro('status', 'todos'),
      });
    }

    if (filtros.modalidade !== 'todos') {
      chips.push({
        id: 'modalidade',
        label: `Modalidade: ${filtros.modalidade === EMPTY_OPTION_VALUE ? 'Não informado' : filtros.modalidade}`,
        onRemove: () => atualizarFiltro('modalidade', 'todos'),
      });
    }

    if (filtros.empresaContratada !== 'todos') {
      chips.push({
        id: 'empresaContratada',
        label: `Empresa: ${
          filtros.empresaContratada === EMPTY_OPTION_VALUE ? 'Não informado' : filtros.empresaContratada
        }`,
        onRemove: () => atualizarFiltro('empresaContratada', 'todos'),
      });
    }

    if (filtros.gestor !== 'todos') {
      chips.push({
        id: 'gestor',
        label: `Gestor: ${filtros.gestor === EMPTY_OPTION_VALUE ? 'Não informado' : filtros.gestor}`,
        onRemove: () => atualizarFiltro('gestor', 'todos'),
      });
    }

    if (filtros.fiscal !== 'todos') {
      chips.push({
        id: 'fiscal',
        label: `Fiscal: ${filtros.fiscal === EMPTY_OPTION_VALUE ? 'Não informado' : filtros.fiscal}`,
        onRemove: () => atualizarFiltro('fiscal', 'todos'),
      });
    }

    if (filtros.faixaVencimento !== 'todos') {
      chips.push({
        id: 'faixaVencimento',
        label: `Vencimento: ${formatFaixaVencimento(filtros.faixaVencimento)}`,
        onRemove: () => atualizarFiltro('faixaVencimento', 'todos'),
      });
    }

    if (filtros.valorMin.trim()) {
      chips.push({
        id: 'valorMin',
        label: `Valor mínimo: ${formatMoedaBRL(parseCurrencyFilterInput(filtros.valorMin))}`,
        onRemove: () => atualizarFiltro('valorMin', ''),
      });
    }

    if (filtros.valorMax.trim()) {
      chips.push({
        id: 'valorMax',
        label: `Valor máximo: ${formatMoedaBRL(parseCurrencyFilterInput(filtros.valorMax))}`,
        onRemove: () => atualizarFiltro('valorMax', ''),
      });
    }

    if (filtros.apenasDadosIncompletos) {
      chips.push({
        id: 'incompletos',
        label: 'Somente dados incompletos',
        onRemove: () => atualizarFiltro('apenasDadosIncompletos', false),
      });
    }

    if (filtros.apenasComValor) {
      chips.push({
        id: 'comValor',
        label: 'Somente com valor informado',
        onRemove: () => atualizarFiltro('apenasComValor', false),
      });
    }

    if (filtros.somenteProximos30) {
      chips.push({
        id: 'proximos30',
        label: 'Próximos 30 dias',
        onRemove: () => atualizarFiltro('somenteProximos30', false),
      });
    }

    return chips;
  }, [filtros]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filtros.busca.trim()) params.set('busca', filtros.busca.trim());
    if (filtros.status !== 'todos') params.set('status', filtros.status);
    if (filtros.modalidade !== 'todos') params.set('modalidade', filtros.modalidade);
    if (filtros.empresaContratada !== 'todos') params.set('empresa', filtros.empresaContratada);
    if (filtros.gestor !== 'todos') params.set('gestor', filtros.gestor);
    if (filtros.fiscal !== 'todos') params.set('fiscal', filtros.fiscal);
    if (filtros.faixaVencimento !== 'todos') params.set('faixaVencimento', filtros.faixaVencimento);
    if (filtros.valorMin.trim()) params.set('valorMin', filtros.valorMin.trim());
    if (filtros.valorMax.trim()) params.set('valorMax', filtros.valorMax.trim());
    if (filtros.apenasDadosIncompletos) params.set('incompletos', '1');
    if (filtros.apenasComValor) params.set('comValor', '1');
    if (filtros.somenteProximos30) params.set('proximos30', '1');
    if (ordenacao.campo !== ORDENACAO_INICIAL.campo) params.set('ordenar', ordenacao.campo);
    if (ordenacao.direcao !== ORDENACAO_INICIAL.direcao) params.set('direcao', ordenacao.direcao);
    if (paginaSegura > 1) params.set('pagina', String(paginaSegura));
    if (itensPorPagina !== DEFAULT_PAGE_SIZE) params.set('itens', String(itensPorPagina));

    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;

    window.history.replaceState(null, '', nextUrl);
  }, [filtros, itensPorPagina, ordenacao, paginaSegura]);

  return {
    filtros,
    ordenacao,
    paginaAtual: paginaSegura,
    itensPorPagina,
    totalPaginas,
    totalResultados: contratosAtivosOrdenados.length,
    pagina,
    paginaAtualVencidos: paginaSeguraVencidos,
    totalPaginasVencidos,
    totalResultadosVencidos: contratosVencidosOrdenados.length,
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
    contarResultadosComFiltros,
    ativarKpi,
  };
}
