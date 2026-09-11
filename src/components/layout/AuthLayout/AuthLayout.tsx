import { Outlet } from 'react-router-dom'
import logoFull from '@/assets/brand/logo-full.png'
import styles from './AuthLayout.module.css'

export function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <img src={logoFull} alt="Além da Taça" className={styles.logo} />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}
