/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://upgradestacks.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
  // Stack pages get highest priority
  transform: async (config, path) => {
    if (path.startsWith('/stack/')) {
      return { loc: path, changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString() }
    }
    if (path.startsWith('/category/')) {
      return { loc: path, changefreq: 'weekly', priority: 0.8, lastmod: new Date().toISOString() }
    }
    if (path.startsWith('/tool/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.6, lastmod: new Date().toISOString() }
    }
    return { loc: path, changefreq: config.changefreq, priority: config.priority, lastmod: new Date().toISOString() }
  },
}
