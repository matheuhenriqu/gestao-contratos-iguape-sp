import type { Contrato, ContratoRaw } from '../types/contrato';
import {
  calcularCriticidade,
  calcularDiasParaVencimento,
  calcularFaixa,
  calcularStatusNormalizado,
} from './vencimento';

export type CanonicalColumnKey = Exclude<keyof ContratoRaw, '_rowNumber'>;

type HeaderDefinition = {
  canonicalKey: CanonicalColumnKey;
  expectedHeader: string;
  aliases: string[];
};

type ParsedDate = {
  iso: string | null;
  originalText: string | null;
  wasInvalid: boolean;
  semanticStatusText: string | null;
};

export type HeaderMapResult = {
  headerMap: Record<string, CanonicalColumnKey>;
  missingExpectedHeaders: string[];
  unexpectedHeaders: string[];
  duplicateMappings: string[];
};

type NormalizeStringOptions = {
  preservePlaceholders?: boolean;
};

const PLACEHOLDER_VALUES = new Set([
  '',
  '-',
  '--',
  '---',
  '—',
  'n/a',
  'na',
  'não se aplica',
  'nao se aplica',
  'null',
  's/i',
  'sem informacao',
  'sem informação',
  'nao informado',
  'não informado',
  'nao informada',
  'não informada',
]);

const SEM_VENCIMENTO_MAP = new Map<string, string>([
  ['permanente', 'permanente'],
  ['em vigor', 'em vigor'],
  ['vigente', 'em vigor'],
  ['indeterminado', 'indeterminado'],
  ['indeterminada', 'indeterminado'],
  ['prazo indeterminado', 'indeterminado'],
  ['sem vencimento', 'sem vencimento'],
]);

const STATUS_LIKE_VALUES = new Set([
  'em andamento',
  'suspenso',
  'suspensa',
  'cancelado',
  'cancelada',
  'finalizado',
  'finalizada',
  'em analise',
  'em análise',
]);

export const HEADER_DEFINITIONS: readonly HeaderDefinition[] = [
  { canonicalKey: 'id', expectedHeader: 'ID', aliases: ['id'] },
  { canonicalKey: 'modalidade', expectedHeader: 'Modalidade', aliases: ['modalidade'] },
  {
    canonicalKey: 'numeroModalidade',
    expectedHeader: 'Nº Modalidade',
    aliases: ['n modalidade', 'no modalidade', 'numero modalidade'],
  },
  { canonicalKey: 'objeto', expectedHeader: 'Objeto', aliases: ['objeto'] },
  { canonicalKey: 'processo', expectedHeader: 'Processo', aliases: ['processo'] },
  { canonicalKey: 'contrato', expectedHeader: 'Contrato', aliases: ['contrato'] },
  {
    canonicalKey: 'empresaContratada',
    expectedHeader: 'Empresa Contratada',
    aliases: ['empresa contratada', 'contratada'],
  },
  {
    canonicalKey: 'valor',
    expectedHeader: 'Valor (R$)',
    aliases: ['valor r', 'valor rs', 'valor'],
  },
  {
    canonicalKey: 'valorDescricao',
    expectedHeader: 'Valor (Descrição)',
    aliases: ['valor descricao', 'descricao valor'],
  },
  {
    canonicalKey: 'dataInicio',
    expectedHeader: 'Data Início',
    aliases: ['data inicio', 'inicio'],
  },
  {
    canonicalKey: 'dataVencimento',
    expectedHeader: 'Data Vencimento',
    aliases: ['data vencimento', 'vencimento'],
  },
  {
    canonicalKey: 'diasParaVencimento',
    expectedHeader: 'Dias p/ Vencimento',
    aliases: ['dias p vencimento', 'dias para vencimento'],
  },
  { canonicalKey: 'status', expectedHeader: 'Status', aliases: ['status'] },
  { canonicalKey: 'gestor', expectedHeader: 'Gestor', aliases: ['gestor'] },
  { canonicalKey: 'fiscal', expectedHeader: 'Fiscal', aliases: ['fiscal'] },
  {
    canonicalKey: 'observacoes',
    expectedHeader: 'Observações',
    aliases: ['observacoes', 'observacao', 'observacoes gerais'],
  },
] as const;

