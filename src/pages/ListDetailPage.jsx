import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getListDetail, getProducts, addItem, updateItem, removeItem } from '../services/api'

export default function ListDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [list, setList] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState('1')
  const [unit, setUnit] = useState('unidad')
  const [showPendingFor, setShowPendingFor] = useState(null)
  const [pendingNote, setPendingNote] = useState('')

  const load = () => getListDetail(id).then(r => setList(r.data)).finally(() => setLoading(false))

  useEffect(() => { load() }, [id])
  useEffect(() => {
    if (showAdd) getProducts(search).then(r => setProducts(r.data))
  }, [showAdd, search])

  const handleAdd = async () => {
    if (!selected) return
    await addItem(id, { product_id: selected.id, quantity: parseFloat(qty)||1, unit })
    setShowAdd(false); setSelected(null); setSearch(''); setQty('1'); setUnit('unidad')
    load()
  }

  const handleCheck = async (item) => {
    if (item.is_pending) return
    await updateItem(id, item.id, { is_checked: !item.is_checked })
    load()
  }

  const handlePending = async () => {
    await updateItem(id, showPendingFor.id, { is_pending: true, pending_notes: pendingNote || null })
    setShowPendingFor(null); setPendingNote('')
    load()
  }

  const handleUnpending = async (item) => {
    await updateItem(id, item.id, { is_pending: false })
    load()
  }

  const handleRemove = async (itemId) => {
    if (!confirm('¿Quitar este producto?')) return
    await removeItem(id, itemId)
    load()
  }

  if (loading) return <div className="spinner" />

  const grouped = {}
  list?.items?.forEach(item => {
    const cat = item.product_category
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  })

  const total = list?.items?.length || 0
  const checked = list?.items?.filter(i => i.is_checked).length || 0
  const pending = list?.items?.filter(i => i.is_pending).length || 0
  const progress = total > 0 ? (checked / total) * 100 : 0

  return (
    <div className="page">
      <div style={{display:'flex', alignItems:'center', gap:10, margin:'16px 0 8px'}}>
        <button onClick={() => navigate(-1)} style={{background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer'}}>←</button>
        <div style={{flex:1}}>
          <h2 style={{fontSize:'1.05rem', fontWeight:700}}>{list?.name}</h2>
          <div className="text-sm text-muted">{checked}/{total} comprados {pending > 0 && <span className="text-error">· {pending} pendientes</span>}</div>
        </div>
      </div>

      {total > 0 && (
        <div style={{height:6, background:'#E7E0EC', borderRadius:99, marginBottom:16}}>
          <div style={{height:'100%', background:'#6750A4', borderRadius:99, width:progress+'%', transition:'width 0.3s'}} />
        </div>
      )}

      {Object.keys(grouped).length === 0 && (
        <div className="empty">
          <div className="emoji">🛒</div>
          <h3>Lista vacía</h3>
          <p>Toca + para agregar productos</p>
        </div>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{marginBottom:16}}>
          <div style={{fontSize:'0.78rem', fontWeight:700, color:'#6750A4', textTransform:'uppercase', letterSpacing:1, marginBottom:6}}>{cat}</div>
          {items.map(item => (
            <div key={item.id} className={'list-item-card' + (item.is_checked ? ' checked' : '') + (item.is_pending ? ' pending' : '')}>
              <div className={'checkbox' + (item.is_checked ? ' checked' : '')} onClick={() => handleCheck(item)}>
                {item.is_checked && <span style={{color:'white', fontSize:'0.9rem'}}>✓</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, fontSize:'0.95rem', textDecoration: item.is_checked ? 'line-through' : 'none'}}>
                  {item.product_name}
                </div>
                <div className="text-sm text-muted">{item.quantity} {item.unit}</div>
                {item.is_pending && (
                  <div style={{fontSize:'0.78rem', color:'#B3261E', display:'flex', alignItems:'center', gap:4, marginTop:2}}>
                    🚩 {item.pending_notes || 'No disponible'}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {!item.is_checked && (
                  item.is_pending
                    ? <button className="btn btn-ghost btn-sm" onClick={() => handleUnpending(item)} style={{fontSize:'0.75rem'}}>Quitar 🚩</button>
                    : <button onClick={() => { setShowPendingFor(item); setPendingNote('') }}
                        style={{background:'none', border:'none', fontSize:'1.1rem', cursor:'pointer'}} title="Marcar pendiente">🚩</button>
                )}
                <button onClick={() => handleRemove(item.id)}
                  style={{background:'none', border:'none', fontSize:'1.1rem', cursor:'pointer', color:'#B3261E'}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <button className="fab" onClick={() => setShowAdd(true)}>+</button>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Agregar producto</h2>
            <input className="input mb-3" placeholder="🔍 Buscar producto..." value={search}
              onChange={e => setSearch(e.target.value)} autoFocus />
            <div style={{maxHeight:220, overflowY:'auto', marginBottom:12}}>
              {products.filter(p => !list?.items?.some(i => i.product_id === p.id)).map(p => (
                <div key={p.id}
                  onClick={() => { setSelected(p); setUnit(p.default_unit) }}
                  style={{
                    padding:'10px 12px', borderRadius:8, cursor:'pointer', marginBottom:4,
                    background: selected?.id === p.id ? '#EADDFF' : '#F6F2FA',
                    border: selected?.id === p.id ? '1.5px solid #6750A4' : '1.5px solid transparent',
                    display:'flex', justifyContent:'space-between', alignItems:'center'
                  }}>
                  <span style={{fontWeight:500}}>{p.name}</span>
                  <span className="text-sm text-muted">{p.category}</span>
                </div>
              ))}
              {products.filter(p => !list?.items?.some(i => i.product_id === p.id)).length === 0 && (
                <p className="text-sm text-muted" style={{textAlign:'center', padding:16}}>
                  {search ? 'No encontrado' : 'Sin productos disponibles'}
                </p>
              )}
            </div>
            {selected && (
              <div style={{background:'#F6F2FA', borderRadius:8, padding:12, marginBottom:12}}>
                <div style={{fontWeight:600, marginBottom:8}}>{selected.name}</div>
                <div className="flex gap-2">
                  <div style={{flex:1}}>
                    <label className="text-sm text-muted">Cantidad</label>
                    <input className="input mt-2" type="number" min="0.1" step="0.1" value={qty}
                      onChange={e => setQty(e.target.value)} />
                  </div>
                  <div style={{flex:1}}>
                    <label className="text-sm text-muted">Unidad</label>
                    <select className="input mt-2" value={unit} onChange={e => setUnit(e.target.value)}>
                      {['unidad','kg','g','litro','ml','paquete','caja','bolsa','docena'].map(u =>
                        <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button className="btn btn-ghost w-full" onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="btn btn-primary w-full" onClick={handleAdd} disabled={!selected}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {showPendingFor && (
        <div className="modal-overlay" onClick={() => setShowPendingFor(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>🚩 Marcar como pendiente</h2>
            <p className="text-sm text-muted mb-3"><strong>{showPendingFor.product_name}</strong> no estaba disponible</p>
            <input className="input mb-3" placeholder="Nota (ej: buscar en otro super)" value={pendingNote}
              onChange={e => setPendingNote(e.target.value)} />
            <div className="flex gap-2">
              <button className="btn btn-ghost w-full" onClick={() => setShowPendingFor(null)}>Cancelar</button>
              <button className="btn btn-danger w-full" onClick={handlePending}>Marcar pendiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
