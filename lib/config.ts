import { supabase } from './supabase'
import type { Database } from './database.types'

type ConfigRow = Database['public']['Tables']['config']['Row']
type ConfigInsert = Database['public']['Tables']['config']['Insert']
type ConfigUpdate = Database['public']['Tables']['config']['Update']

export interface TicketConfig {
  logo: string | null
  primaryColor: string
  secondaryColor: string
  companyName: string
  companyAddress: string | null
  companyPhone: string | null
  accessPassword: string
}

/**
 * Obtener la configuración del sistema
 */
export async function getConfig(): Promise<TicketConfig> {
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .single()

  if (error) {
    // Si no existe configuración, retornar valores por defecto
    if (error.code === 'PGRST116') {
      return getDefaultConfig()
    }
    console.error('Error fetching config:', error)
    throw error
  }

  return {
    logo: data.logo,
    primaryColor: data.primary_color,
    secondaryColor: data.secondary_color,
    companyName: data.company_name,
    companyAddress: data.company_address,
    companyPhone: data.company_phone,
    accessPassword: data.access_password,
  }
}

/**
 * Guardar o actualizar la configuración
 */
export async function saveConfig(config: TicketConfig) {
  // Verificar si ya existe una configuración
  const { data: existing } = await supabase
    .from('config')
    .select('id')
    .single()

  const configData = {
    logo: config.logo,
    primary_color: config.primaryColor,
    secondary_color: config.secondaryColor,
    company_name: config.companyName,
    company_address: config.companyAddress,
    company_phone: config.companyPhone,
    access_password: config.accessPassword,
  }

  if (existing) {
    // Actualizar configuración existente
    const { data, error } = await supabase
      .from('config')
      .update(configData)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating config:', error)
      throw error
    }

    return data
  } else {
    // Crear nueva configuración
    const { data, error } = await supabase
      .from('config')
      .insert(configData)
      .select()
      .single()

    if (error) {
      console.error('Error creating config:', error)
      throw error
    }

    return data
  }
}

/**
 * Subir logo al bucket de Supabase
 */
export async function uploadLogo(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `logo-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from('imagenes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    console.error('Error uploading logo:', error)
    throw error
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('imagenes')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

/**
 * Eliminar logo del bucket
 */
export async function deleteLogo(logoUrl: string) {
  // Extraer el nombre del archivo de la URL
  const fileName = logoUrl.split('/').pop()
  if (!fileName) return

  const { error } = await supabase.storage
    .from('imagenes')
    .remove([fileName])

  if (error) {
    console.error('Error deleting logo:', error)
    throw error
  }
}

/**
 * Configuración por defecto
 */
function getDefaultConfig(): TicketConfig {
  return {
    logo: null,
    primaryColor: '#06b6d4',
    secondaryColor: '#ec4899',
    companyName: 'Buffa-Bikes',
    companyAddress: 'Dirección del Local',
    companyPhone: '+54 11 1234-5678',
    accessPassword: 'admin123',
  }
}
