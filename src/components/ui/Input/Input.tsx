import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react'
import { cn } from '@/utils/cn'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  optional?: boolean
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, optional, icon, id, className, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

    return (
      <div className={cn(styles.field, error && styles.error, className)}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label} {optional && <span className={styles.optional}>(opcional)</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(styles.input, icon && styles.hasIcon)}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...props}
          />
        </div>
        {error ? (
          <span id={`${inputId}-error`} className={styles.errorText} role="alert">
            {error}
          </span>
        ) : (
          hint && (
            <span id={`${inputId}-hint`} className={styles.helpText}>
              {hint}
            </span>
          )
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
