import { type TextareaHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/utils/cn'
import styles from './Textarea.module.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  optional?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, optional, id, className, ...props }, ref) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined

    return (
      <div className={cn(styles.field, error && styles.error, className)}>
        {label && (
          <label className={styles.label} htmlFor={textareaId}>
            {label} {optional && <span className={styles.optional}>(opcional)</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={styles.textarea}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...props}
        />
        {error ? (
          <span id={`${textareaId}-error`} className={styles.errorText} role="alert">
            {error}
          </span>
        ) : (
          hint && (
            <span id={`${textareaId}-hint`} className={styles.helpText}>
              {hint}
            </span>
          )
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
