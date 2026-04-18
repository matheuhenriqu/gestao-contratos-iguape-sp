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
    return 'bg-status-critical/10 text-status-critical';
  }

  if (contrato.statusNormalizado === 'vence_hoje') {
    return 'bg-status-warning/12 text-status-warning';
  }

  if (contrato.statusNormalizado === 'ativo') {
    return 'bg-status-ok/12 text-status-ok';
  }

  return 'bg-surface-2 text-muted';
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

  return 'text-subtle';
}

export function getCriticidadeSurfaceClass(criticidade: Criticidade): string {
  if (criticidade === 'critico') {
    return 'bg-status-critical/8 text-status-critical';
  }

  if (criticidade === 'atencao') {
    return 'bg-status-warning/10 text-status-warning';
  }

  if (criticidade === 'ok') {
    return 'bg-status-ok/10 text-status-ok';
  }

  return 'bg-surface-2 text-muted';
}

export function getFaixaTone(faixa: FaixaVencimento): string {
  if (faixa === 'vencidos') {
    return 'bg-status-critical';
  }

  if (faixa === 'vencem_hoje') {
    return 'bg-status-warning';
  }

  if (faixa === 'ate_7') {
    return 'bg-brand-600';
  }

  if (faixa === 'ate_30') {
    return 'bg-brand-700';
  }

  if (faixa === 'ate_60') {
    return 'bg-brand-700/80';
  }

  if (faixa === 'ate_90') {
    return 'bg-brand-600/70';
  }

  if (faixa === 'acima_90') {
    return 'bg-secondary-600/80';
  }

  return 'bg-border-strong';
}

export function getCriticidadeBorder(criticidade: Criticidade): string {
  if (criticidade === 'critico') {
    return 'border-status-critical/24';
  }

  if (criticidade === 'atencao') {
    return 'border-status-warning/24';
  }

  if (criticidade === 'ok') {
    return 'border-status-ok/24';
  }

  return 'border-border';
}
