'use client'
import AssetThumbnail from './AssetThumbnail'

type Props = {
  item: any
  admin: boolean
  activeTag?: string
}

function cardBg(_safe: boolean | null | undefined) {
  return 'bg-white border-[#e2e0d3] hover:border-[#d4d2c9]'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export default function AssetCard({ item, admin, activeTag }: Props) {
  return (
    <div className={`rounded-lg border p-5 transition-colors ${cardBg(item.safe_to_share)}`}>
      <div className="flex items-start gap-4">
        {item.file_type && (
          <div className="shrink-0 mt-0.5">
            <AssetThumbnail fileType={item.file_type} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <a href={`/entry/${item.id}`} className="font-semibold text-gray-900 hover:underline underline-offset-2 leading-snug flex-1">
              {item.title}
            </a>
            {item.safe_to_share === true && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0 mt-0.5">✓ Safe to share</span>
            )}
            {item.safe_to_share === false && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0 mt-0.5">⚠ Internal only</span>
            )}
          </div>
          {item.summary && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.summary}</p>
          )}

          {/* Metadata — horizontal */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {item.file_type && (
              <span className="text-xs text-gray-500">
                <span className="text-gray-400">Type:</span> {item.file_type}
              </span>
            )}
            {item.tags && item.tags.length > 0 && (
              <>
                {(item.file_type) && <span className="text-gray-300 text-xs">|</span>}
                <span className="text-xs text-gray-400">Kind:</span>
                <span className="flex flex-wrap gap-1 -ml-2">
                  {item.tags.map((tag: string, i: number) => (
                    <span key={tag} className="text-xs text-gray-500">
                      <a
                        href={`/tag/${encodeURIComponent(tag)}`}
                        className={`hover:underline ${tag === activeTag ? 'font-semibold text-yellow-700' : ''}`}
                      >{tag}</a>{i < item.tags.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </span>
              </>
            )}
            {item.topic && (
              <>
                <span className="text-gray-300 text-xs">|</span>
                <span className="text-xs text-gray-500">
                  <span className="text-gray-400">Product/Topic:</span> {item.topic}
                </span>
              </>
            )}
            {item.created_at && (
              <>
                <span className="text-gray-300 text-xs">|</span>
                <span className="text-xs text-gray-500">
                  <span className="text-gray-400">Created:</span> {formatDate(item.created_at)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
