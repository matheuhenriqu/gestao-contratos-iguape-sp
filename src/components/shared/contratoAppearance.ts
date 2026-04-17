import type { Contrato, Criticidade } from '../../types/contrato';
import { formatStatusNormalizado, textoOuNaoInformado } from '../../utils/format';

export function getStatusLabel(contrato: Contrato): string {
  if (contrato.statusNormalizado) {
    return formatStatusNormalizado(contrato.statusNormalizado);
  }

  return textoOuNaoInformado(contrato.statusOriginal);
}

export function getStatusClasses(contrato: Contrato): string {
  if (contrato.statusNormalizado === 'vencido') {
    return 'border border-rose-200 bg-rose-50 text-rose-700';
  }

  if (contrato.statusNormalizado === 'vence_hoje') {
    return 'border border-amber-200 bg-amber-50 text-amber-700';
  }

  if (contrato.statusNormalizado === 'ativo') {
    return 'border border-sky-200 bg-sky-50 text-sky-700';
  }

  return 'border border-slate-200 bg-slate-100 text-slate-600';
}

export function getCriticidadeClasses(criticidade: Criticidade): string {
  if (criticidade === 'critico') {
    return 'text-rose-700';
  }

  if (criticidade === 'atencao') {
    return 'text-amber-700';
  }

  if (criticidade === 'ok') {
    return 'text-iguape-700';
  }

  return 'text-slate-500';
}

export function getAccentBorderClasses(criticidade: Criticidade): string {
  if (criticidade === 'critico') {
    return 'border-l-4 border-l-rose-400';
  }

  if (criticidade === 'atencao') {
    return 'border-l-4 border-l-amber-400';
  }

  if (criticidade === 'ok') {
    return 'border-l-4 border-l-iguape-400';
  }

  return 'border-l-4 border-l-slate-200';
}
