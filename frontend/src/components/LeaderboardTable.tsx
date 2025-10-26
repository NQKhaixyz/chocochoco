import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface LeaderboardTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onRetry?: () => void;
  emptyMessage?: string;
}

export function LeaderboardTable<T>({
  title,
  columns,
  data,
  loading,
  error,
  currentPage,
  pageSize,
  hasMore,
  onPrevPage,
  onNextPage,
  onRetry,
  emptyMessage = 'No data available',
}: LeaderboardTableProps<T>) {
  const hasPrev = currentPage > 1;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="text-xl font-bold text-gray-900 dark:text-white">{title}</div>

      {/* Error State */}
      {error && (
        <div className="py-8 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`py-2 pr-6 font-medium text-gray-700 dark:text-gray-300 ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-700">
                  {columns.map((column) => (
                    <td key={column.key} className={`py-3 pr-6 ${column.className || ''}`}>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="py-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`py-2 pr-6 font-medium text-gray-700 dark:text-gray-300 ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`py-3 pr-6 text-gray-900 dark:text-gray-100 ${column.className || ''}`}
                    >
                      {column.render(item, (currentPage - 1) * pageSize + index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && data.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onPrevPage}
            disabled={!hasPrev}
            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
              hasPrev
                ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage}</div>
          <button
            onClick={onNextPage}
            disabled={!hasMore}
            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
              hasMore
                ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}


