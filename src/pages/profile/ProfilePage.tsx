import { Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/ui'

export function ProfilePage() {
  return (
    <div>
      <h1>Perfil de Paladar</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
        Uma análise das suas avaliações para entender o que você mais aprecia.
      </p>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <EmptyState
          icon={<Sparkles size={28} />}
          title="Página em construção"
          description="Uvas, tipos e características favoritas vão aparecer aqui, com base nas suas avaliações."
        />
      </div>
    </div>
  )
}
