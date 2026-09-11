import { cn } from '@/utils/cn'
import styles from './Spinner.module.css'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  centered?: boolean
  label?: string
}

export function Spinner({ size = 'md', centered = false, label = 'Carregando...' }: SpinnerProps) {
  const spinner = <span className={cn(styles.spinner, styles[size])} role="status" aria-label={label} />

  if (!centered) return spinner

  return <div className={styles.wrapper}>{spinner}</div>
}
