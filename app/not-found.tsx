// app/not-found.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="font-display font-extrabold text-4xl mb-3">Stack Not Found</h1>
        <p className="text-gray-500 max-w-sm leading-relaxed mb-8">
          We don't have a stack for this yet — but we're growing every day.
          You can submit this profession and we'll build it.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/" className="btn-primary">Browse All Stacks</Link>
          <Link href="/submit" className="btn-secondary">Submit a Tool</Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
