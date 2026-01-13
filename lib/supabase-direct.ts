import { Pool } from 'pg'

// Para conexão direta com PostgreSQL usando a connection string
let pool: Pool | null = null

export interface LLMMetrics {
  id?: number | string
  created_at?: string
  num_requests_running: number | string
  num_requests_waiting: number | string
  kv_cache_usage_perc: number
  avg_queue_time_seconds: number
  gpu_util_percent: number
  total_gb: number
  used_gb: number
  percent_memory: number
  cpu_percent: number
}

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    // Validar formato básico da connection string
    if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
      throw new Error('DATABASE_URL must start with postgresql:// or postgres://')
    }
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      // Configurações adicionais para melhor estabilidade
      max: 10, // máximo de conexões no pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  }
  return pool
}

export async function fetchMetricsDirect(limit: number = 100): Promise<LLMMetrics[]> {
  const client = getPool()
  try {
    // Tentar diferentes variações da query
    let result
    try {
      result = await client.query(
        `SELECT * FROM "busca_fornecedor"."LLM-Metrics" 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      )
    } catch (firstError: any) {
      // Se falhar, tentar sem aspas no schema
      console.error('First query attempt failed:', firstError.message)
      try {
        result = await client.query(
          `SELECT * FROM busca_fornecedor."LLM-Metrics" 
           ORDER BY created_at DESC 
           LIMIT $1`,
          [limit]
        )
      } catch (secondError: any) {
        console.error('Second query attempt failed:', secondError.message)
        throw new Error(`Query failed: ${firstError.message}. Tried alternative: ${secondError.message}`)
      }
    }
    
    // Converter strings numéricas para números
    return result.rows.map(row => ({
      ...row,
      id: typeof row.id === 'string' ? parseInt(row.id) : row.id,
      num_requests_running: typeof row.num_requests_running === 'string' 
        ? parseInt(row.num_requests_running) 
        : row.num_requests_running,
      num_requests_waiting: typeof row.num_requests_waiting === 'string' 
        ? parseInt(row.num_requests_waiting) 
        : row.num_requests_waiting,
    })) as LLMMetrics[]
  } catch (error) {
    console.error('Error fetching metrics:', error)
    // Adicionar mais contexto ao erro
    const dbError = error instanceof Error ? error : new Error(String(error))
    const errorMessage = dbError.message
    
    // Mensagens de erro mais específicas
    if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
      throw new Error(`Table or schema not found. Error: ${errorMessage}`)
    }
    if (errorMessage.includes('connection') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
      throw new Error(`Database connection failed. Error: ${errorMessage}`)
    }
    if (errorMessage.includes('password') || errorMessage.includes('authentication')) {
      throw new Error(`Authentication failed. Check DATABASE_URL credentials. Error: ${errorMessage}`)
    }
    
    throw new Error(`Database error: ${errorMessage}`)
  }
}

export async function fetchLatestMetricDirect(): Promise<LLMMetrics | null> {
  const client = getPool()
  try {
    // Tentar diferentes variações da query
    let result
    try {
      result = await client.query(
        `SELECT * FROM "busca_fornecedor"."LLM-Metrics" 
         ORDER BY created_at DESC 
         LIMIT 1`
      )
    } catch (firstError: any) {
      // Se falhar, tentar sem aspas no schema
      console.error('First query attempt failed:', firstError.message)
      try {
        result = await client.query(
          `SELECT * FROM busca_fornecedor."LLM-Metrics" 
           ORDER BY created_at DESC 
           LIMIT 1`
        )
      } catch (secondError: any) {
        console.error('Second query attempt failed:', secondError.message)
        throw new Error(`Query failed: ${firstError.message}. Tried alternative: ${secondError.message}`)
      }
    }
    
    if (!result.rows[0]) return null
    
    const row = result.rows[0]
    // Converter strings numéricas para números
    return {
      ...row,
      id: typeof row.id === 'string' ? parseInt(row.id) : row.id,
      num_requests_running: typeof row.num_requests_running === 'string' 
        ? parseInt(row.num_requests_running) 
        : row.num_requests_running,
      num_requests_waiting: typeof row.num_requests_waiting === 'string' 
        ? parseInt(row.num_requests_waiting) 
        : row.num_requests_waiting,
    } as LLMMetrics
  } catch (error) {
    console.error('Error fetching latest metric:', error)
    // Adicionar mais contexto ao erro
    const dbError = error instanceof Error ? error : new Error(String(error))
    const errorMessage = dbError.message
    
    // Mensagens de erro mais específicas
    if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
      throw new Error(`Table or schema not found. Error: ${errorMessage}`)
    }
    if (errorMessage.includes('connection') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
      throw new Error(`Database connection failed. Error: ${errorMessage}`)
    }
    if (errorMessage.includes('password') || errorMessage.includes('authentication')) {
      throw new Error(`Authentication failed. Check DATABASE_URL credentials. Error: ${errorMessage}`)
    }
    
    throw new Error(`Database error: ${errorMessage}`)
  }
}
