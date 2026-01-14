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

export interface VLLMError {
  id: number | string
  created_at: string
  error: boolean
  error_message: string | null
}

export interface GroupedError {
  time: string
  timestamp: Date
  count: number
  errors: VLLMError[]
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

// Função para buscar erros da tabela result_vllm_test
export async function fetchErrorsDirect(limit: number = 1000): Promise<VLLMError[]> {
  const client = getPool()
  try {
    let result
    try {
      result = await client.query(
        `SELECT id, created_at, error, error_message 
         FROM "busca_fornecedor"."result_vllm_test" 
         WHERE error = true 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      )
    } catch (firstError: any) {
      console.error('First error query attempt failed:', firstError.message)
      try {
        result = await client.query(
          `SELECT id, created_at, error, error_message 
           FROM busca_fornecedor.result_vllm_test 
           WHERE error = true 
           ORDER BY created_at DESC 
           LIMIT $1`,
          [limit]
        )
      } catch (secondError: any) {
        console.error('Second error query attempt failed:', secondError.message)
        // Não lançar erro, apenas retornar array vazio se falhar
        return []
      }
    }
    
    return result.rows.map(row => ({
      id: typeof row.id === 'string' ? parseInt(row.id) : row.id,
      created_at: row.created_at,
      error: row.error,
      error_message: row.error_message
    })) as VLLMError[]
  } catch (error) {
    console.error('Error fetching errors:', error)
    // Não lançar erro, apenas retornar array vazio se falhar
    return []
  }
}

// Helper function para formatar data
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// Função para agrupar erros próximos no tempo (dentro de 5 segundos)
// Agrupa apenas erros que estão dentro de 5 segundos do último erro do grupo
export function groupErrorsByTime(errors: VLLMError[], timeWindowSeconds: number = 5): GroupedError[] {
  if (errors.length === 0) return []
  
  // Ordenar por data
  const sortedErrors = [...errors].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  
  const grouped: GroupedError[] = []
  let currentGroup: VLLMError[] = [sortedErrors[0]]
  let lastErrorTime = new Date(sortedErrors[0].created_at)
  
  for (let i = 1; i < sortedErrors.length; i++) {
    const errorTime = new Date(sortedErrors[i].created_at)
    // Comparar com o último erro do grupo, não com o primeiro
    const timeDiff = (errorTime.getTime() - lastErrorTime.getTime()) / 1000 // em segundos
    
    if (timeDiff <= timeWindowSeconds) {
      // Adicionar ao grupo atual se estiver dentro de 5 segundos do último erro
      currentGroup.push(sortedErrors[i])
      lastErrorTime = errorTime // Atualizar o tempo do último erro
    } else {
      // Finalizar grupo atual e começar novo
      const firstError = currentGroup[0]
      grouped.push({
        time: formatTime(new Date(firstError.created_at)),
        timestamp: new Date(firstError.created_at),
        count: currentGroup.length,
        errors: currentGroup
      })
      
      currentGroup = [sortedErrors[i]]
      lastErrorTime = errorTime
    }
  }
  
  // Adicionar último grupo
  if (currentGroup.length > 0) {
    const firstError = currentGroup[0]
    grouped.push({
      time: formatTime(new Date(firstError.created_at)),
      timestamp: new Date(firstError.created_at),
      count: currentGroup.length,
      errors: currentGroup
    })
  }
  
  return grouped
}
