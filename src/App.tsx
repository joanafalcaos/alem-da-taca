import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { CatalogPage } from '@/pages/wines/CatalogPage'
import { FavoritesPage } from '@/pages/wines/FavoritesPage'
import { MyCellarPage } from '@/pages/wines/MyCellarPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/adega" element={<MyCellarPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
