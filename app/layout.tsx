import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GPU Metrics Dashboard',
  description: 'Dashboard em tempo real para métricas de GPU e vLLM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
