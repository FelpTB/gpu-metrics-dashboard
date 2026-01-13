# 🚀 Guia Rápido - Iniciar Dashboard Localmente

## Passo a Passo

### 1. ✅ Instalar Dependências (JÁ FEITO)
```bash
npm install
```

### 2. ✅ Configurar Variável de Ambiente (JÁ FEITO)
O arquivo `.env.local` já foi criado com sua connection string.

### 3. (Opcional) Testar Conexão com o Banco
```bash
npm run test:connection
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

### 5. Acessar o Dashboard
Abra seu navegador em: **http://localhost:3000**

---

## Comandos Úteis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção (após build)
- `npm run test:connection` - Testa conexão com banco
- `npm run lint` - Verifica erros de código

---

## Solução de Problemas

### Erro: "DATABASE_URL is not set"
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Confirme que a connection string está correta

### Erro de conexão com banco
- Execute `npm run test:connection` para diagnosticar
- Verifique se o banco Supabase está acessível
- Confirme que o schema `busca_fornecedor` e tabela `LLM-Metrics` existem

### Porta 3000 já em uso
- Feche outros processos usando a porta 3000
- Ou use: `npm run dev -- -p 3001` para usar outra porta
