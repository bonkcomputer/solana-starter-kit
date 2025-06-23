/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.privy.io https://privy.bonk.computer https://*.privy.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: wss: https://*.privy.io",
              "frame-src 'self' https://auth.privy.io https://privy.bonk.computer https://birdeye.so",
              "frame-ancestors 'self' https://bcttrading.vercel.app https://auth.privy.io https://privy.bonk.computer",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
