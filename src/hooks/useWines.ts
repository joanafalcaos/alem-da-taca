import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWine,
  deleteWine,
  fetchWines,
  toggleWineFavorite,
  updateWine,
} from '@/services/wineService'
import type { Wine, WineFormValues } from '@/types'

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

export function useCreateWine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWine,
    onSuccess: (newWine) => {
      queryClient.setQueryData<Wine[]>(WINES_QUERY_KEY, (current) =>
        current ? [newWine, ...current] : [newWine],
      )
    },
  })
}

export function useUpdateWine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: WineFormValues }) => updateWine(id, values),
    onSuccess: (updatedWine) => {
      queryClient.setQueryData<Wine[]>(WINES_QUERY_KEY, (current) =>
        current?.map((wine) => (wine.id === updatedWine.id ? updatedWine : wine)),
      )
    },
  })
}

export function useDeleteWine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteWine,
    onSuccess: (_data, wineId) => {
      queryClient.setQueryData<Wine[]>(WINES_QUERY_KEY, (current) =>
        current?.filter((wine) => wine.id !== wineId),
      )
    },
  })
}
