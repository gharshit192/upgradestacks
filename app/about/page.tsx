// app/about/page.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'About — UpgradeStacks',
  description: 'Learn about UpgradeStacks and our mission to help professionals find the right tools.',
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors mb-4 inline-block">
          ← Home
        </Link>

        <h1 className="font-display font-extrabold text-4xl mb-4">About UpgradeStacks</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-600">
          {/* Mission */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Our Mission</h2>
            <p className="leading-relaxed">
              UpgradeStacks is a curated directory of tools, apps, and resources for every profession.
              We believe that finding the right tools shouldn't take hours of research. Our goal is to
              help professionals at every stage discover verified, community-recommended stacks that work.
            </p>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">How It Works</h2>
            <p className="leading-relaxed">
              For each profession, we curate a complete "stack" of tools across different categories
              (design, development, collaboration, analytics, etc.). Each tool is verified and rated by
              our community. Whether you're a graphic designer, data analyst, or startup founder — find
              exactly what you need to do your best work.
            </p>
          </section>

          {/* Community */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Community-Driven</h2>
            <p className="leading-relaxed">
              This isn't a marketing platform. Real professionals share the tools they actually use.
              If you've discovered a tool that's changed your workflow, you can submit it to help others.
            </p>
          </section>

          {/* Creator */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Made By</h2>
            <div className="bg-gray-50 rounded-xl p-6 mt-4">
              <h3 className="font-display font-bold text-lg mb-2">Harshit Gupta</h3>
              <p className="text-sm text-gray-600 mb-3">
                [Add your bio here — what you do, your background, why you built this]
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-accent text-sm hover:underline">Twitter</a>
                <a href="#" className="text-accent text-sm hover:underline">LinkedIn</a>
                <a href="mailto:rohit.p@fretron.in" className="text-accent text-sm hover:underline">Email</a>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Get In Touch</h2>
            <p className="leading-relaxed">
              Found a bug? Have a suggestion? Want to submit your stack?{' '}
              <Link href="mailto:rohit.p@fretron.in" className="text-accent hover:underline">
                Email us
              </Link>
              {' '}or{' '}
              <Link href="/submit" className="text-accent hover:underline">
                submit a tool
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
