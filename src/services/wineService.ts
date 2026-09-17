import { mockWines } from '@/mocks/wines'
import type { Wine, WineFormValues } from '@/types'

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

export async function createWine(values: WineFormValues): Promise<Wine> {
  await delay(400)
  const now = new Date().toISOString()
  const wine: Wine = {
    ...values,
    id: crypto.randomUUID(),
    isFavorite: false,
    isCatalogWine: false,
    createdAt: now,
    updatedAt: now,
  }

  wines = [wine, ...wines]
  return { ...wine }
}

export async function updateWine(wineId: string, values: WineFormValues): Promise<Wine> {
  await delay(400)
  const wine = wines.find((item) => item.id === wineId)
  if (!wine) throw new Error(`Vinho ${wineId} não encontrado`)
  if (wine.isCatalogWine) throw new Error('Vinhos do catálogo não podem ser editados')

  Object.assign(wine, values, { updatedAt: new Date().toISOString() })
  return { ...wine }
}

export async function deleteWine(wineId: string): Promise<void> {
  await delay(300)
  const wine = wines.find((item) => item.id === wineId)
  if (!wine) throw new Error(`Vinho ${wineId} não encontrado`)
  if (wine.isCatalogWine) throw new Error('Vinhos do catálogo não podem ser excluídos')

  wines = wines.filter((item) => item.id !== wineId)
}
