import { Compass, Heart, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, Input, Modal, Rating, Select, Spinner, Toast } from '@/components/ui'
import { ReviewForm, WineCard } from '@/components/wine'
import { useCreateReview, useReviews, useUpdateReview } from '@/hooks/useReviews'
import { useToggleFavorite, useWines } from '@/hooks/useWines'
import { useAuthStore } from '@/store/authStore'
import { WINE_TYPE_LABELS, WINE_TYPES } from '@/types'
import type { Review, ReviewFormValues, Wine, WineType } from '@/types'
import chipStyles from '@/styles/filterChips.module.css'
import { cn } from '@/utils/cn'
import styles from './CatalogPage.module.css'

type TypeFilter = WineType | 'todos'
const ALL_VALUE = 'todos'
const ALL_GRAPES = 'todas'
const ALL_VINTAGES = 'todas'

export function CatalogPage() {
  const user = useAuthStore((state) => state.user)
  const { data: wines, isPending: isLoadingWines, isError: isWinesError } = useWines()
  const { data: reviews, isPending: isLoadingReviews } = useReviews()
  const toggleFavorite = useToggleFavorite()
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL_VALUE)
  const [grapeFilter, setGrapeFilter] = useState(ALL_GRAPES)
  const [countryFilter, setCountryFilter] = useState(ALL_VALUE)
  const [vintageFilter, setVintageFilter] = useState(ALL_VINTAGES)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
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

  const catalogWines = useMemo(() => wines?.filter((wine) => wine.isCatalogWine) ?? [], [wines])

  const { grapes, countries, vintages, tags } = useMemo(() => {
    const grapeSet = new Set<string>()
    const countrySet = new Set<string>()
    const vintageSet = new Set<number>()
    const tagSet = new Set<string>()

    catalogWines.forEach((wine) => {
      grapeSet.add(wine.grape)
      countrySet.add(wine.country)
      vintageSet.add(wine.vintage)
      wine.tags.forEach((tag) => tagSet.add(tag))
    })

    return {
      grapes: Array.from(grapeSet).sort(),
      countries: Array.from(countrySet).sort(),
      vintages: Array.from(vintageSet).sort((a, b) => b - a),
      tags: Array.from(tagSet).sort(),
    }
  }, [catalogWines])

  const filteredWines = useMemo(() => {
    const term = search.trim().toLowerCase()
    const min = minPrice ? Number(minPrice) : null
    const max = maxPrice ? Number(maxPrice) : null

    return catalogWines
      .filter(
        (wine) =>
          !term ||
          wine.name.toLowerCase().includes(term) ||
          wine.winery.toLowerCase().includes(term) ||
          wine.grape.toLowerCase().includes(term),
      )
      .filter((wine) => typeFilter === ALL_VALUE || wine.type === typeFilter)
      .filter((wine) => grapeFilter === ALL_GRAPES || wine.grape === grapeFilter)
      .filter((wine) => countryFilter === ALL_VALUE || wine.country === countryFilter)
      .filter((wine) => vintageFilter === ALL_VINTAGES || wine.vintage === Number(vintageFilter))
      .filter((wine) => min === null || wine.price >= min)
      .filter((wine) => max === null || wine.price <= max)
      .filter((wine) => minRating === 0 || (reviewByWineId.get(wine.id)?.overallRating ?? 0) >= minRating)
      .filter((wine) => !favoritesOnly || wine.isFavorite)
      .filter((wine) => selectedTags.size === 0 || Array.from(selectedTags).every((tag) => wine.tags.includes(tag)))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [
    catalogWines,
    search,
    typeFilter,
    grapeFilter,
    countryFilter,
    vintageFilter,
    minPrice,
    maxPrice,
    minRating,
    favoritesOnly,
    selectedTags,
    reviewByWineId,
  ])

  const isLoading = isLoadingWines || isLoadingReviews

  const activeFilterCount = [
    typeFilter !== ALL_VALUE,
    grapeFilter !== ALL_GRAPES,
    countryFilter !== ALL_VALUE,
    vintageFilter !== ALL_VINTAGES,
    minPrice !== '',
    maxPrice !== '',
    minRating > 0,
    favoritesOnly,
    selectedTags.size > 0,
  ].filter(Boolean).length

  const hasActiveFilters = search.trim() !== '' || activeFilterCount > 0

  function clearFilters() {
    setSearch('')
    setTypeFilter(ALL_VALUE)
    setGrapeFilter(ALL_GRAPES)
    setCountryFilter(ALL_VALUE)
    setVintageFilter(ALL_VINTAGES)
    setMinPrice('')
    setMaxPrice('')
    setMinRating(0)
    setFavoritesOnly(false)
    setSelectedTags(new Set())
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      const next = new Set(current)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
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
      <div className={styles.pageHeader}>
        <div>
          <h1>Catálogo</h1>
          <p className={styles.subtitle}>Explore os vinhos da Além da Taça, além dos que você já cadastrou.</p>
        </div>
      </div>

      {!isLoading && !isWinesError && catalogWines.length > 0 && (
        <div className={styles.toolbar}>
          <div className={styles.searchRow}>
            <Input
              icon={<Search size={16} />}
              placeholder="Buscar por nome, vinícola ou uva"
              aria-label="Buscar no catálogo"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={styles.searchField}
            />
            <Button
              variant="secondary"
              leftIcon={<SlidersHorizontal size={16} />}
              onClick={() => setIsFiltersOpen((value) => !value)}
            >
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="gold" className={styles.filterCount}>
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          <div className={styles.chips}>
            <button
              type="button"
              className={cn(chipStyles.chip, typeFilter === ALL_VALUE && chipStyles.chipActive)}
              onClick={() => setTypeFilter(ALL_VALUE)}
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
            <button
              type="button"
              className={cn(chipStyles.chip, chipStyles.chipFavorite, favoritesOnly && chipStyles.chipActive)}
              onClick={() => setFavoritesOnly((value) => !value)}
              aria-pressed={favoritesOnly}
            >
              <Heart size={14} fill={favoritesOnly ? 'currentColor' : 'none'} />
              Favoritos
            </button>
          </div>

          {isFiltersOpen && (
            <Card padding="md" className={styles.filterPanel}>
              <div className={styles.filterGrid}>
                <Select label="Uva" value={grapeFilter} onChange={(event) => setGrapeFilter(event.target.value)}>
                  <option value={ALL_GRAPES}>Todas as uvas</option>
                  {grapes.map((grape) => (
                    <option key={grape} value={grape}>
                      {grape}
                    </option>
                  ))}
                </Select>

                <Select
                  label="País"
                  value={countryFilter}
                  onChange={(event) => setCountryFilter(event.target.value)}
                >
                  <option value={ALL_VALUE}>Todos os países</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Safra"
                  value={vintageFilter}
                  onChange={(event) => setVintageFilter(event.target.value)}
                >
                  <option value={ALL_VINTAGES}>Todas as safras</option>
                  {vintages.map((vintage) => (
                    <option key={vintage} value={vintage}>
                      {vintage}
                    </option>
                  ))}
                </Select>

                <div className={styles.priceRange}>
                  <Input
                    label="Preço mínimo"
                    type="number"
                    min={0}
                    placeholder="R$ 0"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                  />
                  <Input
                    label="Preço máximo"
                    type="number"
                    min={0}
                    placeholder="R$ 999"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                  />
                </div>

                <div className={styles.ratingFilter}>
                  <span className={styles.filterLabel}>Nota mínima</span>
                  <Rating
                    value={minRating}
                    allowHalf={false}
                    onChange={setMinRating}
                    showValue
                    aria-label="Nota mínima"
                  />
                </div>
              </div>

              {tags.length > 0 && (
                <div className={styles.tagFilter}>
                  <span className={styles.filterLabel}>Tags</span>
                  <div className={styles.chips}>
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={cn(chipStyles.chip, selectedTags.has(tag) && chipStyles.chipActive)}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className={styles.clearButton}>
                  Limpar filtros
                </Button>
              )}
            </Card>
          )}
        </div>
      )}

      <div className={styles.content}>
        {isLoading && <Spinner centered size="lg" label="Carregando catálogo..." />}

        {!isLoading && isWinesError && (
          <EmptyState
            icon={<Compass size={28} />}
            title="Não foi possível carregar o catálogo"
            description="Tente recarregar a página em instantes."
          />
        )}

        {!isLoading && !isWinesError && filteredWines.length === 0 && (
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
