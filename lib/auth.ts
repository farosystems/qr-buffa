import { getUserByUsername, createUser } from "./ticket-storage"

const AUTH_KEY = "auth_user"

export interface AuthUser {
  id: string
  username: string
  name: string
}

// Inicializar usuario demo si no existe
export function initDemoUser() {
  const existingUser = getUserByUsername("admin")
  if (!existingUser) {
    createUser("admin", "admin123", "Administrador")
  }
}

export function login(username: string, password: string): AuthUser | null {
  const user = getUserByUsername(username)

  if (!user || user.password !== password) {
    return null
  }

  const authUser: AuthUser = {
    id: user.id,
    username: user.username,
    name: user.name,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser))
  }

  return authUser
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  const data = localStorage.getItem(AUTH_KEY)
  return data ? JSON.parse(data) : null
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
