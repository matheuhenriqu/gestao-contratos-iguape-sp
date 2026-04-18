import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import XLSX, { type WorkBook } from 'xlsx';
import type { Contrato, ContratoRaw } from '../src/types/contrato';
import {
  EXPECTED_HEADERS,
  buildHeaderMap,
  collectContratoIssues,
  mapRowToContratoRaw,
  normalizeContrato,
  parseCurrencyToNumber,
  parseDateInput,
} from '../src/utils/normalize';

type SheetInspection = {
  headers: string[];
  dataRows: unknown[][];
};

const WORKBOOK_PATH = path.resolve(process.cwd(), 'CONTRATOS.xlsx');
const OUTPUT_PATH = path.resolve(process.cwd(), 'src/data/contratos.json');
const SAMPLE_SIZE = 5;

function printSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function inspectSheet(workbook: WorkBook, sheetName: string): SheetInspection {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`A aba "${sheetName}" não foi encontrada.`);
  }

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  });

  const [headerRow = [], ...rows] = matrix;
  const headers = headerRow.map((cell) => String(cell ?? '').trim());
  const dataRows = rows.filter((row) => row.some((cell) => cell !== null && cell !== ''));

  return { headers, dataRows };
}

function countEmptyValues(headers: string[], dataRows: unknown[][]): Record<string, number> {
  return Object.fromEntries(
    headers.map((header, index) => [
      header,
      dataRows.reduce((count, row) => {
        const value = row[index];
        const isEmptyString = typeof value === 'string' && value.trim().length === 0;
        return count + (value === null || value === undefined || isEmptyString ? 1 : 0);
      }, 0),
    ]),
  );
}

function formatSampleRows(headers: string[], dataRows: unknown[][]): Array<Record<string, unknown>> {
  return dataRows.slice(0, SAMPLE_SIZE).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? null])),
  );
}

function summarizeIssueCategories(issues: string[]): Record<string, number> {
  return issues.reduce<Record<string, number>>((accumulator, issue) => {
    const category = issue.replace(/^linha \d+:\s*/, '').replace(/\s*\(.+\)$/, '');
    accumulator[category] = (accumulator[category] ?? 0) + 1;
    return accumulator;
  }, {});
}

function uniqueIds(contratos: Contrato[]): { contratos: Contrato[]; duplicateWarnings: string[] } {
  const seen = new Map<string, number>();
  const warnings: string[] = [];

  return {
    contratos: contratos.map((contrato) => {
      const count = (seen.get(contrato.id) ?? 0) + 1;
      seen.set(contrato.id, count);

      if (count === 1) {
        return contrato;
      }

      const nextId = `${contrato.id}--${count}`;
      warnings.push(`ID duplicado "${contrato.id}" ajustado para "${nextId}"`);
      return { ...contrato, id: nextId };
    }),
    duplicateWarnings: warnings,
  };
}

function sampleRandomContratos(contratos: Contrato[], size = 3): Contrato[] {
  if (contratos.length <= size) {
    return contratos;
  }

  const pool = [...contratos];
  const samples: Contrato[] = [];

  for (let index = 0; index < size; index += 1) {
    const pick = Math.floor(Math.random() * pool.length);
    const [selected] = pool.splice(pick, 1);
    if (selected) {
      samples.push(selected);
    }
  }

  return samples;
}

