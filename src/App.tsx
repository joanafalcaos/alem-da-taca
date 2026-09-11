import { Grape, Heart, Search, Wine as WineIcon } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, EmptyState, Input, Rating, Spinner } from '@/components/ui'

function App() {
  const [rating, setRating] = useState(3.5)

  return (
    <div style={{ padding: 'var(--space-10)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: 720, margin: '0 auto' }}>
      <div>
        <h1>Além da Taça</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Showcase temporário dos componentes de UI.</p>
      </div>

      <section style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Button>Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="gold" leftIcon={<Grape size={18} />}>Dourado</Button>
        <Button variant="danger">Excluir</Button>
        <Button isLoading>Carregando</Button>
      </section>

      <section style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <Badge variant="primary">Tinto</Badge>
        <Badge variant="gold">Favorito</Badge>
        <Badge variant="success">Compraria de novo</Badge>
        <Badge variant="danger">Esgotado</Badge>
        <Badge variant="outline">Guarda</Badge>
      </section>

      <Card hoverable>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>Quinta do Vale Meão</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Douro, Portugal · Touriga Nacional</p>
          </div>
          <Heart size={20} color="var(--color-primary)" fill="var(--color-primary)" />
        </div>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Rating value={rating} onChange={setRating} showValue />
        </div>
      </Card>

      <Input label="Buscar vinho" placeholder="Nome, vinícola ou uva..." icon={<Search size={16} />} />
      <Input label="Preço" error="Informe um valor válido" />

      <Spinner centered />

      <EmptyState
        icon={<WineIcon size={28} />}
        title="Sua adega está vazia"
        description="Cadastre o primeiro vinho que você experimentou para começar sua coleção."
        action={<Button>Cadastrar vinho</Button>}
      />
    </div>
  )
}

export default App
