import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, User, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button, Card, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Informe seu nome completo'),
    email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  function onSubmit(values: RegisterValues) {
    login({
      id: crypto.randomUUID(),
      name: values.name,
      email: values.email,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    })
    navigate('/')
  }

  return (
    <Card padding="lg">
      <h1 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-1)' }}>Crie sua conta</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-6)' }}>
        Comece a registrar os vinhos que você experimenta.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        noValidate
      >
        <Input
          label="Nome"
          placeholder="Seu nome completo"
          icon={<User size={16} />}
          error={errors.name?.message}
          {...register('name')}
        />
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
        <Input
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" isLoading={isSubmitting} leftIcon={<UserPlus size={18} />} fullWidth>
          Criar conta
        </Button>
      </form>

      <p
        style={{
          marginTop: 'var(--space-6)',
          textAlign: 'center',
          fontSize: 'var(--fs-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </Card>
  )
}
