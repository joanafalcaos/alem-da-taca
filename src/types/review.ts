export interface Review {
  id: string
  wineId: string
  userId: string
  overallRating: number
  aroma: number
  palate: number
  acidity: number
  body: number
  tannins: number
  valueForMoney: number
  comment: string
  occasion: string
  foodPairing: string
  wouldBuyAgain: boolean
  createdAt: string
  updatedAt: string
}

export type ReviewFormValues = Omit<
  Review,
  'id' | 'wineId' | 'userId' | 'createdAt' | 'updatedAt'
>
