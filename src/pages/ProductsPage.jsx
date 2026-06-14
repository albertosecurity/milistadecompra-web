import { useState, useEffect } from 'react'
import { getProducts, createProduct, deleteProduct, getCategories } from '../services/api'

const UNITS = ['unidad','kg','g','litro','ml','paquete','caja','bolsa','docena']

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'General', default_unit: 'unidad' })
  const [newCat, setNewCat] = useState('')

  const load = () => {
    Promise.all([getProducts(search, catFilter), getCategories()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, catFilter])

  const submit = async e => {
    e.preventDefault()
    const cat = newCat.trim() || form.category
    await createProduct({ ...form, category: cat })
    setShowModal(false)
    setForm({ name: '', category: 'General', default_unit: 'unidad' })
    setNewCat('')
    load()
  }

  const handleDelete = async id => {
    if (!confirm('¿Eliminar este producto?')) return
    await deleteProduct(id)
    load()
  }

  return (
    <div className="page">
      <div className="flex justify-between items-center" style={{margin:'16px 0 12px'}}>
        <h2 style={{fontSize:'1.1rem', fontWeight:700}}>Mis Productos</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Nuevo</button>
      </div>

      <input className="input mb-3" placeholder="🔍 Buscar producto..." value={search}
        onChange={e => setSearch(e.target.value)} />

      {categories.length > 0 && (
        <div className="flex gap-2 mb-3" style={{overflowX:'auto', paddingBottom:4}}>
          <button className={'chip' + (!catFilter ? ' active' : '')} onClick={() => setCatFilter('')}>Todos</button>
          {categories.map(c => (
            <button key={c} className={'chip' + (catFilter===c ? ' active' : '')} onClick={() => setCatFilter(c)}>{c}</button>
          ))}
        </div>
      )}

      {loading && <div className="spinner" />}

      {!loading && products.length === 0 && (
        <div className="empty">
          <div className="emoji">🏪</div>
          <h3>No hay productos</h3>
          <p>{search ? 'Intenta otra búsqueda' : 'Toca "+ Nuevo" para agregar'}</p>
        </div>
      )}

      {products.map(p => (
        <div key={p.id} className="card flex justify-between items-center" style={{marginBottom:8}}>
          <div>
            <div style={{fontWeight:600}}>{p.name}</div>
            <div className="text-sm text-muted">{p.category} · {p.default_unit}</div>
          </div>
          <button onClick={() => handleDelete(p.id)}
            style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'#B3261E'}}>🗑</button>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nuevo Producto</h2>
            <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:12}}>
              <div>
                <label className="text-sm text-muted">Nombre</label>
                <input className="input mt-2" placeholder="Ej: Leche" value={form.name}
                  onChange={e => setForm(f=>({...f,name:e.target.value}))} required autoFocus />
              </div>
              <div>
                <label className="text-sm text-muted">Categoría</label>
                <select className="input mt-2" value={form.category}
                  onChange={e => { setForm(f=>({...f,category:e.target.value})); setNewCat('') }}>
                  {['General','Lácteos','Carnes','Verduras','Frutas','Panadería','Bebidas','Limpieza','Higiene','Snacks','Congelados','Otros'].map(c =>
                    <option key={c} value={c}>{c}</option>)}
                  {categories.filter(c => !['General','Lácteos','Carnes','Verduras','Frutas','Panadería','Bebidas','Limpieza','Higiene','Snacks','Congelados','Otros'].includes(c)).map(c =>
                    <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted">Nueva categoría (opcional)</label>
                <input className="input mt-2" placeholder="Ej: Mascotas" value={newCat}
                  onChange={e => setNewCat(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-muted">Unidad por defecto</label>
                <select className="input mt-2" value={form.default_unit}
                  onChange={e => setForm(f=>({...f,default_unit:e.target.value}))}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" className="btn btn-ghost w-full" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary w-full">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
