import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handle = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    const ok = isRegister
      ? await register(form.name, form.email, form.password)
      : await login(form.email, form.password)
    if (ok) navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'linear-gradient(135deg, #6750A4 0%, #9C89D4 100%)'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '32px 24px',
        width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>🛒</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1C1B1F' }}>Mi Lista de Compra</h1>
          <p style={{ color: '#49454F', fontSize: '14px', marginTop: '4px' }}>
            {isRegister ? 'Crea tu cuenta' : 'Inicia sesión para continuar'}
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRegister && (
            <input
              className="input"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handle('name')}
              required
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handle('email')}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handle('password')}
            required
            minLength={6}
          />

          {error && <p className="error-msg">⚠️ {error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '4px' }}
          >
            {loading ? '⏳ Cargando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <button
          onClick={() => setIsRegister(p => !p)}
          style={{
            background: 'none', border: 'none', color: '#6750A4',
            cursor: 'pointer', width: '100%', marginTop: '16px',
            fontSize: '14px', textAlign: 'center'
          }}
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  )
}
