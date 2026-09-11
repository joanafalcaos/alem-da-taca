export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterValues extends AuthCredentials {
  name: string
  confirmPassword: string
}
