import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWines, toggleWineFavorite } from '@/services/wineService'
import type { Wine } from '@/types'

const WINES_QUERY_KEY = ['wines']

export function useWines() {
  return useQuery({
    queryKey: WINES_QUERY_KEY,
    queryFn: fetchWines,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleWineFavorite,
    onSuccess: (updatedWine) => {
      queryClient.setQueryData<Wine[]>(WINES_QUERY_KEY, (current) =>
        current?.map((wine) => (wine.id === updatedWine.id ? updatedWine : wine)),
      )
    },
  })
}
