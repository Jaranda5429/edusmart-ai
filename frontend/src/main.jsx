import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ProfesorProvider } from './context/ProfesorContext'
import { AdminProvider } from './context/AdminContext'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <AdminProvider>
      <ProfesorProvider>
        <App />
      </ProfesorProvider>
    </AdminProvider>
  </AuthProvider>,
)