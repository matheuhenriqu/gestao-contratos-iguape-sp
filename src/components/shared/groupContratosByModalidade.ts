import type { Contrato } from '../../types/contrato';
import { textoOuNaoInformado } from '../../utils/format';

export type ContratoModalidadeGroup = {
  key: string;
  label: string;
  abbreviation: string;
  contratos: Contrato[];
  quantidade: number;
  valorTotal: number;
  possuiValorInformado: boolean;
};

const STOP_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

export function getModalidadeAbbreviation(label: string): string {
  const cleaned = label.trim();

  if (!cleaned || cleaned === '—') {
    return 'NI';
  }

  const words = cleaned.split(/\s+/).filter((word) => !STOP_WORDS.has(word.toLowerCase()));

  if (words.length === 0) {
    return cleaned.slice(0, 2).toUpperCase();
  }

  if (words.length === 1) {
    const word = words[0] ?? '';
    if (word.length >= 2) {
      return (word.slice(0, 2)).toUpperCase();
    }
    return word.toUpperCase();
  }

  const first = words[0] ?? '';
  const second = words[1] ?? '';
  return ((first[0] ?? '') + (second[0] ?? '')).toUpperCase();
}

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
        abbreviation: getModalidadeAbbreviation(label),
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
