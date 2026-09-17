import { mockReviews } from '@/mocks/reviews'
import type { Review } from '@/types'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchReviews(): Promise<Review[]> {
  await delay(350)
  return mockReviews.map((review) => ({ ...review }))
}
