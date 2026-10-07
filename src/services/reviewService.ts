import { mockReviews } from '@/mocks/reviews'
import type { Review, ReviewFormValues } from '@/types'

// Cópia mutável em memória — simula um banco de dados até o backend existir.
let reviews: Review[] = mockReviews.map((review) => ({ ...review }))

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchReviews(): Promise<Review[]> {
  await delay(350)
  return reviews.map((review) => ({ ...review }))
}

export async function createReview(
  wineId: string,
  userId: string,
  values: ReviewFormValues,
): Promise<Review> {
  await delay(400)
  const now = new Date().toISOString()
  const review: Review = {
    ...values,
    id: crypto.randomUUID(),
    wineId,
    userId,
    createdAt: now,
    updatedAt: now,
  }

  reviews = [review, ...reviews]
  return { ...review }
}

export async function updateReview(reviewId: string, values: ReviewFormValues): Promise<Review> {
  await delay(400)
  const review = reviews.find((item) => item.id === reviewId)
  if (!review) throw new Error(`Avaliação ${reviewId} não encontrada`)

  Object.assign(review, values, { updatedAt: new Date().toISOString() })
  return { ...review }
}
