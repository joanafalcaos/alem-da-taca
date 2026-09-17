import { Calendar, Grape, Heart, MapPin } from 'lucide-react'
import { WINE_TYPE_PLACEHOLDER } from '@/assets/wine-types'
import { Badge, Card, Rating } from '@/components/ui'
import type { BadgeVariant } from '@/components/ui'
import type { Wine, WineType } from '@/types'
import { WINE_TYPE_LABELS } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'
import styles from './WineCard.module.css'

const TYPE_BADGE_VARIANT: Record<WineType, BadgeVariant> = {
  tinto: 'primary',
  fortificado: 'primary',
  branco: 'gold',
  espumante: 'gold',
  doce: 'gold',
  rose: 'outline',
}

export interface WineCardProps {
  wine: Wine
  rating?: number
  onToggleFavorite?: (wineId: string) => void
  isFavoriteLoading?: boolean
}

export function WineCard({ wine, rating, onToggleFavorite, isFavoriteLoading }: WineCardProps) {
  const hasOwnPhoto = Boolean(wine.photoUrl)
  const imageSrc = wine.photoUrl ?? WINE_TYPE_PLACEHOLDER[wine.type]

  return (
    <Card hoverable padding="none" className={styles.card}>
      <div className={styles.media}>
        <img src={imageSrc} alt={hasOwnPhoto ? wine.name : ''} className={styles.photo} />

        <Badge variant={TYPE_BADGE_VARIANT[wine.type]} className={styles.typeBadge}>
          {WINE_TYPE_LABELS[wine.type]}
        </Badge>

        <button
          type="button"
          className={cn(styles.favoriteButton, wine.isFavorite && styles.favoriteActive)}
          onClick={() => onToggleFavorite?.(wine.id)}
          disabled={isFavoriteLoading}
          aria-pressed={wine.isFavorite}
          aria-label={wine.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart size={18} fill={wine.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className={styles.body}>
        <header className={styles.header}>
          <h3 className={styles.name}>{wine.name}</h3>
          <p className={styles.winery}>
            {wine.winery} · {wine.country}
          </p>
        </header>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Grape size={14} />
            {wine.grape}
          </span>
          <span className={styles.metaItem}>
            <Calendar size={14} />
            {wine.vintage}
          </span>
          <span className={styles.metaItem}>
            <MapPin size={14} />
            {wine.region}
          </span>
        </div>

        {rating !== undefined && (
          <Rating value={rating} size="sm" readOnly showValue aria-label="Sua avaliação" />
        )}

        <div className={styles.footer}>
          <span className={styles.price}>{formatCurrency(wine.price)}</span>

          {wine.tags.length > 0 && (
            <div className={styles.tags}>
              {wine.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className={styles.tag}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
