import { mockWines } from '@/mocks/wines'
import type { Wine } from '@/types'

// Cópia mutável em memória — simula um banco de dados até o backend existir.
// Trocar as funções abaixo por chamadas fetch/axios não deve afetar quem as consome.
let wines: Wine[] = mockWines.map((wine) => ({ ...wine }))

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchWines(): Promise<Wine[]> {
  await delay(350)
  return wines.map((wine) => ({ ...wine }))
}

export async function toggleWineFavorite(wineId: string): Promise<Wine> {
  await delay(150)
  const wine = wines.find((item) => item.id === wineId)
  if (!wine) throw new Error(`Vinho ${wineId} não encontrado`)

  wine.isFavorite = !wine.isFavorite
  wine.updatedAt = new Date().toISOString()
  return { ...wine }
}
