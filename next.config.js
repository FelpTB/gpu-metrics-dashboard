/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuração para produção no Railway
  output: 'standalone', // Otimiza o build para produção
}

module.exports = nextConfig
