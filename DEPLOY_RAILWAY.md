# 🚂 Guia de Deploy no Railway

## ✅ Checklist Pré-Deploy

Antes de fazer o deploy, certifique-se de que:

- [x] ✅ Arquivo `railway.json` configurado
- [x] ✅ Arquivo `Procfile` criado
- [x] ✅ Scripts do `package.json` configurados
- [x] ✅ `.gitignore` configurado (`.env.local` não será commitado)
- [x] ✅ Código testado localmente

## 📋 Configurações Necessárias no Railway

### 1. Variável de Ambiente Obrigatória

**Nome:** `DATABASE_URL`  
**Valor:** 
```
postgresql://postgres.hccolkrnyrxcbxuuajwq:1d8vUnUlDXT7cmox@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### 2. Variáveis de Ambiente Opcionais (Recomendadas)

**Nome:** `NODE_ENV`  
**Valor:** `production`

**Nome:** `PORT`  
**Valor:** (deixe vazio - Railway define automaticamente)

## 🚀 Opções de Deploy

### Opção 1: Deploy via GitHub (Recomendado)

1. **Faça commit e push do código:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - GPU Metrics Dashboard"
   git remote add origin <SEU_REPOSITORIO_GITHUB>
   git push -u origin main
   ```

2. **No Railway:**
   - Acesse [railway.app](https://railway.app)
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório
   - Railway detectará automaticamente o Next.js

3. **Configure as variáveis de ambiente:**
   - Vá em "Variables" no projeto
   - Clique em "New Variable"
   - Adicione `DATABASE_URL` com o valor da connection string
   - Clique em "Deploy"

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
   railway variables set DATABASE_URL="postgresql://postgres.hccolkrnyrxcbxuuajwq:1d8vUnUlDXT7cmox@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
   ```

5. **Faça o deploy:**
   ```bash
   railway up
   ```

### Opção 3: Deploy via Upload Manual

1. **Crie um arquivo ZIP do projeto** (sem `node_modules` e `.next`)

2. **No Railway:**
   - Crie um novo projeto
   - Selecione "Empty Project"
   - Vá em "Settings" > "Source"
   - Faça upload do ZIP ou conecte via Git
   - Configure a variável `DATABASE_URL` em "Variables"

## ⚙️ Configurações do Railway

### Build Settings

O Railway detectará automaticamente:
- **Builder:** NIXPACKS (definido no `railway.json`)
- **Build Command:** `npm run build` (automático para Next.js)
- **Start Command:** `npm start` (definido no `Procfile`)

### Port Configuration

O Railway define automaticamente a variável `PORT`. O Next.js usará essa porta automaticamente.

### Health Check (Opcional)

Railway verifica automaticamente se a aplicação está respondendo na porta configurada.

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:

1. **Logs do Railway:**
   - Vá em "Deployments" > Selecione o deploy mais recente
   - Verifique os logs para erros

2. **Acesse a URL:**
   - Railway fornecerá uma URL como: `https://seu-projeto.up.railway.app`
   - Acesse e verifique se o dashboard carrega

3. **Teste a API:**
   - Acesse: `https://seu-projeto.up.railway.app/api/metrics?limit=1`
   - Deve retornar JSON com as métricas

## 🐛 Troubleshooting

### Erro: "DATABASE_URL is not set"
- Verifique se a variável foi adicionada corretamente
- Confirme que não há espaços extras no valor
- Reinicie o deploy após adicionar a variável

### Erro: "Cannot connect to database"
- Verifique se a connection string está correta
- Confirme que o banco Supabase está acessível
- Verifique se há restrições de IP no Supabase (pode precisar permitir Railway IPs)

### Build falha
- Verifique os logs do build no Railway
- Confirme que todas as dependências estão no `package.json`
- Verifique se não há erros de TypeScript

### Aplicação não inicia
- Verifique os logs de runtime
- Confirme que o `Procfile` está correto
- Verifique se a porta está sendo usada corretamente

## 📝 Notas Importantes

- O Railway usa **NIXPACKS** como builder, que detecta automaticamente Next.js
- A variável `DATABASE_URL` **NÃO** deve ser commitada no Git (já está no `.gitignore`)
- O Railway fornece HTTPS automaticamente
- O deploy é automático a cada push (se conectado via GitHub)

## 🔗 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway Status](https://status.railway.app)
