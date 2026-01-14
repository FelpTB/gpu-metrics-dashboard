const { Pool } = require('pg')

const connectionString = 'postgresql://postgres:abcadvise@2026@localhost:5432/postgres'

console.log('Testando conexão com banco local...')
console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@')) // Ocultar senha

const pool = new Pool({
  connectionString,
  ssl: false // Banco local geralmente não usa SSL
})

async function testConnection() {
  try {
    console.log('\n1. Testando conexão básica...')
    const client = await pool.connect()
    console.log('✓ Conexão estabelecida com sucesso!')
    
    console.log('\n2. Testando query simples...')
    const result = await client.query('SELECT NOW() as current_time')
    console.log('✓ Query executada:', result.rows[0].current_time)
    
    console.log('\n3. Verificando schema busca_fornecedor...')
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'busca_fornecedor'
    `)
    
    if (schemaResult.rows.length > 0) {
      console.log('✓ Schema busca_fornecedor encontrado!')
    } else {
      console.log('⚠ Schema busca_fornecedor não encontrado')
    }
    
    console.log('\n4. Verificando tabela LLM-Metrics...')
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'busca_fornecedor' 
      AND table_name = 'LLM-Metrics'
    `)
    
    if (tableResult.rows.length > 0) {
      console.log('✓ Tabela LLM-Metrics encontrada!')
    } else {
      console.log('⚠ Tabela LLM-Metrics não encontrada')
    }
    
    console.log('\n5. Verificando tabela result_vllm_test...')
    const errorTableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'busca_fornecedor' 
      AND table_name = 'result_vllm_test'
    `)
    
    if (errorTableResult.rows.length > 0) {
      console.log('✓ Tabela result_vllm_test encontrada!')
    } else {
      console.log('⚠ Tabela result_vllm_test não encontrada')
    }
    
    console.log('\n6. Testando query de métricas...')
    const metricsResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM "busca_fornecedor"."LLM-Metrics"
    `)
    console.log(`✓ Total de métricas: ${metricsResult.rows[0].count}`)
    
    console.log('\n7. Testando query de erros...')
    const errorsResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM "busca_fornecedor"."result_vllm_test"
      WHERE error = true
    `)
    console.log(`✓ Total de erros: ${errorsResult.rows[0].count}`)
    
    client.release()
    console.log('\n✅ Todos os testes passaram! Conexão funcionando corretamente.')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Erro ao testar conexão:')
    console.error('Mensagem:', error.message)
    console.error('Código:', error.code)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

testConnection()
