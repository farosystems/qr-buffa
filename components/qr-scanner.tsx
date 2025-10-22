"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTicketById, updateTicketStatus, type Ticket } from "@/lib/ticket-storage"
import { Camera, CheckCircle2, XCircle, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function QRScanner() {
  const [manualId, setManualId] = useState("")
  const [scannedTicket, setScannedTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleManualSearch = () => {
    setError(null)
    setSuccess(null)

    if (!manualId.trim()) {
      setError("Por favor ingresa un ID de ticket")
      return
    }

    const ticket = getTicketById(manualId.trim())

    if (!ticket) {
      setError("Ticket no encontrado. Verifica el ID e intenta nuevamente.")
      setScannedTicket(null)
      return
    }

    setScannedTicket(ticket)
  }

  const handleMarkAsPaid = () => {
    if (!scannedTicket) return

    const updated = updateTicketStatus(scannedTicket.id, "paid")

    if (updated) {
      setSuccess("Ticket marcado como pagado exitosamente")
      setScannedTicket({ ...scannedTicket, status: "paid" })
      setManualId("")
    } else {
      setError("Error al actualizar el ticket")
    }
  }

  const startCamera = async () => {
    setIsScanning(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      setError("No se pudo acceder a la cámara. Por favor verifica los permisos.")
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  return (
    <div className="space-y-6">
      {/* Búsqueda Manual */}
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda Manual</CardTitle>
          <CardDescription>Ingresa el ID del ticket manualmente para verificarlo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="ticketId" className="sr-only">
                ID del Ticket
              </Label>
              <Input
                id="ticketId"
                placeholder="TKT-1234567890-ABC"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              />
            </div>
            <Button onClick={handleManualSearch}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Escáner de Cámara */}
      <Card>
        <CardHeader>
          <CardTitle>Escanear con Cámara</CardTitle>
          <CardDescription>Usa la cámara de tu dispositivo para escanear el código QR</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isScanning ? (
              <Button onClick={startCamera} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Activar Cámara
              </Button>
            ) : (
              <>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-4 border-primary/50 m-8 rounded-lg pointer-events-none" />
                </div>
                <Button onClick={stopCamera} variant="secondary" className="w-full">
                  Detener Cámara
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Nota: La detección automática de QR requiere una librería adicional. Por ahora, usa la búsqueda
                  manual.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mensajes de Error y Éxito */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Información del Ticket Escaneado */}
      {scannedTicket && (
        <Card className={scannedTicket.status === "paid" ? "border-green-500" : "border-accent"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Información del Ticket</span>
              {scannedTicket.status === "paid" ? (
                <span className="text-sm font-normal text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Pagado
                </span>
              ) : (
                <span className="text-sm font-normal text-accent flex items-center gap-1">Pendiente</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">ID del Ticket</p>
                <p className="font-mono font-semibold">{scannedTicket.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de Creación</p>
                <p className="font-semibold">{new Date(scannedTicket.createdAt).toLocaleDateString("es-AR")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p className="font-semibold">{scannedTicket.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Teléfono</p>
                <p className="font-semibold">{scannedTicket.customerPhone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold">{scannedTicket.customerEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Marca de Moto</p>
                <p className="font-semibold">{scannedTicket.motorcycleBrand}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Modelo</p>
                <p className="font-semibold">{scannedTicket.motorcycleModel}</p>
              </div>
            </div>

            {scannedTicket.status === "pending" && (
              <Button onClick={handleMarkAsPaid} className="w-full" size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar como Pagado
              </Button>
            )}

            {scannedTicket.status === "paid" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-900 font-semibold">Este ticket ya ha sido pagado</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
