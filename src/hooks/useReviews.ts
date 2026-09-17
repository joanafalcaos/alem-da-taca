import { useQuery } from '@tanstack/react-query'
import { fetchReviews } from '@/services/reviewService'

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
  })
}
