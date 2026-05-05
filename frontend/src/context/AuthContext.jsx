import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario')
    const token = localStorage.getItem('token')
    if (usuarioGuardado && token) {
      setUsuario(JSON.parse(usuarioGuardado))
    }
    setLoading(false)
  }, [])

  const login = (datos) => {
    localStorage.setItem('token', datos.token)
    localStorage.setItem('usuario', JSON.stringify(datos.usuario))
    setUsuario(datos.usuario)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)