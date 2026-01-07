import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en/dashboards/rentals',
        permanent: true,
        locale: false
      },
      {
        source: '/login',
        destination: '/en/login',
        permanent: false,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/dashboards/rentals',
        permanent: true,
        locale: false
      },
      {
        source: '/:path((?!en|fr|ar|front-pages|images|api|favicon.ico).*)*',
        destination: '/en/:path*',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