export const EXPECTED_HEADERS = HEADER_DEFINITIONS.map((definition) => definition.expectedHeader);

export const ESSENTIAL_FIELDS = [
  'objeto',
  'contrato',
  'empresaContratada',
  'valor',
  'dataInicio',
  'dataVencimento',
] as const satisfies readonly CanonicalColumnKey[];

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function sanitizeInvisibleChars(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ');
}

function normalizeWhitespace(value: string): string {
  return sanitizeInvisibleChars(value).replace(/\s+/g, ' ').trim();
}

function normalizeLookupValue(value: string): string {
  return normalizeWhitespace(stripAccents(value).toLowerCase());
}

function normalizeString(value: unknown, options?: NormalizeStringOptions): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return String(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = normalizeWhitespace(value);
  if (!trimmed) {
    return null;
  }

  if (!options?.preservePlaceholders && PLACEHOLDER_VALUES.has(normalizeLookupValue(trimmed))) {
    return null;
  }

  return trimmed;
}

function coerceId(value: unknown, rowNumber: number): string {
  const asString = normalizeString(value, { preservePlaceholders: true });
  return asString ?? `linha-${rowNumber}`;
}

function formatDateParts(year: number, month: number, day: number): string {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function parseExcelSerialDate(value: number): string | null {
  if (!Number.isFinite(value)) {
    return null;
  }

  const serial = Math.trunc(value);
  if (serial <= 0) {
    return null;
  }

  const utcTimestamp = Date.UTC(1899, 11, 30) + serial * 86_400_000;
  const date = new Date(utcTimestamp);

  return formatDateParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function normalizeHeaderValue(header: string): string {
  return normalizeWhitespace(
    stripAccents(header)
      .toLowerCase()
      .replace(/[º°]/g, 'o')
      .replace(/[№]/g, 'n')
      .replace(/&/g, ' e ')
      .replace(/[/()\\-]/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' '),
  );
}

export function buildHeaderMap(headers: string[]): HeaderMapResult {
  const headerMap: Record<string, CanonicalColumnKey> = {};
  const duplicateMappings: string[] = [];
  const unexpectedHeaders: string[] = [];
  const matchedCanonicals = new Set<CanonicalColumnKey>();

  for (const header of headers) {
    const normalizedHeader = normalizeHeaderValue(header);
    const definition = HEADER_DEFINITIONS.find((candidate) => {
      const aliases = new Set([
        normalizeHeaderValue(candidate.expectedHeader),
        ...candidate.aliases.map(normalizeHeaderValue),
      ]);

      return aliases.has(normalizedHeader);
    });

    if (!definition) {
      unexpectedHeaders.push(header);
      continue;
    }

    if (matchedCanonicals.has(definition.canonicalKey)) {
      duplicateMappings.push(`${header} -> ${definition.canonicalKey}`);
      continue;
    }

    matchedCanonicals.add(definition.canonicalKey);
    headerMap[header] = definition.canonicalKey;
  }

  const missingExpectedHeaders = HEADER_DEFINITIONS.filter(
    (definition) => !matchedCanonicals.has(definition.canonicalKey),
  ).map((definition) => definition.expectedHeader);

  return {
    headerMap,
    missingExpectedHeaders,
    unexpectedHeaders,
    duplicateMappings,
  };
}

export function parseDateInput(value: unknown): ParsedDate {
  if (value === null || value === undefined || value === '') {
    return { iso: null, originalText: null, wasInvalid: false, semanticStatusText: null };
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      iso: formatDateParts(value.getFullYear(), value.getMonth() + 1, value.getDate()),
      originalText: null,
      wasInvalid: false,
      semanticStatusText: null,
    };
  }

  if (typeof value === 'number') {
    const iso = parseExcelSerialDate(value);
    return {
      iso,
      originalText: iso ? null : String(value),
      wasInvalid: iso === null,
      semanticStatusText: null,
    };
  }

  const text = normalizeString(value, { preservePlaceholders: true });
  if (!text) {
    return { iso: null, originalText: null, wasInvalid: false, semanticStatusText: null };
  }

  const lookup = normalizeLookupValue(text).replace(/[\\/.-]/g, '/');
  if (PLACEHOLDER_VALUES.has(lookup)) {
    return { iso: null, originalText: null, wasInvalid: false, semanticStatusText: null };
  }

  const semanticStatusText = SEM_VENCIMENTO_MAP.get(lookup) ?? null;
  if (semanticStatusText) {
    return {
      iso: null,
      originalText: semanticStatusText,
      wasInvalid: false,
      semanticStatusText,
    };
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (isValidDateParts(year, month, day)) {
      return { iso: formatDateParts(year, month, day), originalText: null, wasInvalid: false, semanticStatusText: null };
    }
  }

  const brMatch = /^(\d{1,2})[\/\\-](\d{1,2})[\/\\-](\d{2,4})$/.exec(text);
  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]);
    const yearToken = brMatch[3] ?? '';
    const year = Number(yearToken.length === 2 ? `20${yearToken}` : yearToken);
    if (isValidDateParts(year, month, day)) {
      return { iso: formatDateParts(year, month, day), originalText: null, wasInvalid: false, semanticStatusText: null };
    }
  }

  const ymdMatch = /^(\d{4})[\/.](\d{1,2})[\/.](\d{1,2})$/.exec(text);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);
    if (isValidDateParts(year, month, day)) {
      return { iso: formatDateParts(year, month, day), originalText: null, wasInvalid: false, semanticStatusText: null };
    }
  }

  if (/^\d+(?:[.,]\d+)?$/.test(text)) {
    const iso = parseExcelSerialDate(Number(text.replace(',', '.')));
    if (iso) {
      return { iso, originalText: null, wasInvalid: false, semanticStatusText: null };
    }
  }

  return { iso: null, originalText: text, wasInvalid: true, semanticStatusText: null };
}

