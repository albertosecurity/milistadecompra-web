import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login, register, loading, error, setError } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    let ok
    if (isRegister) ok = await register(form.name, form.email, form.password)
    else ok = await login(form.email, form.password)
    if (ok) navigate('/')
  }

  return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F6F2FA', padding:16}}>
      <div style={{width:'100%', maxWidth:380}}>
        <div style={{textAlign:'center', marginBottom:32}}>
          <img src='/icon-192.png' alt='Logo' style={{width:80,height:80,marginBottom:4}} />
          <h1 style={{fontSize:'1.6rem', fontWeight:800, color:'#167064'}}>Yepar Check</h1>
          <p style={{color:'#79747E', marginTop:6}}>Organiza tus compras fácilmente</p>
        </div>

        <div className="card" style={{padding:28}}>
          <h2 style={{marginBottom:20, fontSize:'1.1rem'}}>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:12}}>
            {isRegister && (
              <div>
                <label style={{fontSize:'0.85rem', color:'#49454F', display:'block', marginBottom:4}}>Nombre</label>
                <input className="input" name="name" value={form.name} onChange={handle} placeholder="Tu nombre" required />
              </div>
            )}
            <div>
              <label style={{fontSize:'0.85rem', color:'#49454F', display:'block', marginBottom:4}}>Email</label>
              <input className="input" name="email" type="email" value={form.email} onChange={handle} placeholder="tu@email.com" required />
            </div>
            <div>
              <label style={{fontSize:'0.85rem', color:'#49454F', display:'block', marginBottom:4}}>Contraseña</label>
              <input className="input" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary w-full" style={{marginTop:8, justifyContent:'center'}} disabled={loading}>
              {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Entrar'}
            </button>
          </form>

          <button onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={{width:'100%', marginTop:16, background:'none', border:'none', color:'#167064', cursor:'pointer', fontSize:'0.9rem'}}>
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  )
}
