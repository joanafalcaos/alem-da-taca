import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div>
      <h1>Olá, {user?.name?.split(' ')[0] ?? 'visitante'}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
        Aqui você vai acompanhar as estatísticas da sua adega.
      </p>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <EmptyState
          icon={<LayoutDashboard size={28} />}
          title="Dashboard em construção"
          description="Em breve: total de vinhos, nota média, uvas mais experimentadas e distribuição das avaliações."
        />
      </div>
    </div>
  )
}
