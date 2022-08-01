/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com']
  },
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it'
  }
}

module.exports = nextConfig
