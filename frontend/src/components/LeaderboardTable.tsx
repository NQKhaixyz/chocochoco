import React from 'react'

export function LeaderboardTable({
  title,
  columns,
  rows,
  loading,
  emptyText = 'No data',
  pageIndex,
  setPageIndex,
  canPrev,
  canNext,
  renderRow,
}: {
  title: string
  columns: string[]
  rows: any[]
  loading: boolean
  emptyText?: string
  pageIndex: number
  setPageIndex: (n: number) => void
  canPrev: boolean
  canNext: boolean
  renderRow: (r: any, i: number) => React.ReactNode
}) {
  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="text-lg font-semibold">{title}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              {columns.map((c) => (
                <th key={c} className="py-2 pr-6">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 text-gray-500" colSpan={columns.length}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="py-6 text-gray-500" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => renderRow(r, i))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between pt-1">
        <button className="px-3 py-1 rounded border" disabled={!canPrev} onClick={() => setPageIndex(pageIndex - 1)}>
          Prev
        </button>
        <div className="text-xs text-gray-500">Page {pageIndex + 1}</div>
        <button className="px-3 py-1 rounded border" disabled={!canNext} onClick={() => setPageIndex(pageIndex + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}

