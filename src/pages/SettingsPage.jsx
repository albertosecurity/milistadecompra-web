import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { theme, setTheme, font, setFont, THEMES, FONTS } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="page">
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '16px 0 20px' }}>⚙️ Configuración</h2>

      {/* Usuario */}
      <div className="card mb-3" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontWeight: 700, flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{user?.name}</div>
            <div className="text-sm text-muted">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Color de interfaz */}
      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14 }}>🎨 Color de interfaz</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Object.entries(THEMES).map(([key, val]) => (
            <button key={key} onClick={() => setTheme(key)}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                border: theme === key ? '2.5px solid var(--primary)' : '1.5px solid #E0E0E0',
                background: theme === key ? 'var(--primary-light)' : 'white',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
              }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: val.primary,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: theme === key ? 'var(--primary)' : '#555' }}>
                {val.name}
              </span>
              {theme === key && <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>✓ Activo</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo de letra */}
      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14 }}>🔤 Tipo de letra</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(FONTS).map(([key, val]) => (
            <button key={key} onClick={() => setFont(key)}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: font === key ? '2px solid var(--primary)' : '1.5px solid #E0E0E0',
                background: font === key ? 'var(--primary-light)' : 'white',
                cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: val.family
              }}>
              <span style={{ fontWeight: 500 }}>{val.name}</span>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>Aa Bb Cc</span>
              {font === key && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Cerrar sesión */}
      <button className="btn btn-danger w-full" style={{ marginBottom: 24, justifyContent: 'center' }}
        onClick={handleLogout}>
        ⎋ Cerrar sesión
      </button>

      {/* Footer Yepar */}
      <div style={{
        textAlign: 'center', padding: '20px 0 40px',
        borderTop: '1px solid #E0E0E0', marginTop: 8
      }}>
        <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: 10 }}>Desarrollado por</p>
        <img
          src="/yepar-logo.png"
          alt="Yepar Solutions"
          style={{ height: 40, objectFit: 'contain', opacity: 0.85 }}
        />
        <p style={{ fontSize: '0.7rem', color: '#bbb', marginTop: 8 }}>
          © 2026 Yepar Solutions. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
