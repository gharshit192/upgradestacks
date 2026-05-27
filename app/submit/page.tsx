// app/submit/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SubmitToolForm from '@/components/SubmitToolForm'

export const metadata = {
  title: 'Submit a Tool — Help Us Grow UpgradeStacks',
  description: 'Know a great tool that should be in a stack? Submit it and help the community.',
}

export default function SubmitPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🛠</div>
          <h1 className="font-display font-extrabold text-3xl mb-3">Submit a Tool</h1>
          <p className="text-gray-500 leading-relaxed">
            Know a tool that should be in a stack but isn't listed?
            Submit it and we'll review and add it — with credit to you.
          </p>
        </div>
        <div className="card">
          <SubmitToolForm professionSlug="" />
        </div>
      </div>
      <Footer />
    </>
  )
}
