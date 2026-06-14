import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { listService, itemService, productService } from '../services/api'

export default function ListDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [list, setList] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPendingModal, setShowPendingModal] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [qty, setQty] = useState('1')
  const [unit, setUnit] = useState('unidad')
  const [pendingNote, setPendingNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => listService.getDetail(id).then(r => setList(r.data)).finally(() => setLoading(false))
  const loadProducts = (q) => productService.getAll(q || null, null).then(r => setProducts(r.data))

  useEffect(() => { load() }, [id])
  useEffect(() => { if (showAddModal) loadProducts(search) }, [search, showAddModal])

  const addItem = async e => {
    e.preventDefault()
    if (!selectedProduct) return
    setSaving(true)
    try {
      await itemService.add(id, {
        product_id: selectedProduct.id,
        quantity: parseFloat(qty) || 1,
        unit
      })
      setShowAddModal(false)
      setSelectedProduct(null)
      setSearch('')
      setQty('1')
      setUnit('unidad')
      load()
    } finally { setSaving(false) }
  }

  const toggleCheck = async (item) => {
    if (item.is_pending) return
    await itemService.update(id, item.id, { is_checked: !item.is_checked })
    load()
  }

  const markPending = async () => {
    setSaving(true)
    try {
      await itemService.update(id, showPendingModal.id, {
        is_pending: true,
        pending_notes: pendingNote || null
      })
      setShowPendingModal(null)
      setPendingNote('')
      load()
    } finally { setSaving(false) }
  }

  const unmarkPending = async (item) => {
    await itemService.update(id, item.id, { is_pending: false })
    load()
  }

  const removeItem = async (itemId) => {
    if (!confirm('¿Quitar este producto de la lista?')) return
    await itemService.remove(id, itemId)
    load()
  }

  if (loading) return <div className="spinner">🔄</div>
  if (!list) return <div className="page"><p>Lista no encontrada</p></div>

  // Agrupar items por categoría
  const grouped = list.items.reduce((acc, item) => {
    const cat = item.product_category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const checkedCount = list.items.filter(i => i.is_checked).length
  const pendingCount = list.items.filter(i => i.is_pending).length
  const progress = list.items.length ? Math.round((checkedCount / list.items.length) * 100) : 0

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <button className="btn-icon" onClick={() => navigate('/')}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '18px', fontWeight: '700' }}>{list.name}</h1>
          <p style={{ fontSize: '13px', color: '#49454F' }}>
            {checkedCount}/{list.items.length} comprados
            {pendingCount > 0 && <span style={{ color: '#B3261E', marginLeft: '8px' }}>• 🚩 {pendingCount} pendientes</span>}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      {list.items.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ background: '#E7E0EC', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: progress === 100 ? '#386A20' : '#6750A4',
              transition: 'width 0.3s'
            }} />
          </div>
          <p style={{ fontSize: '12px', color: '#49454F', marginTop: '4px', textAlign: 'right' }}>{progress}%</p>
        </div>
      )}

      {list.items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛍️</div>
          <p style={{ fontWeight: '600' }}>Lista vacía</p>
          <p style={{ fontSize: '14px' }}>Toca + para agregar productos</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <div className="section-label">{cat}</div>
            {items.map(item => (
              <div key={item.id} className="card" style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: item.is_pending ? '#FFF0F0' : item.is_checked ? '#F5F5F5' : 'white',
                opacity: item.is_checked && !item.is_pending ? 0.7 : 1
              }}>
                <input
                  type="checkbox"
                  checked={item.is_checked}
                  onChange={() => toggleCheck(item)}
                  disabled={item.is_pending}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#6750A4' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '500',
                    textDecoration: item.is_checked && !item.is_pending ? 'line-through' : 'none',
                    color: item.is_pending ? '#B3261E' : '#1C1B1F'
                  }}>{item.product_name}</div>
                  <div style={{ fontSize: '13px', color: '#6750A4' }}>{item.quantity} {item.unit}</div>
                  {item.is_pending && (
                    <div style={{ fontSize: '12px', color: '#B3261E', marginTop: '2px' }}>
                      🚩 {item.pending_notes || 'No disponible'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {!item.is_checked && (
                    <button
                      className="btn-icon"
                      title={item.is_pending ? 'Quitar pendiente' : 'Marcar pendiente'}
                      onClick={() => item.is_pending ? unmarkPending(item) : setShowPendingModal(item)}
                      style={{ color: item.is_pending ? '#B3261E' : '#49454F' }}
                    >🚩</button>
                  )}
                  <button className="btn-icon" onClick={() => removeItem(item.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      <button className="fab" onClick={() => setShowAddModal(true)}>+</button>

      {/* Modal agregar producto */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Agregar producto</span>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <input className="input" placeholder="🔍 Buscar producto..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ marginBottom: '10px' }} />
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', border: '1px solid #CAC4D0', borderRadius: '10px' }}>
              {products.length === 0 ? (
                <p style={{ padding: '16px', textAlign: 'center', color: '#49454F', fontSize: '14px' }}>
                  No hay productos. Ve a "Productos" para agregar.
                </p>
              ) : products.map(p => (
                <div key={p.id}
                  onClick={() => { setSelectedProduct(p); setUnit(p.default_unit) }}
                  style={{
                    padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                    background: selectedProduct?.id === p.id ? '#EADDFF' : 'transparent',
                    borderBottom: '1px solid #F4EFF4'
                  }}
                >
                  <span style={{ fontWeight: selectedProduct?.id === p.id ? '600' : '400' }}>{p.name}</span>
                  <span style={{ fontSize: '12px', color: '#49454F' }}>{p.category}</span>
                </div>
              ))}
            </div>
            {selectedProduct && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#49454F' }}>Cantidad</label>
                  <input className="input" type="number" value={qty} min="0.1" step="0.1"
                    onChange={e => setQty(e.target.value)} style={{ marginTop: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#49454F' }}>Unidad</label>
                  <select className="input" value={unit} onChange={e => setUnit(e.target.value)} style={{ marginTop: '4px' }}>
                    {['unidad','kg','g','litro','ml','paquete','caja','bolsa','docena'].map(u =>
                      <option key={u} value={u}>{u}</option>
                    )}
                  </select>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="btn btn-primary" disabled={!selectedProduct || saving} onClick={addItem}>
                {saving ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal marcar pendiente */}
      {showPendingModal && (
        <div className="modal-overlay" onClick={() => setShowPendingModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🚩 Marcar pendiente</span>
              <button className="btn-icon" onClick={() => setShowPendingModal(null)}>✕</button>
            </div>
            <p style={{ color: '#49454F', marginBottom: '12px' }}>
              <strong>{showPendingModal.product_name}</strong> no estaba disponible en el super.
            </p>
            <input className="input" placeholder="Nota opcional (ej: buscar en otro lado)"
              value={pendingNote} onChange={e => setPendingNote(e.target.value)} />
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="btn btn-outline" onClick={() => { setShowPendingModal(null); setPendingNote('') }}>Cancelar</button>
              <button className="btn btn-danger" disabled={saving} onClick={markPending}>
                {saving ? 'Guardando...' : '🚩 Marcar pendiente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
