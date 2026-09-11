import { Compass, Heart, LayoutDashboard, LogOut, Menu, User, Wine, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logoFull from '@/assets/brand/logo-full.png'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/adega', label: 'Minha Adega', icon: Wine, end: false },
  { to: '/catalogo', label: 'Catálogo', icon: Compass, end: false },
  { to: '/favoritos', label: 'Favoritos', icon: Heart, end: false },
]

export function Header() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? '?'

  return (
    <header className={styles.header}>
      <div className={cn('container', styles.inner)}>
        <NavLink to="/" className={styles.logoLink} aria-label="Além da Taça — início">
          <img src={logoFull} alt="" className={styles.logoFull} />
        </NavLink>

        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.userMenu} ref={userMenuRef}>
            <button
              type="button"
              className={styles.userTrigger}
              onClick={() => setIsUserMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
            >
              <span className={styles.avatar}>{initial}</span>
              <span className={styles.userName}>{user?.name ?? 'Visitante'}</span>
            </button>

            {isUserMenuOpen && (
              <div className={styles.dropdown} role="menu">
                <NavLink
                  to="/perfil"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User size={16} />
                  Meu perfil
                </NavLink>
                <button
                  type="button"
                  className={cn(styles.dropdownItem, styles.dropdownItemDanger)}
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className={cn(styles.userTrigger, styles.mobileToggle)}
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-label={isMobileNavOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <nav className={styles.mobileNav} aria-label="Navegação principal (mobile)">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(styles.mobileNavLink, isActive && styles.mobileNavLinkActive)
              }
              onClick={() => setIsMobileNavOpen(false)}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
