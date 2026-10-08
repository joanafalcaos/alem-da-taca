import { Heart, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button, EmptyState, Input, Modal, Spinner, Toast } from '@/components/ui'
import { ReviewForm, WineCard } from '@/components/wine'
import { useCreateReview, useReviews, useUpdateReview } from '@/hooks/useReviews'
import { useToggleFavorite, useWines } from '@/hooks/useWines'
import { useAuthStore } from '@/store/authStore'
import { WINE_TYPE_LABELS, WINE_TYPES } from '@/types'
import type { Review, ReviewFormValues, Wine, WineType } from '@/types'
import chipStyles from '@/styles/filterChips.module.css'
import { cn } from '@/utils/cn'
import styles from './FavoritesPage.module.css'

type TypeFilter = WineType | 'todos'

export function FavoritesPage() {
  const user = useAuthStore((state) => state.user)
  const { data: wines, isPending: isLoadingWines, isError: isWinesError } = useWines()
  const { data: reviews, isPending: isLoadingReviews } = useReviews()
  const toggleFavorite = useToggleFavorite()
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('todos')
  const [reviewTarget, setReviewTarget] = useState<Wine | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3500)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const reviewByWineId = useMemo(() => {
    const map = new Map<string, Review>()
    reviews?.filter((review) => review.userId === user?.id).forEach((review) => map.set(review.wineId, review))
    return map
  }, [reviews, user?.id])

  const favoriteWines = useMemo(() => wines?.filter((wine) => wine.isFavorite) ?? [], [wines])

  const filteredWines = useMemo(() => {
    const term = search.trim().toLowerCase()

    return favoriteWines
      .filter((wine) => !term || wine.name.toLowerCase().includes(term) || wine.winery.toLowerCase().includes(term))
      .filter((wine) => typeFilter === 'todos' || wine.type === typeFilter)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [favoriteWines, search, typeFilter])

  const isLoading = isLoadingWines || isLoadingReviews
  const hasActiveFilters = search.trim() !== '' || typeFilter !== 'todos'

  function clearFilters() {
    setSearch('')
    setTypeFilter('todos')
  }

  function handleReviewSubmit(values: ReviewFormValues, isFavorite: boolean) {
    if (!reviewTarget || !user) return
    const existingReview = reviewByWineId.get(reviewTarget.id)
    const wineName = reviewTarget.name
    const onSuccess = () => {
      if (isFavorite !== reviewTarget.isFavorite) toggleFavorite.mutate(reviewTarget.id)
      setReviewTarget(null)
      setToastMessage(
        existingReview
          ? `Sua avaliação de "${wineName}" foi atualizada.`
          : `Avaliação de "${wineName}" registrada com sucesso!`,
      )
    }

    if (existingReview) {
      updateReview.mutate({ id: existingReview.id, values }, { onSuccess })
    } else {
      createReview.mutate({ wineId: reviewTarget.id, userId: user.id, values }, { onSuccess })
    }
  }

  return (
    <div>
      <div>
        <h1>Favoritos</h1>
        <p className={styles.subtitle}>Os vinhos que você marcou como favoritos.</p>
      </div>

      {!isLoading && !isWinesError && favoriteWines.length > 0 && (
        <div className={styles.toolbar}>
          <Input
            icon={<Search size={16} />}
            placeholder="Buscar por nome ou vinícola"
            aria-label="Buscar favoritos"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={styles.searchField}
          />

          <div className={styles.chips}>
            <button
              type="button"
              className={cn(chipStyles.chip, typeFilter === 'todos' && chipStyles.chipActive)}
              onClick={() => setTypeFilter('todos')}
            >
              Todos
            </button>
            {WINE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={cn(chipStyles.chip, typeFilter === type && chipStyles.chipActive)}
                onClick={() => setTypeFilter(type)}
              >
                {WINE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.content}>
        {isLoading && <Spinner centered size="lg" label="Carregando favoritos..." />}

        {!isLoading && isWinesError && (
          <EmptyState
            icon={<Heart size={28} />}
            title="Não foi possível carregar seus favoritos"
            description="Tente recarregar a página em instantes."
          />
        )}

        {!isLoading && !isWinesError && favoriteWines.length === 0 && (
          <EmptyState
            icon={<Heart size={28} />}
            title="Nenhum favorito ainda"
            description="Favorite vinhos na sua adega ou no catálogo para vê-los aqui."
          />
        )}

        {!isLoading && !isWinesError && favoriteWines.length > 0 && filteredWines.length === 0 && (
          <EmptyState
            icon={<Search size={28} />}
            title="Nenhum vinho encontrado"
            description="Ajuste a busca ou os filtros para ver mais resultados."
            action={
              hasActiveFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        )}

        {!isLoading && !isWinesError && filteredWines.length > 0 && (
          <div className={styles.grid}>
            {filteredWines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                rating={reviewByWineId.get(wine.id)?.overallRating}
                onToggleFavorite={(id) => toggleFavorite.mutate(id)}
                isFavoriteLoading={toggleFavorite.isPending && toggleFavorite.variables === wine.id}
                onReview={() => setReviewTarget(wine)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={reviewTarget !== null}
        onClose={() => setReviewTarget(null)}
        title={reviewTarget && reviewByWineId.has(reviewTarget.id) ? 'Editar avaliação' : 'Avaliar vinho'}
      >
        {reviewTarget && (
          <ReviewForm
            key={reviewTarget.id}
            wineName={reviewTarget.name}
            wineWinery={reviewTarget.winery}
            isFavorite={reviewTarget.isFavorite}
            defaultReview={reviewByWineId.get(reviewTarget.id)}
            onSubmit={handleReviewSubmit}
            isSubmitting={createReview.isPending || updateReview.isPending}
          />
        )}
      </Modal>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  )
}
