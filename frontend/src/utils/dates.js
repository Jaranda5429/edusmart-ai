// Colombia (Bogota) no usa horario de verano, su offset es siempre UTC-5
const BOGOTA_OFFSET = '-05:00'

// Convierte el valor de un <input type="datetime-local"> (hora de Bogota) a un ISO con offset,
// para que el backend lo guarde como el instante UTC correcto
export const toBogotaISO = (local) => {
  if (!local) return null
  return `${local}:00${BOGOTA_OFFSET}`
}

// Convierte una fecha ISO guardada (UTC) al formato de <input type="datetime-local"> en hora de Bogota
export const toDatetimeLocal = (iso) => {
  if (!iso) return ''
  const d = new Date(new Date(iso).getTime() - 5 * 60 * 60000)
  return d.toISOString().slice(0, 16)
}

// Formatea una fecha ISO para mostrarla siempre en hora de Bogota, sin importar la zona del navegador
export const fmtBogota = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })
}
