import { startTransition, useEffect, useMemo, useState } from 'react';
import contratosData from '../data/contratos.json';
import type { Contrato } from '../types/contrato';
import {
  calcularCriticidade,
  calcularDiasParaVencimento,
  calcularFaixa,
  calcularStatusNormalizado,
} from '../utils/vencimento';

export const EMPTY_OPTION_VALUE = '__nao_informado__';

export type ContratosOptions = {
  modalidades: string[];
  empresas: string[];
  gestores: string[];
  fiscais: string[];
};

type UseContratosResult = {
  contratos: Contrato[];
  contratosById: Map<string, Contrato>;
  options: ContratosOptions;
  isLoading: boolean;
};

function ordenarValores(values: Array<string | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))))
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function recalcularContrato(contrato: Contrato): Contrato {
  const diasParaVencimento = calcularDiasParaVencimento(contrato.dataVencimento);

  return {
    ...contrato,
    diasParaVencimento,
    statusNormalizado: calcularStatusNormalizado(diasParaVencimento),
    faixaVencimento: calcularFaixa(diasParaVencimento),
    criticidade: calcularCriticidade(diasParaVencimento),
    dadosIncompletos:
      !contrato.objeto ||
      !contrato.contrato ||
      !contrato.empresaContratada ||
      contrato.valor === null ||
      contrato.dataInicio === null ||
      contrato.dataVencimento === null,
  };
}

export function useContratos(): UseContratosResult {
  const [contratos, setContratos] = useState<Contrato[] | null>(null);

  useEffect(() => {
    startTransition(() => {
      setContratos((contratosData as Contrato[]).map(recalcularContrato));
    });
  }, []);

  const options = useMemo<ContratosOptions>(() => {
    const base = contratos ?? [];

    return {
      modalidades: ordenarValores(base.map((contrato) => contrato.modalidade)),
      empresas: ordenarValores(base.map((contrato) => contrato.empresaContratada)),
      gestores: ordenarValores(base.map((contrato) => contrato.gestor)),
      fiscais: ordenarValores(base.map((contrato) => contrato.fiscal)),
    };
  }, [contratos]);

  const contratosById = useMemo(
    () => new Map((contratos ?? []).map((contrato) => [contrato.id, contrato])),
    [contratos],
  );

  return {
    contratos: contratos ?? [],
    contratosById,
    options,
    isLoading: contratos === null,
  };
}
