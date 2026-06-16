'use client'
import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'
import AssetCard from '@/components/AssetCard'

export default function BrowsePage() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const admin = isAdmin(session?.user?.email)

  useEffect(() => {
    fetch('/api/entries').then(r => r.json()).then(d => {
      setEntries(d.entries ?? [])
      setLoading(false)
    })
  }, [])

  async function saveUrl(id: string) {
    setSaving(id)
    const url = urlDrafts[id] ?? ''
    await fetch('/api/entries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, url }),
    })
    setEntries(prev => prev.map(e => e.id === id ? { ...e, url } : e))
    setSaving(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-semibold text-gray-900 hover:text-black transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            DocuSketch Sales & CS Library
          </a>
          <div className="flex items-center gap-6">
            {admin && (
              <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Admin</a>
            )}
            <button onClick={() => signOut()}
              className="text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
              style={{ background: '#e5df00', color: '#000000' }}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6 inline-block">← Back to library</a>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            All Assets {!loading && <span className="text-gray-400 font-normal text-base">({entries.length})</span>}
          </h1>
          {admin && (
            <button onClick={() => setEditMode(!editMode)}
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${editMode ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
              {editMode ? 'Done' : 'Add URLs'}
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-2">
            {entries.map((item: any) => (
              <div key={item.id}>
                <AssetCard item={item} admin={admin} />
                {editMode && (
                  <div className="mt-1 flex gap-2 px-1">
                    <input
                      type="text"
                      defaultValue={item.url ?? ''}
                      placeholder="Paste URL here..."
                      onChange={e => setUrlDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                    />
                    <button
                      onClick={() => saveUrl(item.id)}
                      disabled={saving === item.id}
                      className="text-sm px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
                      style={{ background: '#e5df00', color: '#000000' }}
                    >
                      {saving === item.id ? '...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
