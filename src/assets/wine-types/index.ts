import branco from './branco.jpg'
import doce from './doce.jpg'
import espumante from './espumante.jpg'
import fortificado from './fortificado.jpg'
import rose from './rose.jpg'
import tinto from './tinto.jpg'
import type { WineType } from '@/types'

export const WINE_TYPE_PLACEHOLDER: Record<WineType, string> = {
  tinto,
  branco,
  rose,
  espumante,
  fortificado,
  doce,
}
