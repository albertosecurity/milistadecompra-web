import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLists, createList, deleteList, copyList } from '../services/api'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function ListsPage() {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(null)
  const [form, setForm] = useState({ name: '', month: '', year: new Date().getFullYear() })
  const navigate = useNavigate()

  const load = () => getLists().then(r => setLists(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    await createList({ name: form.name, month: form.month ? parseInt(form.month) : null, year: parseInt(form.year) })
    setShowModal(false)
    setForm({ name: '', month: '', year: new Date().getFullYear() })
    load()
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta lista?')) return
    await deleteList(id)
    load()
  }

  const handleCopy = async (sourceId, name, month, year) => {
    await copyList(sourceId, { name, month: month ? parseInt(month) : null, year: parseInt(year) })
    setShowCopyModal(null)
    load()
  }

  return (
    <div className="page">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', margin:'16px 0 12px'}}>
        <h2 style={{fontSize:'1.1rem', fontWeight:700}}>Mis Listas</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Nueva</button>
      </div>

      {loading && <div className="spinner" />}

      {!loading && lists.length === 0 && (
        <div className="empty">
          <div className="emoji">📋</div>
          <h3>No tienes listas aún</h3>
          <p>Toca "+ Nueva" para crear tu primera lista</p>
        </div>
      )}

      {lists.map(list => (
        <div key={list.id} className="card" style={{marginBottom:10, cursor:'pointer'}}
          onClick={() => navigate('/lista/' + list.id)}>
          <div className="flex justify-between items-center">
            <div>
              <div style={{fontWeight:700, fontSize:'1rem'}}>{list.name}</div>
              {list.month && <div style={{fontSize:'0.8rem', color:'#6750A4', marginTop:2}}>
                {MONTHS[list.month-1]} {list.year}
              </div>}
              <div className="text-sm text-muted mt-2">{list.item_count} productos · {list.pending_count > 0 ? <span className="text-error">{list.pending_count} pendientes</span> : 'sin pendientes'}</div>
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCopyModal(list)}>Copiar</button>
              <button className="btn btn-danger btn-sm" onClick={e => handleDelete(e, list.id)}>🗑</button>
            </div>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nueva Lista</h2>
            <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:12}}>
              <input className="input" placeholder="Nombre de la lista" value={form.name}
                onChange={e => setForm(f=>({...f,name:e.target.value}))} required />
              <div className="flex gap-2">
                <select className="input" value={form.month} onChange={e => setForm(f=>({...f,month:e.target.value}))}>
                  <option value="">Mes (opcional)</option>
                  {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
                <input className="input" type="number" placeholder="Año" value={form.year}
                  onChange={e => setForm(f=>({...f,year:e.target.value}))} style={{width:90}} />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" className="btn btn-ghost w-full" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary w-full">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCopyModal && (
        <CopyModal list={showCopyModal} onCopy={handleCopy} onClose={() => setShowCopyModal(null)} />
      )}
    </div>
  )
}

function CopyModal({ list, onCopy, onClose }) {
  const [form, setForm] = useState({ name: list.name + ' (copia)', month: '', year: new Date().getFullYear() })
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Copiar Lista</h2>
        <p className="text-sm text-muted mb-3">Copia "{list.name}" con todos sus productos</p>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <input className="input" placeholder="Nombre" value={form.name}
            onChange={e => setForm(f=>({...f,name:e.target.value}))} />
          <div className="flex gap-2">
            <select className="input" value={form.month} onChange={e => setForm(f=>({...f,month:e.target.value}))}>
              <option value="">Mes (opcional)</option>
              {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <input className="input" type="number" value={form.year}
              onChange={e => setForm(f=>({...f,year:e.target.value}))} style={{width:90}} />
          </div>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-ghost w-full" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary w-full" onClick={() => onCopy(list.id, form.name, form.month, form.year)}>Copiar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
