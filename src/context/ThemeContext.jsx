import { createContext, useContext, useState, useEffect } from 'react'

const THEMES = {
  teal:   { primary: '#167064', primaryLight: '#D0EFED', primaryDark: '#0E4D47', bg: '#F0F8F7', name: 'Verde Teal' },
  purple: { primary: '#6750A4', primaryLight: '#EADDFF', primaryDark: '#4F378B', bg: '#F6F2FA', name: 'Púrpura' },
  blue:   { primary: '#0061A4', primaryLight: '#D1E4FF', primaryDark: '#003258', bg: '#F0F4FF', name: 'Azul' },
  orange: { primary: '#8B5000', primaryLight: '#FFDDB3', primaryDark: '#5C3400', bg: '#FFF8F0', name: 'Naranja' },
  red:    { primary: '#9B1B30', primaryLight: '#FFD9DE', primaryDark: '#680020', bg: '#FFF0F1', name: 'Rojo' },
  green:  { primary: '#1B6B3A', primaryLight: '#C8F0D8', primaryDark: '#0A4724', bg: '#F0FBF4', name: 'Verde' },
  pink: { primary: '#8B1A5C', primaryLight: '#FFD7EF', primaryDark: '#5C0F3C', bg: '#FFF0F8', name: 'Rosado' },
}

const FONTS = {
  system:  { family: "'Segoe UI', system-ui, sans-serif", name: 'Sistema' },
  rounded: { family: "'Nunito', 'Segoe UI', sans-serif", name: 'Redondeada' },
  modern:  { family: "'Inter', 'Segoe UI', sans-serif", name: 'Moderna' },
  classic: { family: "'Georgia', 'Times New Roman', serif", name: 'Clásica' },
  mono:    { family: "'Courier New', 'Courier', monospace", name: 'Monoespaciada' },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'teal')
  const [font, setFont] = useState(() => localStorage.getItem('font') || 'system')

  useEffect(() => {
    const t = THEMES[theme]
    const f = FONTS[font]
    const root = document.documentElement
    root.style.setProperty('--primary', t.primary)
    root.style.setProperty('--primary-light', t.primaryLight)
    root.style.setProperty('--primary-dark', t.primaryDark)
    root.style.setProperty('--bg', t.bg)
    document.body.style.background = t.bg
    document.body.style.fontFamily = f.family
    localStorage.setItem('theme', theme)
    localStorage.setItem('font', font)
  }, [theme, font])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, font, setFont, THEMES, FONTS }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
