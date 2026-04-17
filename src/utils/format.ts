import type { Criticidade, FaixaVencimento, StatusNormalizado } from '../types/contrato';

const moedaFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const inteiroFormatter = new Intl.NumberFormat('pt-BR');

const compactoFormatter = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function textoOuNaoInformado(v: string | null | undefined): string {
  if (typeof v !== 'string') {
    return 'Não informado';
  }

  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : 'Não informado';
}

export function formatDataBR(iso: string | null): string {
  if (!iso) {
    return 'Não informado';
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);

  if (!match) {
    return 'Não informado';
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function formatMoedaBRL(valor: number | null): string {
  if (typeof valor !== 'number' || Number.isNaN(valor)) {
    return 'Não informado';
  }

  return moedaFormatter.format(valor);
}

export function formatNumeroInteiro(valor: number): string {
  return inteiroFormatter.format(valor);
}

export function formatNumeroCompacto(valor: number): string {
  return compactoFormatter.format(valor);
}

export function formatStatusNormalizado(status: StatusNormalizado): string {
  switch (status) {
    case 'ativo':
      return 'Ativo';
    case 'vencido':
      return 'Vencido';
    case 'vence_hoje':
      return 'Vence hoje';
    default:
      return 'Não informado';
  }
}

export function formatFaixaVencimento(faixa: FaixaVencimento): string {
  switch (faixa) {
    case 'vencidos':
      return 'Vencidos';
    case 'vencem_hoje':
      return 'Vencem hoje';
    case 'ate_7':
      return 'Até 7 dias';
    case 'ate_30':
      return 'Até 30 dias';
    case 'ate_60':
      return 'Até 60 dias';
    case 'ate_90':
      return 'Até 90 dias';
    case 'acima_90':
      return 'Acima de 90 dias';
    default:
      return 'Não informado';
  }
}

export function formatCriticidade(criticidade: Criticidade): string {
  switch (criticidade) {
    case 'critico':
      return 'Crítico';
    case 'atencao':
      return 'Atenção';
    case 'ok':
      return 'Ok';
    default:
      return 'Não informado';
  }
}

export function formatDiasParaVencimento(valor: number | null): string {
  if (valor === null) {
    return 'Não informado';
  }

  if (valor === 0) {
    return 'Hoje';
  }

  return inteiroFormatter.format(valor);
}
