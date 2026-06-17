'use client'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'

export default function RequestPage() {
  const { data: session } = useSession()
  const admin = isAdmin(session?.user?.email)
  const [form, setForm] = useState({ name: '', email: session?.user?.email ?? '', asset: '', reason: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const res = await fetch('/api/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, email: form.email || session?.user?.email }),
    })
    setStatus(res.ok ? 'sent' : 'error')
  }

  return (
    <div className="min-h-screen bg-[#f4f3ea]">
      <nav className="bg-white border-b border-[#e2e0d3]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-semibold text-gray-900 hover:text-black transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            DocuSketch Sales & CS Library
          </a>
          <div className="flex items-center gap-6">
            <a href="/browse" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">View all assets</a>
            <a href="/request" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Request an asset</a>
            {admin && <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Admin</a>}
            <button onClick={() => signOut()}
              className="text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
              style={{ background: '#e5df00', color: '#000000' }}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-14">
        <h1 className="page-heading mb-2" style={{ color: '#000000' }}>Request an asset</h1>
        <p className="text-base text-gray-500 mb-8">Can't find what you need? Let us know and we'll add it to the library.</p>

        {status === 'sent' ? (
          <div className="bg-white rounded-lg border border-[#e2e0d3] p-8 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="font-semibold text-gray-900 mb-1">Request sent!</p>
            <p className="text-sm text-gray-500 mb-6">We'll look into it and add it to the library if we can.</p>
            <a href="/" className="text-sm font-medium px-4 py-2 rounded-md inline-block"
              style={{ background: '#e5df00', color: '#000000' }}>
              Back to library
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#e2e0d3] p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Your name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sarah Chen"
                className="w-full border border-[#d4d2c9] rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b8b6ac]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Your email</label>
              <input required type="email" value={form.email || session?.user?.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@docusketch.com"
                className="w-full border border-[#d4d2c9] rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b8b6ac]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">What asset are you looking for?</label>
              <input required value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })}
                placeholder="e.g. One-pager comparing DocuSketch vs. Hover"
                className="w-full border border-[#d4d2c9] rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b8b6ac]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Why do you need it? <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. A prospect keeps asking how we compare to Hover and I don't have a good answer."
                rows={3}
                className="w-full border border-[#d4d2c9] rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b8b6ac]" />
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
            )}
            <button type="submit" disabled={status === 'sending'}
              className="w-full py-2.5 rounded-md text-sm font-semibold disabled:opacity-50 transition-opacity"
              style={{ background: '#e5df00', color: '#000000' }}>
              {status === 'sending' ? 'Sending...' : 'Submit request'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
