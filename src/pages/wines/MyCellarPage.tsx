import { Heart, Plus, Search, Wine as WineIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, EmptyState, Input, Modal, Spinner, Toast } from '@/components/ui'
import { ReviewForm, WineCard, WineForm } from '@/components/wine'
import { useCreateReview, useReviews, useUpdateReview } from '@/hooks/useReviews'
import { useCreateWine, useDeleteWine, useToggleFavorite, useUpdateWine, useWines } from '@/hooks/useWines'
import { useAuthStore } from '@/store/authStore'
import { WINE_TYPE_LABELS, WINE_TYPES } from '@/types'
import type { Review, ReviewFormValues, Wine, WineFormValues, WineType } from '@/types'
import { cn } from '@/utils/cn'
import styles from './MyCellarPage.module.css'

type TypeFilter = WineType | 'todos'

type ModalState =
  | { kind: 'create-wine' }
  | { kind: 'edit-wine'; wine: Wine }
  | { kind: 'review'; wine: Wine }
  | { kind: 'review-after-create'; wineValues: WineFormValues }
  | null

export function MyCellarPage() {
  const user = useAuthStore((state) => state.user)
  const { data: wines, isPending: isLoadingWines, isError: isWinesError } = useWines()
  const { data: reviews, isPending: isLoadingReviews } = useReviews()
  const toggleFavorite = useToggleFavorite()
  const deleteWine = useDeleteWine()
  const createWine = useCreateWine()
  const updateWine = useUpdateWine()
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('todos')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [modalState, setModalState] = useState<ModalState>(null)
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

  const cellarWines = useMemo(() => {
    if (!wines) return []
    return wines.filter((wine) => !wine.isCatalogWine || reviewByWineId.has(wine.id))
  }, [wines, reviewByWineId])

  const filteredWines = useMemo(() => {
    const term = search.trim().toLowerCase()

    return cellarWines
      .filter((wine) => !term || wine.name.toLowerCase().includes(term) || wine.winery.toLowerCase().includes(term))
      .filter((wine) => typeFilter === 'todos' || wine.type === typeFilter)
      .filter((wine) => !favoritesOnly || wine.isFavorite)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [cellarWines, search, typeFilter, favoritesOnly])

  const isLoading = isLoadingWines || isLoadingReviews
  const hasActiveFilters = search.trim() !== '' || typeFilter !== 'todos' || favoritesOnly

  function clearFilters() {
    setSearch('')
    setTypeFilter('todos')
    setFavoritesOnly(false)
  }

  function handleDelete(wineId: string) {
    const wine = cellarWines.find((item) => item.id === wineId)
    if (!wine) return
    if (window.confirm(`Excluir "${wine.name}" da sua adega? Essa ação não pode ser desfeita.`)) {
      deleteWine.mutate(wineId)
    }
  }

  function handleWineFormSubmit(values: WineFormValues) {
    if (modalState?.kind === 'edit-wine') {
      updateWine.mutate(
        { id: modalState.wine.id, values },
        {
          onSuccess: (updatedWine) => {
            setModalState(null)
            setToastMessage(`"${updatedWine.name}" foi atualizado com sucesso.`)
          },
        },
      )
    } else if (modalState?.kind === 'create-wine') {
      // O vinho só é persistido ao final do fluxo (avaliado ou pulado),
      // para que desistir no passo 2 não deixe um vinho "órfão" na adega.
      setModalState({ kind: 'review-after-create', wineValues: values })
    }
  }

  function handleReviewFormSubmit(values: ReviewFormValues) {
    if (!user) return

    if (modalState?.kind === 'review') {
      const { wine } = modalState
      const existingReview = reviewByWineId.get(wine.id)
      const onSuccess = () => {
        setModalState(null)
        setToastMessage(
          existingReview
            ? `Sua avaliação de "${wine.name}" foi atualizada.`
            : `Avaliação de "${wine.name}" registrada com sucesso!`,
        )
      }

      if (existingReview) {
        updateReview.mutate({ id: existingReview.id, values }, { onSuccess })
      } else {
        createReview.mutate({ wineId: wine.id, userId: user.id, values }, { onSuccess })
      }
    } else if (modalState?.kind === 'review-after-create') {
      createWine.mutate(modalState.wineValues, {
        onSuccess: (newWine) => {
          createReview.mutate(
            { wineId: newWine.id, userId: user.id, values },
            {
              onSuccess: () => {
                setModalState(null)
                setToastMessage(`"${newWine.name}" foi adicionado e avaliado com sucesso!`)
              },
            },
          )
        },
      })
    }
  }

  function handleSkipReview() {
    if (modalState?.kind !== 'review-after-create') return
    createWine.mutate(modalState.wineValues, {
      onSuccess: (newWine) => {
        setModalState(null)
        setToastMessage(`"${newWine.name}" foi adicionado à sua adega.`)
      },
    })
  }

  const modalTitle =
    modalState?.kind === 'edit-wine'
      ? 'Editar vinho'
      : modalState?.kind === 'create-wine'
        ? 'Cadastrar vinho'
        : modalState?.kind === 'review-after-create'
          ? 'Avaliar vinho'
          : modalState?.kind === 'review'
            ? reviewByWineId.has(modalState.wine.id)
              ? 'Editar avaliação'
              : 'Avaliar vinho'
            : ''

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Minha Adega</h1>
          <p className={styles.subtitle}>Os vinhos que você já cadastrou e avaliou.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setModalState({ kind: 'create-wine' })}>
          Cadastrar vinho
        </Button>
      </div>

      {!isLoading && !isWinesError && cellarWines.length > 0 && (
        <div className={styles.toolbar}>
          <Input
            icon={<Search size={16} />}
            placeholder="Buscar por nome ou vinícola"
            aria-label="Buscar vinhos"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={styles.searchField}
          />

          <div className={styles.chips}>
            <button
              type="button"
              className={cn(styles.chip, typeFilter === 'todos' && styles.chipActive)}
              onClick={() => setTypeFilter('todos')}
            >
              Todos
            </button>
            {WINE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={cn(styles.chip, typeFilter === type && styles.chipActive)}
                onClick={() => setTypeFilter(type)}
              >
                {WINE_TYPE_LABELS[type]}
              </button>
            ))}
            <button
              type="button"
              className={cn(styles.chip, styles.chipFavorite, favoritesOnly && styles.chipActive)}
              onClick={() => setFavoritesOnly((value) => !value)}
              aria-pressed={favoritesOnly}
            >
              <Heart size={14} fill={favoritesOnly ? 'currentColor' : 'none'} />
              Favoritos
            </button>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {isLoading && <Spinner centered size="lg" label="Carregando sua adega..." />}

        {!isLoading && isWinesError && (
          <EmptyState
            icon={<WineIcon size={28} />}
            title="Não foi possível carregar sua adega"
            description="Tente recarregar a página em instantes."
          />
        )}

        {!isLoading && !isWinesError && cellarWines.length === 0 && (
          <EmptyState
            icon={<WineIcon size={28} />}
            title="Sua adega ainda está vazia"
            description="Cadastre o primeiro vinho que você experimentou para começar a construir seu diário."
            action={
              <Button leftIcon={<Plus size={18} />} onClick={() => setModalState({ kind: 'create-wine' })}>
                Cadastrar vinho
              </Button>
            }
          />
        )}

        {!isLoading && !isWinesError && cellarWines.length > 0 && filteredWines.length === 0 && (
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
                onEdit={() => setModalState({ kind: 'edit-wine', wine })}
                onDelete={handleDelete}
                onReview={() => setModalState({ kind: 'review', wine })}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalState !== null} onClose={() => setModalState(null)} title={modalTitle}>
        {(modalState?.kind === 'create-wine' || modalState?.kind === 'edit-wine') && (
          <>
            {modalState.kind === 'create-wine' && (
              <Badge variant="gold" className={styles.stepBadge}>
                Passo 1 de 2 · Dados do vinho
              </Badge>
            )}
            <WineForm
              key={modalState.kind === 'edit-wine' ? modalState.wine.id : 'new'}
              defaultWine={modalState.kind === 'edit-wine' ? modalState.wine : undefined}
              onSubmit={handleWineFormSubmit}
              isSubmitting={modalState.kind === 'edit-wine' && updateWine.isPending}
              submitLabel={modalState.kind === 'edit-wine' ? 'Salvar alterações' : 'Próximo: avaliar'}
            />
          </>
        )}

        {modalState?.kind === 'review' && (
          <ReviewForm
            key={modalState.wine.id}
            wineName={modalState.wine.name}
            wineWinery={modalState.wine.winery}
            defaultReview={reviewByWineId.get(modalState.wine.id)}
            onSubmit={handleReviewFormSubmit}
            isSubmitting={createReview.isPending || updateReview.isPending}
          />
        )}

        {modalState?.kind === 'review-after-create' && (
          <>
            <Badge variant="gold" className={styles.stepBadge}>
              Passo 2 de 2 · Avaliação
            </Badge>
            <ReviewForm
              wineName={modalState.wineValues.name}
              wineWinery={modalState.wineValues.winery}
              onSubmit={handleReviewFormSubmit}
              onSkip={handleSkipReview}
              isSubmitting={createWine.isPending || createReview.isPending}
            />
          </>
        )}
      </Modal>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  )
}
