import type { Contrato, Criticidade, FaixaVencimento } from '../../types/contrato';
import { formatStatusNormalizado, textoOuNaoInformado } from '../../utils/format';

export function getStatusLabel(contrato: Contrato): string {
  if (contrato.statusNormalizado) {
    return formatStatusNormalizado(contrato.statusNormalizado);
  }

  return textoOuNaoInformado(contrato.statusOriginal);
}

export function getStatusClasses(contrato: Contrato): string {
  if (contrato.statusNormalizado === 'vencido') {
    return 'bg-status-criticalBg text-status-critical';
  }

  if (contrato.statusNormalizado === 'vence_hoje') {
    return 'bg-status-criticalBg text-status-critical';
  }

  if (contrato.diasParaVencimento !== null && contrato.diasParaVencimento > 0 && contrato.diasParaVencimento <= 30) {
    return 'bg-status-warningBg text-status-warning';
  }

  if (contrato.statusNormalizado === 'ativo') {
    return 'bg-status-okBg text-status-ok';
  }

  return 'bg-status-neutralBg text-status-neutral';
}

export function getCriticidadeTextClass(criticidade: Criticidade): string {
  if (criticidade === 'critico') {
    return 'text-status-critical';
  }

  if (criticidade === 'atencao') {
    return 'text-status-warning';
  }

  if (criticidade === 'ok') {
    return 'text-status-ok';
  }

  return 'text-text-subtle';
}

export function getCriticidadeSurfaceClass(criticidade: Criticidade): string {
  if (criticidade === 'critico') {
    return 'bg-status-criticalBg text-status-critical';
  }

  if (criticidade === 'atencao') {
    return 'bg-status-warningBg text-status-warning';
  }

  if (criticidade === 'ok') {
    return 'bg-status-okBg text-status-ok';
  }

  return 'bg-status-neutralBg text-status-neutral';
}

export function getFaixaTone(faixa: FaixaVencimento): string {
  switch (faixa) {
    case 'vencidos':
      return 'bg-status-critical';
    case 'vencem_hoje':
      return 'bg-status-critical';
    case 'ate_7':
      return 'bg-status-warning';
    case 'ate_30':
      return 'bg-primary-500';
    case 'ate_60':
      return 'bg-primary-600';
    case 'ate_90':
      return 'bg-primary-700';
    case 'acima_90':
      return 'bg-primary-900';
    default:
      return 'bg-border-strong';
  }
}

export function getCriticidadeBorder(criticidade: Criticidade): string {
  if (criticidade === 'critico') {
    return 'border-status-critical';
  }

  if (criticidade === 'atencao') {
    return 'border-status-warning';
  }

  if (criticidade === 'ok') {
    return 'border-status-ok';
  }

  return 'border-border';
}
