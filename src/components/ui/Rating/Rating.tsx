import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import styles from './Rating.module.css'

const STAR_SIZES = { sm: 14, md: 18, lg: 24 } as const

export interface RatingProps {
  value: number
  max?: number
  size?: keyof typeof STAR_SIZES
  readOnly?: boolean
  allowHalf?: boolean
  showValue?: boolean
  onChange?: (value: number) => void
  'aria-label'?: string
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  readOnly = false,
  allowHalf = true,
  showValue = false,
  onChange,
  'aria-label': ariaLabel = 'Avaliação',
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = hoverValue ?? value
  const pixelSize = STAR_SIZES[size]

  function resolveValueFromClick(
    event: React.MouseEvent<HTMLButtonElement>,
    starIndex: number,
  ) {
    if (!allowHalf) return starIndex + 1
    const { left, width } = event.currentTarget.getBoundingClientRect()
    const isLeftHalf = event.clientX - left < width / 2
    return isLeftHalf ? starIndex + 0.5 : starIndex + 1
  }

  return (
    <div className={styles.rating} role={readOnly ? 'img' : 'radiogroup'} aria-label={ariaLabel}>
      {Array.from({ length: max }, (_, index) => {
        const fillPercent = Math.max(0, Math.min(1, displayValue - index)) * 100

        return (
          <button
            key={index}
            type="button"
            className={cn(styles.starButton, !readOnly && styles.interactive)}
            disabled={readOnly}
            tabIndex={readOnly ? -1 : 0}
            aria-hidden={readOnly}
            onMouseMove={(event) => {
              if (readOnly) return
              setHoverValue(resolveValueFromClick(event, index))
            }}
            onMouseLeave={() => setHoverValue(null)}
            onClick={(event) => {
              if (readOnly || !onChange) return
              onChange(resolveValueFromClick(event, index))
            }}
          >
            <Star size={pixelSize} className={styles.starBase} fill="currentColor" />
            <span className={styles.starFill} style={{ width: `${fillPercent}%` }}>
              <Star size={pixelSize} fill="currentColor" />
            </span>
          </button>
        )
      })}
      {showValue && <span className={styles.valueText}>{value.toFixed(1)}</span>}
    </div>
  )
}