async function main(): Promise<void> {
  const workbook = XLSX.readFile(WORKBOOK_PATH, {
    cellDates: true,
    raw: true,
    dense: true,
  });

  printSection('INSPEÇÃO DA PLANILHA');
  console.log('Arquivo:', WORKBOOK_PATH);
  console.log('Abas:', workbook.SheetNames);

  let contratosSheet: SheetInspection | null = null;

  for (const sheetName of workbook.SheetNames) {
    const inspection = inspectSheet(workbook, sheetName);
    console.log(`\nAba: ${sheetName}`);
    console.log('Linhas totais (incluindo cabeçalho):', inspection.dataRows.length + 1);
    console.log('Registros:', inspection.dataRows.length);
    console.log('Cabeçalhos reais:', inspection.headers);
    console.log('Amostra das primeiras linhas:', formatSampleRows(inspection.headers, inspection.dataRows));

    if (!contratosSheet) {
      contratosSheet = inspection;
    }
  }

  if (!contratosSheet) {
    throw new Error('Nenhuma aba válida foi encontrada na planilha.');
  }

  const headerMapResult = buildHeaderMap(contratosSheet.headers);

  printSection('MAPEAMENTO DE CABEÇALHOS');
  console.log('Cabeçalhos esperados:', EXPECTED_HEADERS);
  console.log('Mapeamento real -> canônico:', headerMapResult.headerMap);
  console.log('Cabeçalhos ausentes:', headerMapResult.missingExpectedHeaders);
  console.log('Cabeçalhos inesperados:', headerMapResult.unexpectedHeaders);
  console.log('Mapeamentos duplicados:', headerMapResult.duplicateMappings);

  const rawRegistros: ContratoRaw[] = contratosSheet.dataRows.map((row, index) =>
    mapRowToContratoRaw(contratosSheet.headers, row, headerMapResult.headerMap, index + 2),
  );

  const referencia = new Date();
  const contratosNormalizados = rawRegistros.map((registro) => normalizeContrato(registro, referencia));
  const { contratos, duplicateWarnings } = uniqueIds(contratosNormalizados);

  const inconsistencias = rawRegistros.flatMap((registro, index) =>
    collectContratoIssues(registro, contratos[index] ?? contratosNormalizados[index]!),
  );

  const datasNaoParseadas = rawRegistros
    .flatMap((registro) => [
      { linha: registro._rowNumber, campo: 'dataInicio', resultado: parseDateInput(registro.dataInicio) },
      { linha: registro._rowNumber, campo: 'dataVencimento', resultado: parseDateInput(registro.dataVencimento) },
    ])
    .filter((item) => item.resultado.wasInvalid)
    .map((item) => ({
      linha: item.linha,
      campo: item.campo,
      valorOriginal: item.resultado.originalText,
    }));

  const valoresNaoParseados = rawRegistros
    .filter((registro) => {
      const parsed = parseCurrencyToNumber(registro.valor);
      return parsed === null && registro.valor !== null && registro.valor !== undefined && `${registro.valor}`.trim() !== '';
    })
    .map((registro) => ({
      linha: registro._rowNumber,
      valorOriginal: registro.valor,
    }));

  printSection('QUALIDADE DOS DADOS');
  console.log('Data de referência do cálculo:', referencia.toISOString().slice(0, 10));
  console.log('Total de registros:', contratos.length);
  console.log('Campos vazios por coluna:', countEmptyValues(contratosSheet.headers, contratosSheet.dataRows));
  console.log('Registros com dadosIncompletos:', contratos.filter((registro) => registro.dadosIncompletos).length);
  console.log('Datas não parseadas:', datasNaoParseadas.length, datasNaoParseadas.slice(0, 20));
  console.log('Valores monetários não parseados:', valoresNaoParseados.length, valoresNaoParseados.slice(0, 20));
  console.log('IDs duplicados ajustados:', duplicateWarnings.length, duplicateWarnings.slice(0, 20));
  console.log('Inconsistências encontradas:', inconsistencias.length);
  console.log('Resumo de inconsistências:', summarizeIssueCategories(inconsistencias));
  console.log('Exemplos de inconsistências:', inconsistencias.slice(0, 20));
  console.log('3 exemplos aleatórios normalizados:', sampleRandomContratos(contratos, 3));

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(contratos), 'utf8');

  printSection('SAÍDA');
  console.log('JSON gerado em:', OUTPUT_PATH);
}

main().catch((error) => {
  console.error('\nFalha ao gerar contratos.json');
  console.error(error);
  process.exitCode = 1;
});
