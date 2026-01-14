# GPU Metrics Dashboard

Dashboard em tempo real para visualização de métricas de GPU e vLLM coletadas do banco de dados Supabase PostgreSQL.

## 🚀 Características

- **Atualização em Tempo Real**: Dashboard atualiza automaticamente a cada 2 segundos
- **Métricas Críticas**: Foco nas métricas essenciais para controle de fluxo:
  - KV Cache Usage (%)
  - Requests Running
  - Requests Waiting
  - Average Queue Time
- **Métricas de Saúde**: Monitoramento de recursos do sistema:
  - GPU Utilization
  - Memory Usage
  - CPU Usage
- **Visualizações Gráficas**: Histórico temporal das métricas com gráficos interativos
- **Design Moderno**: Interface limpa e responsiva com Tailwind CSS

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Acesso ao banco de dados Supabase PostgreSQL

## 🛠️ Instalação

1. Clone o repositório ou navegue até o diretório do projeto

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua connection string:
```
# Para banco local:
DATABASE_URL=postgresql://postgres:abcadvise@2026@localhost:5432/postgres

# Para banco Supabase (exemplo):
# DATABASE_URL=postgresql://postgres.hccolkrnyrxcbxuuajwq:1d8vUnUlDXT7cmox@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

## 🏃 Executando Localmente

1. **Teste a conexão com o banco (opcional mas recomendado):**
```bash
npm run test:connection
```

Este script verifica se:
- A conexão com o banco está funcionando
- O schema `busca_fornecedor` existe
- A tabela `LLM-Metrics` existe e tem dados

2. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

O dashboard estará disponível em `http://localhost:3000`

Para produção:
```bash
npm run build
npm start
```

## 🚂 Deploy no Railway

### Opção 1: Deploy via Git

1. **Conecte seu repositório ao Railway:**
   - Acesse [Railway](https://railway.app)
   - Crie um novo projeto
   - Selecione "Deploy from GitHub repo"
   - Escolha o repositório do dashboard

2. **Configure as variáveis de ambiente:**
   - No painel do Railway, vá em "Variables"
   - Adicione a variável `DATABASE_URL` com sua connection string:
     ```
     # Para banco local:
     DATABASE_URL=postgresql://postgres:abcadvise@2026@localhost:5432/postgres
     
     # Para banco Supabase (exemplo):
     # DATABASE_URL=postgresql://postgres.hccolkrnyrxcbxuuajwq:1d8vUnUlDXT7cmox@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
     ```

3. **Configure o build:**
   - Railway detectará automaticamente o Next.js
   - O build será executado automaticamente

### Opção 2: Deploy via Railway CLI

1. **Instale o Railway CLI:**
```bash
npm i -g @railway/cli
```

2. **Faça login:**
```bash
railway login
```

3. **Inicialize o projeto:**
```bash
railway init
```

4. **Adicione a variável de ambiente:**
```bash
railway variables set DATABASE_URL="postgresql://postgres:abcadvise@2026@localhost:5432/postgres"
```

5. **Faça o deploy:**
```bash
railway up
```

### Opção 3: Upload Manual

1. **Crie um arquivo `railway.json` na raiz do projeto:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Crie um arquivo `Procfile` (opcional):**
```
web: npm start
```

3. **No Railway:**
   - Crie um novo projeto
   - Selecione "Empty Project"
   - Faça upload dos arquivos ou conecte via Git
   - Configure a variável `DATABASE_URL` nas settings

## 📊 Estrutura do Banco de Dados

O dashboard espera uma tabela `LLM-Metrics` no schema `busca_fornecedor` com as seguintes colunas:

- `id` (serial/primary key)
- `timestamp` (timestamp)
- `num_requests_running` (numeric)
- `num_requests_waiting` (numeric)
- `kv_cache_usage_perc` (numeric)
- `avg_queue_time_seconds` (numeric)
- `gpu_util_percent` (numeric)
- `total_gb` (numeric)
- `used_gb` (numeric)
- `percent_memory` (numeric)
- `cpu_percent` (numeric)

## 🎨 Tecnologias Utilizadas

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização moderna
- **Recharts**: Gráficos interativos
- **PostgreSQL (pg)**: Cliente para conexão direta com o banco
- **date-fns**: Formatação de datas

## 📝 Notas Importantes

- O dashboard atualiza automaticamente a cada 2 segundos
- As métricas críticas são destacadas com cores de status (normal/warning/critical)
- KV Cache Usage acima de 85% é marcado como crítico
- Queue Time acima de 5 segundos é marcado como crítico
- O histórico mostra as últimas 100 métricas coletadas

## 🔧 Troubleshooting

### Erro de conexão com o banco
- Verifique se a `DATABASE_URL` está configurada corretamente
- Confirme que o banco está acessível e o schema/tabela existem
- Verifique as permissões de conexão do Supabase

### Dashboard não atualiza
- Verifique o console do navegador para erros
- Confirme que a API route `/api/metrics` está funcionando
- Verifique os logs do servidor

## 📄 Licença

Este projeto é de uso interno.
