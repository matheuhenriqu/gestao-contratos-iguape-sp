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
  };
}

export function useContratos(): { contratos: Contrato[]; options: ContratosOptions } {
  const contratos = (contratosData as Contrato[]).map(recalcularContrato);

  return {
    contratos,
    options: {
      modalidades: ordenarValores(contratos.map((contrato) => contrato.modalidade)),
      empresas: ordenarValores(contratos.map((contrato) => contrato.empresaContratada)),
      gestores: ordenarValores(contratos.map((contrato) => contrato.gestor)),
      fiscais: ordenarValores(contratos.map((contrato) => contrato.fiscal)),
    },
  };
}
