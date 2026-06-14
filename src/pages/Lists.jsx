import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listService } from '../services/api'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function Lists() {
  const navigate = useNavigate()
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(null)
  const [form, setForm] = useState({ name: '', month: '', year: new Date().getFullYear(), notes: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    listService.getAll()
      .then(r => setLists(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await listService.create({
        name: form.name,
        month: form.month ? parseInt(form.month) : null,
        year: form.year ? parseInt(form.year) : null,
        notes: form.notes || null
      })
      setShowModal(false)
      setForm({ name: '', month: '', year: new Date().getFullYear(), notes: '' })
      navigate(`/lista/${res.data.id}`)
    } finally {
      setSaving(false)
    }
  }

  const copyList = async (sourceId) => {
    setSaving(true)
    try {
      const now = new Date()
      const res = await listService.copy(sourceId, {
        name: `Lista ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      })
      setShowCopyModal(null)
      navigate(`/lista/${res.data.id}`)
    } finally {
      setSaving(false)
    }
  }

  const deleteList = async (id, e) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta lista?')) return
    await listService.delete(id)
    load()
  }

  if (loading) return <div className="spinner">🔄</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Mis Listas</h1>
        <span style={{ color: '#49454F', fontSize: '14px' }}>{lists.length} lista{lists.length !== 1 ? 's' : ''}</span>
      </div>

      {lists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p style={{ fontWeight: '600', fontSize: '16px' }}>No tienes listas aún</p>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Toca + para crear tu primera lista</p>
        </div>
      ) : (
        lists.map(list => (
          <div
            key={list.id}
            className="card"
            onClick={() => navigate(`/lista/${list.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>{list.name}</div>
                {list.month && (
                  <div style={{ color: '#6750A4', fontSize: '13px', marginTop: '2px' }}>
                    📅 {MONTHS[list.month - 1]} {list.year}
                  </div>
                )}
                <div style={{ color: '#49454F', fontSize: '13px', marginTop: '4px' }}>
                  {list.item_count} producto{list.item_count !== 1 ? 's' : ''}
                  {list.pending_count > 0 && (
                    <span style={{ color: '#B3261E', marginLeft: '8px' }}>
                      🚩 {list.pending_count} pendiente{list.pending_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                <button
                  className="btn-icon"
                  title="Copiar lista"
                  onClick={() => setShowCopyModal(list)}
                >📋</button>
                <button
                  className="btn-icon"
                  title="Eliminar"
                  onClick={e => deleteList(list.id, e)}
                >🗑️</button>
              </div>
            </div>
          </div>
        ))
      )}

      <button className="fab" onClick={() => setShowModal(true)}>+</button>

      {/* Modal nueva lista */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Nueva lista</span>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input className="input" placeholder="Nombre de la lista" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              <div style={{ display: 'flex', gap: '10px' }}>
                <select className="input" value={form.month}
                  onChange={e => setForm(p => ({ ...p, month: e.target.value }))}>
                  <option value="">Mes (opcional)</option>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <input className="input" type="number" placeholder="Año" value={form.year}
                  onChange={e => setForm(p => ({ ...p, year: e.target.value }))} style={{ width: '100px' }} />
              </div>
              <textarea className="input" placeholder="Notas (opcional)" value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2} style={{ resize: 'none' }} />
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear lista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal copiar lista */}
      {showCopyModal && (
        <div className="modal-overlay" onClick={() => setShowCopyModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Copiar lista</span>
              <button className="btn-icon" onClick={() => setShowCopyModal(null)}>✕</button>
            </div>
            <p style={{ color: '#49454F', marginBottom: '20px' }}>
              Se creará una copia de <strong>"{showCopyModal.name}"</strong> con todos sus productos para el mes actual.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowCopyModal(null)}>Cancelar</button>
              <button className="btn btn-primary" disabled={saving}
                onClick={() => copyList(showCopyModal.id)}>
                {saving ? 'Copiando...' : '📋 Copiar lista'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
