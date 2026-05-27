// components/Navbar.tsx
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#fafaf8]/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link href="/" className="font-display font-extrabold text-xl text-primary">
          Upgrade<span className="text-accent">Stacks</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-500 hover:text-accent text-sm font-medium transition-colors">
            Home
          </Link>
          <Link href="/category" className="text-gray-500 hover:text-accent text-sm font-medium transition-colors">
            Browse
          </Link>
          <Link href="/submit" className="text-gray-500 hover:text-accent text-sm font-medium transition-colors">
            Submit Tool
          </Link>
          <Link href="/about" className="text-gray-500 hover:text-accent text-sm font-medium transition-colors">
            About
          </Link>
        </div>

        <Link
          href="/submit"
          className="bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Submit a Tool
        </Link>

      </div>
    </nav>
  )
}
