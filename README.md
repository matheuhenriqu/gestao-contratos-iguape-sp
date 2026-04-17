# Gestão de Contratos — Prefeitura de Iguape/SP

Painel web estático para consulta, acompanhamento e priorização dos contratos da Prefeitura de Iguape/SP, com foco em leitura administrativa, filtros combináveis, indicadores executivos, análise por vencimento e visualização responsiva para desktop e iPhone.

## Stack

- Vite
- React
- TypeScript (`strict`)
- Tailwind CSS
- Recharts
- SheetJS `xlsx`

## Como rodar localmente

```bash
npm install
npm run build:data
npm run dev
npm run build
```

## Estrutura resumida

```text
.
├─ public/
├─ scripts/
│  └─ build-data.ts
├─ src/
│  ├─ components/
│  ├─ data/
│  │  └─ contratos.json
│  ├─ hooks/
│  ├─ types/
│  └─ utils/
├─ CONTRATOS.xlsx
├─ package.json
└─ vite.config.ts
```

## Fonte oficial de dados

- A planilha [CONTRATOS.xlsx](./CONTRATOS.xlsx) é a fonte oficial e prioritária dos dados do sistema.
- O script [`scripts/build-data.ts`](./scripts/build-data.ts) lê a planilha, inspeciona os cabeçalhos reais, normaliza datas e valores e gera o arquivo estático [`src/data/contratos.json`](./src/data/contratos.json).
- O bundle final já incorpora o JSON gerado, permitindo operação 100% estática, sem backend e sem dependência de rede para carregar os dados.

## Acesso público

- Aplicação publicada: a preencher após o deploy.
