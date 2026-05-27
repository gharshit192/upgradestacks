// components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          <div className="md:col-span-2">
            <div className="font-display font-extrabold text-xl mb-3">
              Upgrade<span className="text-accent">Stacks</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              The complete stack for every type of person. Curated tools, apps, and resources
              verified by the community.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">
              Browse
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/category/creative" className="hover:text-accent transition-colors">Creative</Link></li>
              <li><Link href="/category/tech" className="hover:text-accent transition-colors">Tech & Dev</Link></li>
              <li><Link href="/category/finance" className="hover:text-accent transition-colors">Finance</Link></li>
              <li><Link href="/category/business" className="hover:text-accent transition-colors">Business</Link></li>
              <li><Link href="/category/health" className="hover:text-accent transition-colors">Health</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">
              Site
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/submit" className="hover:text-accent transition-colors">Submit a Tool</Link></li>
              <li><Link href="/about" className="hover:text-accent transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/sitemap.xml" className="hover:text-accent transition-colors">Sitemap</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} UpgradeStacks.com — All right reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
