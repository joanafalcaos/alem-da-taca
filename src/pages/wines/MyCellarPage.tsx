import { Plus, Wine } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'

export function MyCellarPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div>
          <h1>Minha Adega</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Os vinhos que você já cadastrou e avaliou.
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />}>Cadastrar vinho</Button>
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <EmptyState
          icon={<Wine size={28} />}
          title="Página em construção"
          description="A listagem, busca e filtros dos seus vinhos vão aparecer aqui."
        />
      </div>
    </div>
  )
}
