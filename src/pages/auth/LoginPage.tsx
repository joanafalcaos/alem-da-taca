import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button, Card, Input } from '@/components/ui'
import { mockUser } from '@/mocks/user'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  function onSubmit(values: LoginValues) {
    login({ ...mockUser, email: values.email })
    navigate('/')
  }

  return (
    <Card padding="lg">
      <h1 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-1)' }}>Bem-vindo de volta</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-6)' }}>
        Entre para continuar organizando sua adega.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        noValidate
      >
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@email.com"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" isLoading={isSubmitting} leftIcon={<LogIn size={18} />} fullWidth>
          Entrar
        </Button>

        <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-subtle)', textAlign: 'center' }}>
          Login mockado: qualquer e-mail válido com senha de 6+ caracteres funciona.
        </p>
      </form>

      <p
        style={{
          marginTop: 'var(--space-6)',
          textAlign: 'center',
          fontSize: 'var(--fs-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </Card>
  )
}
