export const DOCS_URL =
  (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_DOCS_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DOCS_URL) ||
  '/README.md'

export const DESIGN_URL =
  (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_DESIGN_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DESIGN_URL) ||
  '/DESIGN.md'

export const SPRINT_URL =
  (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_SPRINT_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SPRINT_URL) ||
  '/SPRINT_PLAN.md'

