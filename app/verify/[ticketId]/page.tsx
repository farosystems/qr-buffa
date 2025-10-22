"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTicketById, markTicketAsPaid } from "@/lib/tickets"
import { useUser } from "@clerk/nextjs"
import { syncUserWithSupabase } from "@/lib/user-sync"
import { CheckCircle2, Loader2, AlertCircle, Ticket, Lock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function VerifyTicketPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const ticketId = params.ticketId as string

  const [ticket, setTicket] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadTicket()
  }, [ticketId])

  const loadTicket = async () => {
    try {
      const data = await getTicketById(ticketId)

      if (!data) {
        setError("Ticket no encontrado")
      } else {
        setTicket(data)
        // Si el ticket ya está pagado, mostrar éxito directamente
        if (data.status === 'pagado') {
          setSuccess(true)
        }
      }
    } catch (err) {
      console.error("Error loading ticket:", err)
      setError("Error al cargar el ticket")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError("Por favor ingresa la contraseña")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      let supabaseUserId = null

      // Si el usuario está autenticado, sincronizar con Supabase
      if (user) {
        supabaseUserId = await syncUserWithSupabase(user)
      }

      // Marcar ticket como pagado (puede ser null si no hay usuario autenticado)
      await markTicketAsPaid(ticketId, supabaseUserId, password)

      // Éxito
      setSuccess(true)

      // Recargar el ticket
      await loadTicket()
    } catch (err: any) {
      console.error("Error marking ticket as paid:", err)
      setError(err.message || "Contraseña incorrecta o error al procesar el ticket")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando ticket...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success && ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 p-4">
        <Card className="w-full max-w-md border-4 border-white shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">¡Pago Confirmado!</h1>
              <p className="text-white/90 text-lg">El ticket ha sido marcado como pagado</p>
            </div>

            <div className="bg-white rounded-xl p-6 space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Ticket ID:</span>
                <span className="font-mono font-bold text-green-600">{ticket.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Cliente:</span>
                <span className="font-bold">{ticket.customer_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Email:</span>
                <span className="text-sm">{ticket.customer_email}</span>
              </div>
              {ticket.paid_at && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-muted-foreground font-semibold">Pagado el:</span>
                  <span className="font-bold text-green-600">
                    {format(new Date(ticket.paid_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => router.push('/tickets')}
              className="w-full bg-white text-green-600 hover:bg-white/90"
              size="lg"
            >
              Ver Todos los Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 p-4">
        <Card className="w-full max-w-md border-4 border-white shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Error</h1>
            <p className="text-white/90 text-lg mb-6">{error}</p>
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-white text-red-600 hover:bg-white/90"
              size="lg"
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
            <Ticket className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verificar Pago de Ticket</CardTitle>
          <CardDescription className="text-base">
            Ingresa la contraseña para confirmar el pago
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información del Ticket */}
          {ticket && (
            <div className="bg-secondary rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-semibold">Ticket ID:</span>
                <span className="font-mono font-bold text-primary">{ticket.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-semibold">Cliente:</span>
                <span className="font-bold">{ticket.customer_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-semibold">Email:</span>
                <span className="text-sm">{ticket.customer_email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-semibold">Teléfono:</span>
                <span className="text-sm">{ticket.customer_phone}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground font-semibold">Estado:</span>
                <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground font-bold text-xs">
                  Por Atender
                </span>
              </div>
            </div>
          )}

          {/* Formulario de Contraseña */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña de Acceso
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="h-12 text-base"
                required
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Contacta al administrador si no tienes la contraseña
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Pago
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
