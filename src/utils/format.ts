import type { Contrato, Criticidade, FaixaVencimento, StatusNormalizado } from '../types/contrato';

const moedaFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const inteiroFormatter = new Intl.NumberFormat('pt-BR');

function formatDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: value >= 100 ? 0 : 1,
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function textoOuNaoInformado(value: string | null | undefined): string {
  if (typeof value !== 'string') {
    return 'Não informado';
  }

  const trimmed = value.trim();
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

export function formatDataOuTraco(iso: string | null): string {
  return iso ? formatDataBR(iso) : '—';
}

export function formatMoedaBRL(valor: number | null): string {
  if (typeof valor !== 'number' || Number.isNaN(valor)) {
    return 'Não informado';
  }

  return moedaFormatter.format(valor);
}

export function formatMoedaCompactaBRL(valor: number | null): string {
  if (typeof valor !== 'number' || Number.isNaN(valor)) {
    return 'Não informado';
  }

  const abs = Math.abs(valor);

  if (abs >= 1_000_000_000) {
    return `R$ ${formatDecimal(valor / 1_000_000_000)} bi`;
  }

  if (abs >= 1_000_000) {
    return `R$ ${formatDecimal(valor / 1_000_000)} mi`;
  }

  return formatMoedaBRL(valor);
}

export function formatNumeroInteiro(valor: number): string {
  return inteiroFormatter.format(valor);
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
      return 'Sem status calculado';
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
      return 'Sem vencimento';
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
      return 'Sem criticidade';
  }
}

export function formatDiasParaVencimento(valor: number | null): string {
  if (valor === null) {
    return '—';
  }

  if (valor < 0) {
    return `${inteiroFormatter.format(valor)} dias`;
  }

  if (valor === 0) {
    return 'Hoje';
  }

  return `em ${inteiroFormatter.format(valor)} dias`;
}

export function formatPrazoCompacto(valor: number | null): string {
  if (valor === null) {
    return '—';
  }

  if (valor < 0) {
    return `${inteiroFormatter.format(Math.abs(valor))} em atraso`;
  }

  if (valor === 0) {
    return 'Vence hoje';
  }

  return `em ${inteiroFormatter.format(valor)} dias`;
}

export function formatValorOuTraco(valor: number | null): string {
  return valor === null ? '—' : formatMoedaBRL(valor);
}

export function getCampoPendenteLabels(contrato: Contrato): string[] {
  const campos: Array<[string, string | number | null]> = [
    ['Objeto', contrato.objeto],
    ['Contrato', contrato.contrato],
    ['Empresa contratada', contrato.empresaContratada],
    ['Valor', contrato.valor],
    ['Data de início', contrato.dataInicio],
    ['Data de vencimento', contrato.dataVencimento],
  ];

  return campos.filter(([, value]) => value === null).map(([label]) => label);
}
