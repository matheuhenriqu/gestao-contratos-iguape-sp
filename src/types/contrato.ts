export type StatusNormalizado = 'ativo' | 'vencido' | 'vence_hoje' | null;

export type FaixaVencimento =
  | 'vencidos'
  | 'vencem_hoje'
  | 'ate_7'
  | 'ate_30'
  | 'ate_60'
  | 'ate_90'
  | 'acima_90'
  | null;

export type Criticidade = 'critico' | 'atencao' | 'ok' | null;

export type ContratoRaw = {
  id: unknown;
  modalidade: unknown;
  numeroModalidade: unknown;
  objeto: unknown;
  processo: unknown;
  contrato: unknown;
  empresaContratada: unknown;
  valor: unknown;
  valorDescricao: unknown;
  dataInicio: unknown;
  dataVencimento: unknown;
  diasParaVencimento: unknown;
  status: unknown;
  gestor: unknown;
  fiscal: unknown;
  observacoes: unknown;
  _rowNumber: number;
};

export type Contrato = {
  id: string;
  modalidade: string | null;
  numeroModalidade: string | null;
  objeto: string | null;
  processo: string | null;
  contrato: string | null;
  empresaContratada: string | null;
  valor: number | null;
  valorDescricao: string | null;
  dataInicio: string | null;
  dataInicioTextoOriginal: string | null;
  dataVencimento: string | null;
  dataVencimentoTextoOriginal: string | null;
  diasParaVencimento: number | null;
  statusOriginal: string | null;
  statusNormalizado: StatusNormalizado;
  gestor: string | null;
  fiscal: string | null;
  observacoes: string | null;
  dadosIncompletos: boolean;
  faixaVencimento: FaixaVencimento;
  criticidade: Criticidade;
};
