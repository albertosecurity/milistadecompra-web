import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import LoginPage from './pages/LoginPage'
import ListsPage from './pages/ListsPage'
import ListDetailPage from './pages/ListDetailPage'
import ProductsPage from './pages/ProductsPage'
import PendingPage from './pages/PendingPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  const { user } = useAuth()
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<ListsPage />} />
          <Route path="lista/:id" element={<ListDetailPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="pendientes" element={<PendingPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}
