import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qtboeidqyojmwjalcqna.supabase.co'
const SUPABASE_KEY = 'sb_publishable_g2S3Hic0O2fnsQ1S8-z8hA_qL5hn7NO'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const subirArchivo = async (archivo, estudianteId, actividadId) => {
  const ext = archivo.name.split('.').pop()
  const path = 'entregas/' + actividadId + '/' + estudianteId + '_' + Date.now() + '.' + ext

  const { data, error } = await supabase.storage
    .from('entregas')
    .upload(path, archivo, { upsert: true })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('entregas')
    .getPublicUrl(path)

  return { url: urlData.publicUrl, nombre: archivo.name }
}

export const subirContenido = async (archivo, materiaId) => {
  const ext = archivo.name.split('.').pop()
  const path = 'contenidos/' + materiaId + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext

  const { data, error } = await supabase.storage
    .from('entregas')
    .upload(path, archivo, { upsert: true })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('entregas')
    .getPublicUrl(path)

  return { url: urlData.publicUrl, nombre: archivo.name }
}