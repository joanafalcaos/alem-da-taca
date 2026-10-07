import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReview, fetchReviews, updateReview } from '@/services/reviewService'
import type { Review, ReviewFormValues } from '@/types'

const REVIEWS_QUERY_KEY = ['reviews']

export function useReviews() {
  return useQuery({
    queryKey: REVIEWS_QUERY_KEY,
    queryFn: fetchReviews,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      wineId,
      userId,
      values,
    }: {
      wineId: string
      userId: string
      values: ReviewFormValues
    }) => createReview(wineId, userId, values),
    onSuccess: (newReview) => {
      queryClient.setQueryData<Review[]>(REVIEWS_QUERY_KEY, (current) =>
        current ? [newReview, ...current] : [newReview],
      )
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ReviewFormValues }) => updateReview(id, values),
    onSuccess: (updatedReview) => {
      queryClient.setQueryData<Review[]>(REVIEWS_QUERY_KEY, (current) =>
        current?.map((review) => (review.id === updatedReview.id ? updatedReview : review)),
      )
    },
  })
}
