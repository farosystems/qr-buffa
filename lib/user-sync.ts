import { supabase } from './supabase'
import type { User } from '@clerk/nextjs/server'

/**
 * Sincroniza el usuario de Clerk con Supabase
 * Se llama cuando un usuario inicia sesión por primera vez
 */
export async function syncUserWithSupabase(clerkUser: User) {
  const { id, emailAddresses, username, firstName, lastName, imageUrl } = clerkUser

  const email = emailAddresses[0]?.emailAddress
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || username || 'Usuario'
  const usernameValue = username || email?.split('@')[0] || `user_${id.slice(0, 8)}`

  // Verificar si el usuario ya existe
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', id)
    .single()

  if (existingUser) {
    // Actualizar información si ya existe
    await supabase
      .from('users')
      .update({
        username: usernameValue,
        email: email || '',
        name: fullName,
        image_url: imageUrl || null,
      })
      .eq('clerk_user_id', id)

    return existingUser.id
  }

  // Crear nuevo usuario en Supabase
  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_user_id: id,
      username: usernameValue,
      email: email || '',
      name: fullName,
      image_url: imageUrl || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error syncing user with Supabase:', error)
    throw error
  }

  return data.id
}

/**
 * Obtiene el ID de Supabase de un usuario a partir de su Clerk ID
 */
export async function getSupabaseUserId(clerkUserId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error || !data) {
    return null
  }

  return data.id
}
