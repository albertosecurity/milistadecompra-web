import { useState, useEffect } from 'react'
import { getPending, resolvePending } from '../services/api'

export default function PendingPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmItem, setConfirmItem] = useState(null)

  const load = () => getPending().then(r => setItems(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleResolve = async () => {
    await resolvePending(confirmItem.id)
    setConfirmItem(null)
    load()
  }

  const grouped = {}
  items.forEach(i => {
    if (!grouped[i.list_name]) grouped[i.list_name] = []
    grouped[i.list_name].push(i)
  })

  return (
    <div className="page">
      <h2 style={{fontSize:'1.1rem', fontWeight:700, margin:'16px 0 12px'}}>🚩 Pendientes</h2>

      {loading && <div className="spinner" />}

      {!loading && items.length === 0 && (
        <div className="empty">
          <div className="emoji">✅</div>
          <h3>¡Sin pendientes!</h3>
          <p>Encontraste todo en el super</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="alert alert-warning mb-3">
          🚩 {items.length} producto{items.length !== 1 ? 's' : ''} pendiente{items.length !== 1 ? 's' : ''} de compra
        </div>
      )}

      {Object.entries(grouped).map(([listName, listItems]) => (
        <div key={listName} style={{marginBottom:20}}>
          <div className="text-sm text-muted mb-3" style={{fontWeight:600}}>De: {listName}</div>
          {listItems.map(item => (
            <div key={item.id} className="card" style={{marginBottom:8, borderLeft:'3px solid #B3261E'}}>
              <div className="flex justify-between items-center">
                <div>
                  <div style={{fontWeight:600}}>{item.product_name}</div>
                  <div className="text-sm text-muted">{item.quantity} {item.unit} · {item.product_category}</div>
                  {item.pending_notes && (
                    <div style={{fontSize:'0.8rem', color:'#7D5700', marginTop:4}}>📝 {item.pending_notes}</div>
                  )}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setConfirmItem(item)}>
                  ✓ Lo encontré
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {confirmItem && (
        <div className="modal-overlay" onClick={() => setConfirmItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>¿Lo encontraste?</h2>
            <p className="text-sm text-muted mb-3">
              <strong>{confirmItem.product_name}</strong> se marcará como comprado en tu lista.
            </p>
            <div className="flex gap-2">
              <button className="btn btn-ghost w-full" onClick={() => setConfirmItem(null)}>Cancelar</button>
              <button className="btn btn-primary w-full" onClick={handleResolve}>Sí, lo encontré ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