export function parseCurrencyToNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const text = normalizeString(value, { preservePlaceholders: true });
  if (!text) {
    return null;
  }

  const lookup = normalizeLookupValue(text);
  if (PLACEHOLDER_VALUES.has(lookup)) {
    return null;
  }

  const sanitized = text.replace(/\s+/g, '').replace(/^R\$/i, '').replace(/[^\d,.-]/g, '');
  if (!sanitized || sanitized === '-' || sanitized === '--') {
    return null;
  }

  const negative = sanitized.startsWith('-');
  const unsigned = sanitized.replace(/-/g, '');
  const lastComma = unsigned.lastIndexOf(',');
  const lastDot = unsigned.lastIndexOf('.');

  let normalized = unsigned;

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalIndex = Math.max(lastComma, lastDot);
    const integerPart = unsigned.slice(0, decimalIndex).replace(/[.,]/g, '');
    const decimalPart = unsigned.slice(decimalIndex + 1).replace(/[.,]/g, '');
    normalized = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  } else if (lastComma >= 0) {
    const decimalDigits = unsigned.length - lastComma - 1;
    normalized =
      decimalDigits > 0 && decimalDigits <= 2
        ? `${unsigned.slice(0, lastComma).replace(/,/g, '')}.${unsigned.slice(lastComma + 1)}`
        : unsigned.replace(/,/g, '');
  } else if (lastDot >= 0) {
    const decimalDigits = unsigned.length - lastDot - 1;
    normalized =
      decimalDigits > 0 && decimalDigits <= 2
        ? `${unsigned.slice(0, lastDot).replace(/\./g, '')}.${unsigned.slice(lastDot + 1)}`
        : unsigned.replace(/\./g, '');
  }

  const parsed = Number(negative ? `-${normalized}` : normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapRowToContratoRaw(
  headers: string[],
  row: unknown[],
  headerMap: Record<string, CanonicalColumnKey>,
  rowNumber: number,
): ContratoRaw {
  const raw: ContratoRaw = {
    id: null,
    modalidade: null,
    numeroModalidade: null,
    objeto: null,
    processo: null,
    contrato: null,
    empresaContratada: null,
    valor: null,
    valorDescricao: null,
    dataInicio: null,
    dataVencimento: null,
    diasParaVencimento: null,
    status: null,
    gestor: null,
    fiscal: null,
    observacoes: null,
    _rowNumber: rowNumber,
  };

  headers.forEach((header, index) => {
    const canonicalKey = headerMap[header];
    if (!canonicalKey) {
      return;
    }
    raw[canonicalKey] = row[index] ?? null;
  });

  return raw;
}

export function normalizeContrato(raw: ContratoRaw, referencia: Date = new Date()): Contrato {
  const dataInicio = parseDateInput(raw.dataInicio);
  const dataVencimento = parseDateInput(raw.dataVencimento);
  const valor = parseCurrencyToNumber(raw.valor);
  const diasParaVencimento = calcularDiasParaVencimento(dataVencimento.iso, referencia);
  const statusOriginal =
    normalizeString(raw.status) ??
    (dataVencimento.semanticStatusText && dataVencimento.iso === null
      ? dataVencimento.semanticStatusText
      : null);

  const contrato: Contrato = {
    id: coerceId(raw.id, raw._rowNumber),
    modalidade: normalizeString(raw.modalidade),
    numeroModalidade: normalizeString(raw.numeroModalidade),
    objeto: normalizeString(raw.objeto),
    processo: normalizeString(raw.processo),
    contrato: normalizeString(raw.contrato),
    empresaContratada: normalizeString(raw.empresaContratada),
    valor,
    valorDescricao: normalizeString(raw.valorDescricao),
    dataInicio: dataInicio.iso,
    dataInicioTextoOriginal: dataInicio.originalText,
    dataVencimento: dataVencimento.iso,
    dataVencimentoTextoOriginal: dataVencimento.originalText,
    diasParaVencimento,
    statusOriginal,
    statusNormalizado: calcularStatusNormalizado(diasParaVencimento),
    gestor: normalizeString(raw.gestor),
    fiscal: normalizeString(raw.fiscal),
    observacoes: normalizeString(raw.observacoes),
    dadosIncompletos: false,
    faixaVencimento: calcularFaixa(diasParaVencimento),
    criticidade: calcularCriticidade(diasParaVencimento),
  };

  const empresaLookup = contrato.empresaContratada ? normalizeLookupValue(contrato.empresaContratada) : null;
  const statusLookup = statusOriginal ? normalizeLookupValue(statusOriginal) : null;

  if (
    empresaLookup &&
    (STATUS_LIKE_VALUES.has(empresaLookup) || (statusLookup !== null && empresaLookup === statusLookup)) &&
    contrato.contrato === null &&
    contrato.valor === null
  ) {
    contrato.empresaContratada = null;
  }

  contrato.dadosIncompletos =
    !contrato.objeto ||
    !contrato.contrato ||
    !contrato.empresaContratada ||
    contrato.valor === null ||
    contrato.dataInicio === null ||
    contrato.dataVencimento === null;

  return contrato;
}

export function collectContratoIssues(raw: ContratoRaw, contrato: Contrato): string[] {
  const issues: string[] = [];
  const dataInicio = parseDateInput(raw.dataInicio);
  const dataVencimento = parseDateInput(raw.dataVencimento);
  const valorOriginal = normalizeString(raw.valor, { preservePlaceholders: true });

  if (dataInicio.wasInvalid) {
    issues.push(`linha ${raw._rowNumber}: Data Início inválida (${String(raw.dataInicio)})`);
  }

  if (dataVencimento.wasInvalid) {
    issues.push(`linha ${raw._rowNumber}: Data Vencimento inválida (${String(raw.dataVencimento)})`);
  }

  if (valorOriginal && contrato.valor === null && !PLACEHOLDER_VALUES.has(normalizeLookupValue(valorOriginal))) {
    issues.push(`linha ${raw._rowNumber}: Valor não parseável (${valorOriginal})`);
  }

  if (contrato.dadosIncompletos) {
    issues.push(`linha ${raw._rowNumber}: Campos essenciais ausentes`);
  }

  return issues;
}
