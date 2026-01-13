import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const databaseUrlLength = process.env.DATABASE_URL?.length || 0
    const nodeEnv = process.env.NODE_ENV
    
    // Tentar conectar ao banco
    let connectionTest = 'Not attempted'
    if (hasDatabaseUrl) {
      try {
        const { Pool } = await import('pg')
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        })
        const result = await pool.query('SELECT NOW()')
        await pool.end()
        connectionTest = `Success: ${result.rows[0].now}`
      } catch (error) {
        connectionTest = `Failed: ${error instanceof Error ? error.message : String(error)}`
      }
    }

    return NextResponse.json({
      environment: {
        nodeEnv,
        hasDatabaseUrl,
        databaseUrlLength,
        databaseUrlPreview: hasDatabaseUrl 
          ? `${process.env.DATABASE_URL?.substring(0, 30)}...` 
          : 'Not set'
      },
      connectionTest,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
