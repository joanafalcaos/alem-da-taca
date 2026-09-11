import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/ui'

export function CatalogPage() {
  return (
    <div>
      <h1>Catálogo</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
        Explore vinhos do catálogo da Além da Taça, além dos que você já cadastrou.
      </p>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <EmptyState
          icon={<Compass size={28} />}
          title="Página em construção"
          description="A busca e os filtros combináveis do catálogo vão aparecer aqui."
        />
      </div>
    </div>
  )
}
