'use client'
// components/SubmitToolForm.tsx

import { useState } from 'react'

interface Props {
  professionSlug: string
}

export default function SubmitToolForm({ professionSlug }: Props) {
  const [form, setForm] = useState({
    tool_name: '',
    tool_url: '',
    category: '',
    reason: '',
    submitter_email: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/submit-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, profession_slug: professionSlug }),
      })

      if (res.ok) {
        setStatus('success')
        setForm({ tool_name: '', tool_url: '', category: '', reason: '', submitter_email: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <div className="text-2xl mb-2">✅</div>
        <p className="text-green-700 font-semibold text-sm">Tool submitted!</p>
        <p className="text-green-600 text-xs mt-1">We'll review and add it soon.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-3 text-xs text-green-600 underline"
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Tool name *"
        required
        value={form.tool_name}
        onChange={e => setForm(f => ({ ...f, tool_name: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                   focus:outline-none focus:border-accent bg-gray-50 focus:bg-white transition-colors"
      />
      <input
        type="url"
        placeholder="Tool website URL"
        value={form.tool_url}
        onChange={e => setForm(f => ({ ...f, tool_url: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                   focus:outline-none focus:border-accent bg-gray-50 focus:bg-white transition-colors"
      />
      <select
        value={form.category}
        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                   focus:outline-none focus:border-accent bg-gray-50 focus:bg-white transition-colors"
      >
        <option value="">Select category...</option>
        <option value="Design">Design</option>
        <option value="Productivity">Productivity</option>
        <option value="Learning">Learning</option>
        <option value="Earning">Earning</option>
        <option value="Development">Development</option>
        <option value="Finance">Finance</option>
        <option value="Marketing">Marketing</option>
        <option value="Community">Community</option>
        <option value="Other">Other</option>
      </select>
      <textarea
        placeholder="Why is this useful for this stack? (min 20 characters) *"
        required
        minLength={20}
        rows={2}
        value={form.reason}
        onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                   focus:outline-none focus:border-accent bg-gray-50 focus:bg-white transition-colors resize-none"
      />
      <input
        type="email"
        placeholder="Your email (optional — we'll credit you)"
        value={form.submitter_email}
        onChange={e => setForm(f => ({ ...f, submitter_email: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                   focus:outline-none focus:border-accent bg-gray-50 focus:bg-white transition-colors"
      />

      {status === 'error' && (
        <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold
                   hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Tool →'}
      </button>
    </form>
  )
}
