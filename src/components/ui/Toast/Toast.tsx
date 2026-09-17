import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import styles from './Toast.module.css'

export type ToastVariant = 'success' | 'error'

export interface ToastProps {
  message: string
  variant?: ToastVariant
  onClose?: () => void
}

export function Toast({ message, variant = 'success', onClose }: ToastProps) {
  const Icon = variant === 'success' ? CheckCircle2 : AlertCircle

  return (
    <div className={cn(styles.toast, styles[variant])} role="status">
      <Icon size={18} />
      <span>{message}</span>
      {onClose && (
        <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar aviso">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
