import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './Card.module.css'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({
  hoverable = false,
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(styles.card, hoverable && styles.hoverable, styles[`pad-${padding}`], className)}
      {...props}
    >
      {children}
    </div>
  )
}
