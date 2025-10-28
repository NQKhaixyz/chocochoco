// Add React import at the top
import React, { useCallback, useMemo, useRef } from 'react'

/**
 * Custom hook for debouncing expensive operations
 * Useful for search inputs, window resize handlers, etc.
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

/**
 * Custom hook for throttling expensive operations
 * Ensures function is called at most once per specified interval
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const inThrottle = useRef(false)

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args)
        inThrottle.current = true
        setTimeout(() => {
          inThrottle.current = false
        }, limit)
      }
    },
    [callback, limit]
  )
}

/**
 * Memoized array filter for large datasets
 * Useful for filtering leaderboard data, transaction history, etc.
 */
export function useFilteredData<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  deps: React.DependencyList = []
): T[] {
  return useMemo(() => data.filter(filterFn), [data, ...deps])
}

/**
 * Memoized array sort for large datasets
 * Useful for sorting leaderboard tables, round history, etc.
 */
export function useSortedData<T>(
  data: T[],
  sortFn: (a: T, b: T) => number,
  deps: React.DependencyList = []
): T[] {
  return useMemo(() => [...data].sort(sortFn), [data, ...deps])
}

/**
 * Hook for pagination of large lists
 * Returns current page data and pagination controls
 */
export function usePagination<T>(
  data: T[],
  itemsPerPage: number = 10
) {
  const [currentPage, setCurrentPage] = React.useState(1)

  const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage])

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return data.slice(start, end)
  }, [data, currentPage, itemsPerPage])

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(validPage)
    },
    [totalPages]
  )

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  return {
    currentData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  }
}

/**
 * Hook for virtual scrolling large lists
 * Only renders visible items plus buffer
 */
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  buffer: number = 5
) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleStart = useMemo(
    () => Math.max(0, Math.floor(scrollTop / itemHeight) - buffer),
    [scrollTop, itemHeight, buffer]
  )

  const visibleEnd = useMemo(
    () => Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer),
    [scrollTop, containerHeight, itemHeight, buffer, items.length]
  )

  const visibleItems = useMemo(
    () => items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  )

  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight])

  const offsetY = useMemo(() => visibleStart * itemHeight, [visibleStart, itemHeight])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  }
}

/**
 * Hook for memoizing expensive calculations
 * Returns both the value and a function to recalculate
 */
export function useMemoizedCalculation<T>(
  calculate: () => T,
  deps: React.DependencyList
): [T, () => void] {
  const [recalcTrigger, setRecalcTrigger] = React.useState(0)

  const value = useMemo(() => calculate(), [...deps, recalcTrigger])

  const recalculate = useCallback(() => {
    setRecalcTrigger((prev) => prev + 1)
  }, [])

  return [value, recalculate]
}

