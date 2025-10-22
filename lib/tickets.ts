import { supabase } from './supabase'
import type { Database } from './database.types'

type TicketRow = Database['public']['Tables']['tickets']['Row']
type TicketInsert = Database['public']['Tables']['tickets']['Insert']
type TicketUpdate = Database['public']['Tables']['tickets']['Update']

export interface CreateTicketData {
  customerName: string
  customerEmail: string
  customerPhone: string
}

// Generar ID único para ticket
function generateTicketId(): string {
  return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

/**
 * Crear un nuevo ticket en Supabase
 */
export async function createTicket(data: CreateTicketData) {
  const ticketId = generateTicketId()

  const ticketData: TicketInsert = {
    id: ticketId,
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    customer_phone: data.customerPhone,
    qr_code: ticketId, // El QR contiene el ID del ticket
    status: 'por_atender',
  }

  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert(ticketData)
    .select()
    .single()

  if (error) {
    console.error('Error creating ticket:', error)
    throw error
  }

  return ticket
}

/**
 * Obtener todos los tickets
 */
export async function getAllTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      paid_by_user:users(name, email, image_url)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tickets:', error)
    throw error
  }

  return data
}

/**
 * Obtener un ticket por ID
 */
export async function getTicketById(id: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      paid_by_user:users(name, email, image_url)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el ticket
      return null
    }
    console.error('Error fetching ticket:', error)
    throw error
  }

  return data
}

/**
 * Marcar un ticket como pagado
 */
export async function markTicketAsPaid(ticketId: string, userId: string | null, accessPassword: string) {
  // Verificar contraseña de acceso
  const { data: config } = await supabase
    .from('config')
    .select('access_password')
    .single()

  if (!config || config.access_password !== accessPassword) {
    throw new Error('Contraseña de acceso incorrecta')
  }

  // Actualizar el ticket
  const { data, error } = await supabase
    .from('tickets')
    .update({
      status: 'pagado',
      paid_by: userId,
      paid_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .select()
    .single()

  if (error) {
    console.error('Error marking ticket as paid:', error)
    throw error
  }

  return data
}

/**
 * Obtener estadísticas de tickets
 */
export async function getTicketStats() {
  const { data: allTickets } = await supabase
    .from('tickets')
    .select('status')

  if (!allTickets) return { total: 0, porAtender: 0, pagados: 0 }

  const total = allTickets.length
  const porAtender = allTickets.filter(t => t.status === 'por_atender').length
  const pagados = allTickets.filter(t => t.status === 'pagado').length

  return { total, porAtender, pagados }
}
