import type { Criticidade, FaixaVencimento, StatusNormalizado } from '../types/contrato';

const DAY_IN_MS = 86_400_000;

function parseIsoDateParts(iso: string): [number, number, number] | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return [year, month, day];
}

function toUtcMiddayTimestampFromIso(iso: string): number | null {
  const parts = parseIsoDateParts(iso);

  if (!parts) {
    return null;
  }

  const [year, month, day] = parts;
  return Date.UTC(year, month - 1, day, 12);
}

function toUtcMiddayTimestampFromDate(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

export function calcularDiasParaVencimento(
  dataVencimentoIso: string | null,
  referencia: Date = new Date(),
): number | null {
  if (!dataVencimentoIso) {
    return null;
  }

  const dataVencimentoTimestamp = toUtcMiddayTimestampFromIso(dataVencimentoIso);

  if (dataVencimentoTimestamp === null) {
    return null;
  }

  const referenciaTimestamp = toUtcMiddayTimestampFromDate(referencia);
  return Math.round((dataVencimentoTimestamp - referenciaTimestamp) / DAY_IN_MS);
}

export function calcularFaixa(diasParaVencimento: number | null): FaixaVencimento {
  if (diasParaVencimento === null) {
    return null;
  }

  if (diasParaVencimento < 0) {
    return 'vencidos';
  }

  if (diasParaVencimento === 0) {
    return 'vencem_hoje';
  }

  if (diasParaVencimento <= 7) {
    return 'ate_7';
  }

  if (diasParaVencimento <= 30) {
    return 'ate_30';
  }

  if (diasParaVencimento <= 60) {
    return 'ate_60';
  }

  if (diasParaVencimento <= 90) {
    return 'ate_90';
  }

  return 'acima_90';
}

export function calcularCriticidade(diasParaVencimento: number | null): Criticidade {
  if (diasParaVencimento === null) {
    return null;
  }

  if (diasParaVencimento <= 7) {
    return 'critico';
  }

  if (diasParaVencimento <= 30) {
    return 'atencao';
  }

  return 'ok';
}

export function calcularStatusNormalizado(diasParaVencimento: number | null): StatusNormalizado {
  if (diasParaVencimento === null) {
    return null;
  }

  if (diasParaVencimento < 0) {
    return 'vencido';
  }

  if (diasParaVencimento === 0) {
    return 'vence_hoje';
  }

  return 'ativo';
}
