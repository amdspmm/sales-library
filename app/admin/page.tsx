'use client'
import { useState, useEffect, Suspense } from 'react'
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
}

const FILE_TYPES = ['PDF', 'Video', 'Email', 'Presentation', 'Webpage', 'Document', 'Spreadsheet', 'Other']

function AdminPageInner() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [form, setForm] = useState({ title: '', summary: '', content: '', url: '', file_type: '', tags: '' })
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
    setForm({ title: '', summary: '', content: '', url: '', file_type: '', tags: '' })
    setMessage('')
  }

  function startEdit(entry: Entry) {
    setEditing(entry)
    setForm({
      title: entry.title,
      summary: entry.summary,
      content: entry.content,
      url: entry.url ?? '',
      file_type: entry.file_type ?? '',
      tags: (entry.tags ?? []).join(', '),
    })
    setMessage('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      id: editing?.id,
      file_type: form.file_type || null,
    }
    const res = await fetch('/api/entries', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setMessage(editing ? 'Updated!' : 'Added!')
      setEditing(null)
      setForm({ title: '', summary: '', content: '', url: '', file_type: '', tags: '' })
      fetchEntries()
    } else {
      setMessage('Something went wrong.')
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
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
              placeholder="Tags, comma separated"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400" />
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
            {message && <p className="text-sm text-green-600">{message}</p>}
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
