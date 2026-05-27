// app/privacy/page.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy — UpgradeStacks',
  description: 'Privacy Policy for UpgradeStacks.',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors mb-4 inline-block">
          ← Home
        </Link>

        <h1 className="font-display font-extrabold text-4xl mb-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          {/* Overview */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Overview</h2>
            <p>
              At UpgradeStacks, we respect your privacy. This policy explains how we collect, use, and
              protect your information when you use our website and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Information We Collect</h2>
            <p className="mb-3">We may collect:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Email address</strong> — when you sign up or submit a tool</li>
              <li><strong>Profile information</strong> — name, username, bio (optional)</li>
              <li><strong>Usage data</strong> — pages visited, tools saved, stacks viewed</li>
              <li><strong>Device information</strong> — browser type, IP address, referrer</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To provide and improve our service</li>
              <li>To send account updates and security alerts</li>
              <li>To analyze site usage and improve user experience</li>
              <li>To prevent fraud and abuse</li>
            </ul>
          </section>

          {/* Authentication */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Authentication</h2>
            <p className="mb-3">
              We use <strong>Supabase Auth</strong> for secure authentication. You can sign in using:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Magic link (passwordless email authentication)</li>
              <li>Google OAuth (via Google Sign-In)</li>
            </ul>
            <p className="mt-3">
              Your password is never stored by us. Authentication is handled securely by Supabase.
            </p>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Data Storage & Security</h2>
            <p className="mb-3">
              Your data is stored on <strong>Supabase</strong> (PostgreSQL database hosted on AWS).
              We use industry-standard security practices including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>HTTPS encryption for all data in transit</li>
              <li>Encrypted connections to our database</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Third-Party Services</h2>
            <p className="mb-3">We use the following services:</p>
            <ul className="space-y-3 ml-2">
              <li>
                <strong>Supabase</strong> — Database and authentication
                <br />
                <span className="text-sm text-gray-500">Privacy: https://supabase.com/privacy</span>
              </li>
              <li>
                <strong>Vercel</strong> — Hosting and deployment
                <br />
                <span className="text-sm text-gray-500">Privacy: https://vercel.com/legal/privacy-policy</span>
              </li>
              <li>
                <strong>Google Analytics</strong> — Website usage analytics
                <br />
                <span className="text-sm text-gray-500">Privacy: https://policies.google.com/privacy</span>
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of analytics tracking</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights,{' '}
              <a href="mailto:rohit.p@fretron.in" className="text-accent hover:underline">
                contact us
              </a>
              .
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Cookies</h2>
            <p>
              We use cookies to maintain your session and remember your preferences. You can disable
              cookies in your browser settings, but some features may not work correctly.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Changes to This Policy</h2>
            <p>
              We may update this policy occasionally. We'll notify you of significant changes via email
              or by updating the "Last updated" date above.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Questions?</h2>
            <p>
              If you have any questions about this privacy policy, please{' '}
              <a href="mailto:rohit.p@fretron.in" className="text-accent hover:underline">
                contact us
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
