import type { Contrato } from '../../types/contrato';
import { textoOuNaoInformado } from '../../utils/format';

export type ContratoModalidadeGroup = {
  key: string;
  label: string;
  contratos: Contrato[];
  quantidade: number;
  valorTotal: number;
  possuiValorInformado: boolean;
};

export function groupContratosByModalidade(contratos: Contrato[]): ContratoModalidadeGroup[] {
  const groups = new Map<string, ContratoModalidadeGroup>();

  for (const contrato of contratos) {
    const key = contrato.modalidade ?? '__nao_informado__';
    const label = textoOuNaoInformado(contrato.modalidade);
    const current =
      groups.get(key) ??
      ({
        key,
        label,
        contratos: [],
        quantidade: 0,
        valorTotal: 0,
        possuiValorInformado: false,
      } satisfies ContratoModalidadeGroup);

    current.contratos.push(contrato);
    current.quantidade += 1;
    current.valorTotal += contrato.valor ?? 0;
    current.possuiValorInformado ||= contrato.valor !== null;

    groups.set(key, current);
  }

  return Array.from(groups.values());
}
