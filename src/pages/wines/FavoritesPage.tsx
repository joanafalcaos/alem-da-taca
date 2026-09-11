import { Heart } from 'lucide-react'
import { EmptyState } from '@/components/ui'

export function FavoritesPage() {
  return (
    <div>
      <h1>Favoritos</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
        Os vinhos que você marcou como favoritos.
      </p>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <EmptyState
          icon={<Heart size={28} />}
          title="Nenhum favorito ainda"
          description="Favorite vinhos na sua adega ou no catálogo para vê-los aqui."
        />
      </div>
    </div>
  )
}
