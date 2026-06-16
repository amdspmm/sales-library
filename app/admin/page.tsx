'use client'
import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { isAdmin } from '@/lib/admins'
import AssetThumbnail from '@/components/AssetThumbnail'

type Entry = {
  id: string
  title: string
  summary: string
  content: string
  url: string
  file_type: string
  tags: string[]
  topic: string
  safe_to_share: boolean | null
}

const FILE_TYPES = ['PDF', 'Video', 'Email', 'Presentation', 'Webpage', 'Document', 'Spreadsheet', 'Other']

function AdminPageInner() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [form, setForm] = useState({ title: '', summary: '', content: '', url: '', file_type: '', tags: [] as string[], topic: '', safe_to_share: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchEntries() }, [])

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && entries.length > 0) {
      const entry = entries.find(e => e.id === editId)
      if (entry) startEdit(entry)
    }
  }, [entries, searchParams])

  // Derive all unique Kind values from existing entries, sorted alphabetically
  const allKinds = useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => (e.tags ?? []).forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [entries])

  if (!isAdmin(session?.user?.email)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Access denied.</div>
  }

  async function fetchEntries() {
    const res = await fetch('/api/entries')
    const data = await res.json()
    setEntries(data.entries ?? [])
    setLoading(false)
  }

  function startNew() {
    setEditing(null)
    setForm({ title: '', summary: '', content: '', url: '', file_type: '', tags: [], topic: '', safe_to_share: '' })
    setMessage('')
  }

  function startEdit(entry: Entry) {
    setEditing(entry)
    setForm({
      title: entry.title,
      summary: entry.summary ?? '',
      content: entry.content ?? '',
      url: entry.url ?? '',
      file_type: entry.file_type ?? '',
      tags: entry.tags ?? [],
      topic: entry.topic ?? '',
      safe_to_share: entry.safe_to_share === true ? 'true' : entry.safe_to_share === false ? 'false' : '',
    })
    setMessage('')
  }

  function toggleTag(tag: string) {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body = {
      ...form,
      id: editing?.id,
      file_type: form.file_type || null,
      topic: form.topic || null,
      safe_to_share: form.safe_to_share === 'true' ? true : form.safe_to_share === 'false' ? false : null,
    }
    const res = await fetch('/api/entries', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setMessage(editing ? 'success' : 'added')
      if (!editing) {
        setForm({ title: '', summary: '', content: '', url: '', file_type: '', tags: [], topic: '', safe_to_share: '' })
      }
      fetchEntries()
    } else {
      setMessage('error')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch('/api/entries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchEntries()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-semibold text-gray-900 hover:text-black transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            DocuSketch Sales & CS Library
          </a>
          <div className="flex items-center gap-6">
            <a href="/browse" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Quick Edit</a>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {editing && (
          <div className="mb-2">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{ background: '#e5df00', color: '#000000' }}>
              ← Back to library
            </a>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-5" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {editing ? 'Edit Entry' : 'Add New Entry'}
          </h2>
          <form onSubmit={handleSave} className="space-y-3">
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Title"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400" />
            <input value={form.summary} onChange={e => setForm({...form, summary: e.target.value})}
              placeholder="Short summary (optional)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400" />
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
              placeholder="Full content / talking points (optional)" rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400" />
            <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
              placeholder="Link to asset (optional)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400" />
            <select value={form.file_type} onChange={e => setForm({...form, file_type: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400">
              <option value="">File type (optional)</option>
              {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400">
              <option value="">Product / Topic (optional)</option>
              <option>Sketching</option>
              <option>Mitigation</option>
              <option>Documenting/Camera</option>
              <option>Scoping</option>
              <option>Estimating</option>
              <option>General</option>
              <option>Other</option>
            </select>
            <select value={form.safe_to_share} onChange={e => setForm({...form, safe_to_share: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400">
              <option value="">Sharing — not set</option>
              <option value="true">✓ Safe to share externally</option>
              <option value="false">⚠ Internal only</option>
            </select>

            {/* Kind multi-select */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Kind</p>
              {allKinds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allKinds.map(kind => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => toggleTag(kind)}
                      className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                        form.tags.includes(kind)
                          ? 'border-transparent font-medium'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                      style={form.tags.includes(kind) ? { background: '#e5df00', color: '#000000', borderColor: '#e5df00' } : {}}
                    >
                      {kind}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No kinds defined yet — add entries first.</p>
              )}
              {/* New kind input */}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new kind..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (val && !form.tags.includes(val)) {
                        setForm(prev => ({ ...prev, tags: [...prev.tags, val] }))
                      }
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
                <span className="text-xs text-gray-400 self-center">press Enter to add</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-opacity"
                style={{ background: '#e5df00', color: '#000000' }}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Add Entry'}
              </button>
              {editing && (
                <button type="button" onClick={startNew}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
            {message === 'success' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
                ✓ Entry updated successfully
              </div>
            )}
            {message === 'added' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
                ✓ Entry added
              </div>
            )}
            {message === 'error' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                ✗ Something went wrong. Please try again.
              </div>
            )}
          </form>
        </div>

        {/* Entry list */}
        {!editing && <div>
          <h2 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            All Entries <span className="text-gray-400 font-normal">({entries.length})</span>
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-gray-400">No entries yet.</p>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <div key={entry.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      {entry.file_type && (
                        <div className="shrink-0 scale-75 origin-top-left mt-0.5">
                          <AssetThumbnail fileType={entry.file_type} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm leading-snug">{entry.title}</p>
                        {entry.summary && <p className="text-xs text-gray-400 mt-0.5 truncate">{entry.summary}</p>}
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => startEdit(entry)} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(entry.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                    </div>
                  </div>
                  {entry.tags?.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {entry.tags.map(tag => (
                        <a key={tag} href={`/tag/${encodeURIComponent(tag)}`}
                          className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded hover:bg-gray-200 hover:text-gray-600 transition-colors">{tag}</a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>}

      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminPageInner />
    </Suspense>
  )
}
