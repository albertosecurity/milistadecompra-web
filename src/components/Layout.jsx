import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { getPendingCount } from '../services/api'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    getPendingCount().then(r => setPendingCount(r.data.count)).catch(() => {})
    const interval = setInterval(() => {
      getPendingCount().then(r => setPendingCount(r.data.count)).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div>
      <nav className="navbar">
        <h1>🛒 Mi Lista de Compra</h1>
        <div className="navbar-actions">
          <span style={{fontSize:'0.85rem', opacity:0.85}}>Hola, {user?.name?.split(' ')[0]}</span>
          <button className="icon-btn" onClick={handleLogout} title="Cerrar sesión">⎋</button>
        </div>
      </nav>

      <div className="main-content">
        <Outlet />
      </div>

      <nav className="bottom-nav">
        <NavLink to="/" end>
          <span className="icon">📋</span>
          Listas
        </NavLink>
        <NavLink to="/productos">
          <span className="icon">🏪</span>
          Productos
        </NavLink>
        <NavLink to="/pendientes" style={{position:'relative'}}>
          <span className="icon">🚩</span>
          {pendingCount > 0 && (
            <span className="badge" style={{position:'absolute', top:4, right:12}}>{pendingCount}</span>
          )}
          Pendientes
        </NavLink>
      </nav>
    </div>
  )
}
