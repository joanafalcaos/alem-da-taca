import { ChevronDown } from 'lucide-react'
import { type SelectHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/utils/cn'
import styles from './Select.module.css'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  optional?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, optional, id, className, children, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId
    const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined

    return (
      <div className={cn(styles.field, error && styles.error, className)}>
        {label && (
          <label className={styles.label} htmlFor={selectId}>
            {label} {optional && <span className={styles.optional}>(opcional)</span>}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={selectId}
            className={styles.select}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...props}
          >
            {children}
          </select>
          <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
        </div>
        {error ? (
          <span id={`${selectId}-error`} className={styles.errorText} role="alert">
            {error}
          </span>
        ) : (
          hint && (
            <span id={`${selectId}-hint`} className={styles.helpText}>
              {hint}
            </span>
          )
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
