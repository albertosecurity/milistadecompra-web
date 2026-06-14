import axios from 'axios'

const API_URL = 'https://milistadecompra-production.up.railway.app'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (email, password) => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  return api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password })

export const getMe = () => api.get('/users/me')

export const getProducts = (search = '', category = '') =>
  api.get('/products/', { params: { search: search || undefined, category: category || undefined } })

export const createProduct = (data) => api.post('/products/', data)
export const updateProduct = (id, data) => api.put('/products/' + id, data)
export const deleteProduct = (id) => api.delete('/products/' + id)
export const getCategories = () => api.get('/products/categories')

export const getLists = () => api.get('/lists/')
export const createList = (data) => api.post('/lists/', data)
export const getListDetail = (id) => api.get('/lists/' + id)
export const updateList = (id, data) => api.put('/lists/' + id, data)
export const deleteList = (id) => api.delete('/lists/' + id)
export const copyList = (id, data) => api.post('/lists/' + id + '/copy', data)

export const addItem = (listId, data) => api.post('/lists/' + listId + '/items', data)
export const updateItem = (listId, itemId, data) => api.patch('/lists/' + listId + '/items/' + itemId, data)
export const removeItem = (listId, itemId) => api.delete('/lists/' + listId + '/items/' + itemId)

export const getPending = () => api.get('/pending/')
export const getPendingCount = () => api.get('/pending/count')
export const resolvePending = (itemId) => api.patch('/pending/' + itemId + '/resolve')

export default api
