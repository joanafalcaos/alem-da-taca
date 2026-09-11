export const WINE_TYPES = [
  'tinto',
  'branco',
  'rose',
  'espumante',
  'fortificado',
  'doce',
] as const

export type WineType = (typeof WINE_TYPES)[number]

export const WINE_TYPE_LABELS: Record<WineType, string> = {
  tinto: 'Tinto',
  branco: 'Branco',
  rose: 'Rosé',
  espumante: 'Espumante',
  fortificado: 'Fortificado',
  doce: 'Doce',
}

export interface Wine {
  id: string
  name: string
  winery: string
  country: string
  region: string
  grape: string
  type: WineType
  vintage: number
  price: number
  photoUrl: string | null
  tags: string[]
  alcoholContent?: number
  notes?: string
  isFavorite: boolean
  /** true = do catálogo público da aplicação, false = cadastrado pelo usuário */
  isCatalogWine: boolean
  createdAt: string
  updatedAt: string
}

export type WineFormValues = Omit<
  Wine,
  'id' | 'isFavorite' | 'isCatalogWine' | 'createdAt' | 'updatedAt'
>
