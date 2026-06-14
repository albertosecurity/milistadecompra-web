import { useState, useEffect } from 'react'
import { productService } from '../services/api'

const UNITS = ['unidad','kg','g','litro','ml','paquete','caja','bolsa','docena']
const DEFAULT_CATEGORIES = ['Frutas y Verduras','Carnes','Lácteos','Panadería','Limpieza','Higiene','Bebidas','Congelados','Conservas','General']

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'General', default_unit: 'unidad' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      productService.getAll(search || null, filterCat || null),
      productService.getCategories()
    ]).then(([p, c]) => {
      setProducts(p.data)
      setCategories([...new Set([...DEFAULT_CATEGORIES, ...c.data])])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, filterCat])

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', category: 'General', default_unit: 'unidad' })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, category: p.category, default_unit: p.default_unit })
    setShowModal(true)
  }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await productService.update(editing.id, form)
      } else {
        await productService.create(form)
      }
      setShowModal(false)
      load()
    } finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await productService.delete(id)
    load()
  }

  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nuevo</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input className="input" placeholder="🔍 Buscar..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <select className="input" value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ flex: 1 }}>
          <option value="">Todas</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <div className="spinner">🔄</div> : (
        products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <p style={{ fontWeight: '600' }}>Sin productos</p>
            <p style={{ fontSize: '14px' }}>Agrega productos para usarlos en tus listas</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div className="section-label">{cat}</div>
              {items.map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#49454F' }}>{p.default_unit}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn-icon" onClick={() => openEdit(p)}>✏️</button>
                    <button className="btn-icon" onClick={() => del(p.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Editar producto' : 'Nuevo producto'}</span>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input className="input" placeholder="Nombre del producto" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              <select className="input" value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input" value={form.default_unit}
                onChange={e => setForm(p => ({ ...p, default_unit: e.target.value }))}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
