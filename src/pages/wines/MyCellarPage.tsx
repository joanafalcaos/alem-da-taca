import { Heart, Plus, Search, Wine as WineIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button, EmptyState, Input, Modal, Spinner, Toast } from '@/components/ui'
import { WineCard, WineForm } from '@/components/wine'
import { useReviews } from '@/hooks/useReviews'
import { useCreateWine, useDeleteWine, useToggleFavorite, useUpdateWine, useWines } from '@/hooks/useWines'
import { useAuthStore } from '@/store/authStore'
import { WINE_TYPE_LABELS, WINE_TYPES } from '@/types'
import type { Wine, WineFormValues, WineType } from '@/types'
import { cn } from '@/utils/cn'
import styles from './MyCellarPage.module.css'

type TypeFilter = WineType | 'todos'

export function MyCellarPage() {
  const user = useAuthStore((state) => state.user)
  const { data: wines, isPending: isLoadingWines, isError: isWinesError } = useWines()
  const { data: reviews, isPending: isLoadingReviews } = useReviews()
  const toggleFavorite = useToggleFavorite()
  const deleteWine = useDeleteWine()
  const createWine = useCreateWine()
  const updateWine = useUpdateWine()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('todos')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [formTarget, setFormTarget] = useState<'new' | Wine | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3500)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const ratingByWineId = useMemo(() => {
    const map = new Map<string, number>()
    reviews
      ?.filter((review) => review.userId === user?.id)
      .forEach((review) => map.set(review.wineId, review.overallRating))
    return map
  }, [reviews, user?.id])

  const cellarWines = useMemo(() => {
    if (!wines) return []
    return wines.filter((wine) => !wine.isCatalogWine || ratingByWineId.has(wine.id))
  }, [wines, ratingByWineId])

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

  function handleFormSubmit(values: WineFormValues) {
    if (formTarget && formTarget !== 'new') {
      updateWine.mutate(
        { id: formTarget.id, values },
        {
          onSuccess: (updatedWine) => {
            setFormTarget(null)
            setToastMessage(`"${updatedWine.name}" foi atualizado com sucesso.`)
          },
        },
      )
    } else {
      createWine.mutate(values, {
        onSuccess: (newWine) => {
          setFormTarget(null)
          setToastMessage(`"${newWine.name}" foi adicionado à sua adega!`)
        },
      })
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Minha Adega</h1>
          <p className={styles.subtitle}>Os vinhos que você já cadastrou e avaliou.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setFormTarget('new')}>
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
              <Button leftIcon={<Plus size={18} />} onClick={() => setFormTarget('new')}>
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
                rating={ratingByWineId.get(wine.id)}
                onToggleFavorite={(id) => toggleFavorite.mutate(id)}
                isFavoriteLoading={toggleFavorite.isPending && toggleFavorite.variables === wine.id}
                onEdit={() => setFormTarget(wine)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={formTarget !== null}
        onClose={() => setFormTarget(null)}
        title={formTarget && formTarget !== 'new' ? 'Editar vinho' : 'Cadastrar vinho'}
      >
        <WineForm
          key={formTarget === 'new' || formTarget === null ? 'new' : formTarget.id}
          defaultWine={formTarget && formTarget !== 'new' ? formTarget : undefined}
          onSubmit={handleFormSubmit}
          isSubmitting={createWine.isPending || updateWine.isPending}
          submitLabel={formTarget && formTarget !== 'new' ? 'Salvar alterações' : 'Cadastrar vinho'}
        />
      </Modal>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  )
}
