export interface Ticket {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: "pending" | "paid"
  createdAt: string
  qrCode: string
}

export interface TicketConfig {
  logo: string | null
  primaryColor: string
  secondaryColor: string
  companyName: string
  companyAddress: string
  companyPhone: string
}

export interface User {
  id: string
  username: string
  password: string
  name: string
  createdAt: string
}

const TICKETS_KEY = "tickets"
const CONFIG_KEY = "ticket_config"
const USERS_KEY = "users"

// Generar ID único
function generateId(): string {
  return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export function createTicket(data: Omit<Ticket, "id" | "status" | "createdAt" | "qrCode">): Ticket {
  const id = generateId()
  const ticket: Ticket = {
    ...data,
    id,
    status: "pending",
    createdAt: new Date().toISOString(),
    qrCode: id,
  }

  const tickets = getTickets()
  tickets.push(ticket)
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets))

  return ticket
}

// Obtener todos los tickets
export function getTickets(): Ticket[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(TICKETS_KEY)
  return data ? JSON.parse(data) : []
}

// Obtener ticket por ID
export function getTicketById(id: string): Ticket | null {
  const tickets = getTickets()
  return tickets.find((t) => t.id === id) || null
}

// Actualizar estado del ticket
export function updateTicketStatus(id: string, status: "pending" | "paid"): boolean {
  const tickets = getTickets()
  const index = tickets.findIndex((t) => t.id === id)

  if (index === -1) return false

  tickets[index].status = status
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets))
  return true
}

// Obtener configuración
export function getConfig(): TicketConfig {
  if (typeof window === "undefined") {
    return getDefaultConfig()
  }

  const data = localStorage.getItem(CONFIG_KEY)
  return data ? JSON.parse(data) : getDefaultConfig()
}

// Guardar configuración
export function saveConfig(config: TicketConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

export function createUser(username: string, password: string, name: string): User {
  const user: User = {
    id: `USR-${Date.now()}`,
    username,
    password, // En producción, esto debería estar hasheado
    name,
    createdAt: new Date().toISOString(),
  }

  const users = getUsers()
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))

  return user
}

export function getUserByUsername(username: string): User | null {
  const users = getUsers()
  return users.find((u) => u.username === username) || null
}

// Configuración por defecto actualizada
function getDefaultConfig(): TicketConfig {
  return {
    logo: null,
    primaryColor: "#06b6d4",
    secondaryColor: "#ec4899",
    companyName: "Buffa-Bikes",
    companyAddress: "Dirección del Local",
    companyPhone: "+54 11 1234-5678",
  }
}
