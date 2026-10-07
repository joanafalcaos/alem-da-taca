import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/utils/cn'
import styles from './Checkbox.module.css'

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className, ...props }, ref) => {
    const generatedId = useId()
    const checkboxId = id ?? generatedId

    return (
      <label htmlFor={checkboxId} className={cn(styles.wrapper, className)}>
        <input ref={ref} type="checkbox" id={checkboxId} className={styles.input} {...props} />
        <span className={styles.label}>{label}</span>
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
