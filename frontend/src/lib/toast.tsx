import React from 'react'
import { toast } from 'sonner'
import { ToastPreview } from '../components/ui/Toast'

function show(
  variant: 'info' | 'success' | 'warning' | 'danger',
  title: string,
  description?: string,
  timeAgo?: string,
) {
  return toast.custom((t) => (
    <ToastPreview
      variant={variant}
      title={title}
      description={description}
      timeAgo={timeAgo}
      onDismiss={() => toast.dismiss(t)}
    />
  ))
}

export const toastInfo = (title: string, description?: string, timeAgo?: string) =>
  show('info', title, description, timeAgo)
export const toastSuccess = (title: string, description?: string, timeAgo?: string) =>
  show('success', title, description, timeAgo)
export const toastWarning = (title: string, description?: string, timeAgo?: string) =>
  show('warning', title, description, timeAgo)
export const toastDanger = (title: string, description?: string, timeAgo?: string) =>
  show('danger', title, description, timeAgo)

