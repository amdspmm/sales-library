'use client'
import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'
import AssetThumbnail from '@/components/AssetThumbnail'

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
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-5">
        <header className="bg-white rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm max-w-5xl mx-auto">
          <a href="/" className="text-lg font-bold" style={{ fontFamily: 'Lora, Georgia, serif', color: '#000000' }}>Sales Library°</a>
          <div className="flex gap-4 items-center">
            {admin && (
              <a href="/admin" className="text-sm font-medium hover:opacity-70" style={{ color: '#000000' }}>Admin</a>
            )}
            <button onClick={() => signOut()}
              className="text-sm font-medium px-4 py-2 rounded-xl"
              style={{ background: '#e5df00', color: '#000000' }}>
              Sign out
            </button>
          </div>
        </header>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            All Assets {!loading && <span className="text-gray-400 font-normal text-lg">({entries.length})</span>}
          </h2>
          {admin && (
            <button onClick={() => setEditMode(!editMode)}
              className={`text-sm px-4 py-2 rounded-lg border transition ${editMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
              {editMode ? 'Done editing' : 'Add URLs'}
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-3">
            {entries.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-4">
                  {item.file_type && (
                    <div className="shrink-0">
                      {item.url
                        ? <a href={item.url} target="_blank" rel="noopener noreferrer"><AssetThumbnail fileType={item.file_type} /></a>
                        : <AssetThumbnail fileType={item.file_type} />
                      }
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {item.url
                      ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">{item.title}</a>
                      : <p className="font-semibold text-gray-900">{item.title}</p>
                    }
                    {item.summary && <p className="text-sm text-gray-500 mt-1">{item.summary}</p>}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {item.tags.map((tag: string) => (
                          <a key={tag} href={`/tag/${encodeURIComponent(tag)}`}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition">{tag}</a>
                        ))}
                      </div>
                    )}
                    {editMode && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          defaultValue={item.url ?? ''}
                          placeholder="Paste URL here..."
                          onChange={e => setUrlDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => saveUrl(item.id)}
                          disabled={saving === item.id}
                          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving === item.id ? '...' : 'Save'}
                        </button>
                      </div>
                    )}
                    {!editMode && item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="mt-1 block text-xs text-gray-400 hover:text-blue-600 truncate">{item.url}</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
