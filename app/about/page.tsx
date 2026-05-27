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
            <h2 className="font-display font-bold text-2xl text-primary mb-3">About the Founder</h2>
            <div className="bg-gray-50 rounded-xl p-6 mt-4">
              <h3 className="font-display font-bold text-lg mb-1">Harshit Gupta</h3>
              <p className="text-accent text-sm font-semibold mb-3">Founder, UpgradeStacks</p>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                I built UpgradeStacks because I spent way too much time researching tools. Whether I was
                switching jobs, learning a new skill, or starting a project, I'd end up in a rabbit hole
                of tabs, reviews, and comparisons. I realized professionals shouldn't have to do this alone.
              </p>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                UpgradeStacks is my attempt to create a single place where professionals can discover proven
                tool stacks verified by people who actually use them. No marketing fluff, just real tools that work.
              </p>

              <p className="text-sm text-gray-600 mb-4">
                <strong>Background:</strong> IT professional passionate about productivity, tools, and helping
                people work smarter. When I'm not building UpgradeStacks, you can find me exploring new tools,
                writing about tech, or helping other builders ship faster.
              </p>

              <div className="flex gap-3 pt-2">
                <a href="mailto:rohit.p@fretron.in" className="text-accent text-sm hover:underline">Email</a>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 text-sm">(Twitter & LinkedIn coming soon)</span>
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
