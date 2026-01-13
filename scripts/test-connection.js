// Script para testar a conexão com o banco de dados
// Execute com: node scripts/test-connection.js

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL não está configurada!')
  console.log('Configure a variável DATABASE_URL no arquivo .env.local')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function testConnection() {
  try {
    console.log('🔌 Testando conexão com o banco de dados...')
    
    // Teste básico de conexão
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Conexão estabelecida com sucesso!')
    console.log('⏰ Hora do servidor:', result.rows[0].now)
    
    // Verificar se o schema existe
    const schemaResult = await pool.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'busca_fornecedor'`
    )
    
    if (schemaResult.rows.length === 0) {
      console.warn('⚠️  Schema "busca_fornecedor" não encontrado!')
    } else {
      console.log('✅ Schema "busca_fornecedor" encontrado!')
    }
    
    // Verificar se a tabela existe
    const tableResult = await pool.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'busca_fornecedor' 
       AND table_name = 'LLM-Metrics'`
    )
    
    if (tableResult.rows.length === 0) {
      console.warn('⚠️  Tabela "LLM-Metrics" não encontrada no schema "busca_fornecedor"!')
    } else {
      console.log('✅ Tabela "LLM-Metrics" encontrada!')
      
      // Contar registros
      const countResult = await pool.query(
        `SELECT COUNT(*) as count FROM "busca_fornecedor"."LLM-Metrics"`
      )
      console.log(`📊 Total de registros: ${countResult.rows[0].count}`)
      
      // Primeiro, listar as colunas da tabela
      const columnsResult = await pool.query(
        `SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_schema = 'busca_fornecedor' 
         AND table_name = 'LLM-Metrics'
         ORDER BY ordinal_position`
      )
      
      console.log('📋 Colunas da tabela:')
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`)
      })
      
      // Buscar última métrica (sem especificar timestamp)
      const latestResult = await pool.query(
        `SELECT * FROM "busca_fornecedor"."LLM-Metrics" LIMIT 1`
      )
      
      if (latestResult.rows.length > 0) {
        console.log('\n📈 Exemplo de métrica:')
        console.log(JSON.stringify(latestResult.rows[0], null, 2))
      } else {
        console.log('ℹ️  Nenhuma métrica encontrada na tabela')
      }
    }
    
    await pool.end()
    console.log('\n✅ Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message)
    console.error('Detalhes:', error)
    await pool.end()
    process.exit(1)
  }
}

testConnection()
