'use client'
import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'
import AssetThumbnail from '@/components/AssetThumbnail'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

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

      <main className="max-w-6xl mx-auto px-6 py-10">
        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6 inline-block">← Back to library</a>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            All Assets {!loading && <span className="text-gray-400 font-normal text-base">({entries.length})</span>}
          </h1>
          {admin && (
            <button onClick={() => setEditMode(!editMode)}
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${editMode ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-[#d4d2c9] hover:border-[#b8b6ac]'}`}>
              {editMode ? 'Done' : 'Add URLs'}
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="bg-white rounded-lg border border-[#e2e0d3] overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-4 py-2 border-b border-[#e2e0d3] bg-[#f4f3ea]">
              <span className="text-xs font-medium uppercase tracking-widest text-gray-400">Title</span>
              <span className="text-xs font-medium uppercase tracking-widest text-gray-400">Kind</span>
              <span className="text-xs font-medium uppercase tracking-widest text-gray-400">Product/Topic</span>
              <span className="text-xs font-medium uppercase tracking-widest text-gray-400">Created</span>
              <span className="text-xs font-medium uppercase tracking-widest text-gray-400">Sharing</span>
            </div>

            {entries.map((item: any, i: number) => (
              <div key={item.id}>
                <a href={`/entry/${item.id}`}
                  className={`grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-4 py-3 items-center hover:bg-[#fafaf7] transition-colors ${i < entries.length - 1 ? 'border-b border-[#eeede6]' : ''}`}>
                  {/* Title + icon */}
                  <div className="flex items-center gap-3 min-w-0">
                    {item.file_type && (
                      <div className="shrink-0 scale-75 origin-left">
                        <AssetThumbnail fileType={item.file_type} />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900 truncate">{item.title}</span>
                  </div>
                  {/* Kind */}
                  <div className="flex flex-wrap gap-1">
                    {(item.tags ?? []).map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-[#eeede6] text-gray-500">{tag}</span>
                    ))}
                  </div>
                  {/* Topic */}
                  <span className="text-xs text-gray-500">{item.topic ?? '—'}</span>
                  {/* Date */}
                  <span className="text-xs text-gray-400 whitespace-nowrap">{item.created_at ? formatDate(item.created_at) : '—'}</span>
                  {/* Sharing */}
                  <span className="text-xs whitespace-nowrap">
                    {item.safe_to_share === true && <span className="font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Safe</span>}
                    {item.safe_to_share === false && <span className="font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">⚠ Internal</span>}
                    {item.safe_to_share === null && <span className="text-gray-300">—</span>}
                  </span>
                </a>
                {editMode && (
                  <div className="px-4 pb-2 flex gap-2">
                    <input
                      type="text"
                      defaultValue={item.url ?? ''}
                      placeholder="Paste URL here..."
                      onChange={e => setUrlDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="flex-1 border border-[#d4d2c9] rounded-md px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#b8b6ac]"
                    />
                    <button onClick={() => saveUrl(item.id)} disabled={saving === item.id}
                      className="text-sm px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
                      style={{ background: '#e5df00', color: '#000000' }}>
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
