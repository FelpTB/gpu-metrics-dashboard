# ✅ Checklist de Deploy - Railway

## 📋 ANTES DO DEPLOY - Configurações Necessárias

### 1. Variável de Ambiente Obrigatória

No painel do Railway, adicione:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres.hccolkrnyrxcbxuuajwq:1d8vUnUlDXT7cmox@aws-0-sa-east-1.pooler.supabase.com:5432/postgres` |

**Como adicionar:**
1. No projeto Railway, vá em **"Variables"**
2. Clique em **"New Variable"**
3. Nome: `DATABASE_URL`
4. Valor: Cole a connection string acima
5. Clique em **"Add"**

### 2. Verificações do Código

- [x] ✅ `railway.json` configurado
- [x] ✅ `Procfile` criado
- [x] ✅ `nixpacks.toml` criado (opcional)
- [x] ✅ `.gitignore` configurado
- [x] ✅ `next.config.js` otimizado para produção
- [x] ✅ Scripts do `package.json` corretos

### 3. Arquivos Preparados

Todos os arquivos necessários já estão criados:
- ✅ `railway.json` - Configuração do Railway
- ✅ `Procfile` - Comando de start
- ✅ `nixpacks.toml` - Configuração do builder (opcional)
- ✅ `DEPLOY_RAILWAY.md` - Guia completo de deploy

## 🚀 PROCESSO DE DEPLOY

### Passo 1: Preparar o Repositório (se usar GitHub)

```bash
# Se ainda não tem Git inicializado
git init
git add .
git commit -m "GPU Metrics Dashboard - Ready for Railway"
git branch -M main

# Se já tem repositório remoto
git remote add origin <SEU_REPO_GITHUB>
git push -u origin main
```

### Passo 2: Criar Projeto no Railway

1. Acesse: https://railway.app
2. Faça login (GitHub, Google, etc.)
3. Clique em **"New Project"**
4. Escolha uma das opções:
   - **"Deploy from GitHub repo"** (recomendado)
   - **"Empty Project"** (para upload manual)

### Passo 3: Configurar Variáveis de Ambiente

**IMPORTANTE:** Configure ANTES do primeiro deploy!

1. No projeto Railway, vá em **"Variables"**
2. Clique em **"New Variable"**
3. Adicione:
   - Nome: `DATABASE_URL`
   - Valor: `postgresql://postgres.hccolkrnyrxcbxuuajwq:1d8vUnUlDXT7cmox@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`
4. Clique em **"Add"**

### Passo 4: Deploy

- Se conectou via GitHub: O deploy é automático após o push
- Se usou upload manual: Clique em **"Deploy"**

### Passo 5: Verificar Deploy

1. Aguarde o build completar (2-5 minutos)
2. Verifique os logs em **"Deployments"**
3. Acesse a URL fornecida pelo Railway
4. Teste: `https://seu-projeto.up.railway.app/api/metrics?limit=1`

## 🔍 VERIFICAÇÃO PÓS-DEPLOY

### Testes a Fazer:

1. ✅ Dashboard carrega sem erros
2. ✅ Métricas são exibidas corretamente
3. ✅ Atualização em tempo real funciona
4. ✅ API `/api/metrics` retorna dados

### Se algo der errado:

1. Verifique os logs no Railway
2. Confirme que `DATABASE_URL` está configurada
3. Verifique se o banco Supabase está acessível
4. Veja o arquivo `DEPLOY_RAILWAY.md` para troubleshooting

## 📝 RESUMO RÁPIDO

**Única configuração obrigatória:**
- Variável `DATABASE_URL` no Railway

**Arquivos já prontos:**
- ✅ `railway.json`
- ✅ `Procfile`
- ✅ `nixpacks.toml`
- ✅ `next.config.js` (otimizado)

**Próximo passo:**
1. Adicione `DATABASE_URL` no Railway
2. Faça o deploy
3. Pronto! 🎉
