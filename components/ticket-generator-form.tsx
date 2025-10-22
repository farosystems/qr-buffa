"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createTicket } from "@/lib/tickets"
import { getConfig, type TicketConfig } from "@/lib/config"
import { Ticket, Download, Sparkles, AlertCircle } from "lucide-react"
import { TicketPreview } from "@/components/ticket-preview"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TicketGeneratorForm() {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTicket, setGeneratedTicket] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<TicketConfig | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await getConfig()
      setConfig(data)
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      const ticket = await createTicket({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
      })

      setGeneratedTicket(ticket)
      toast.success('Ticket generado exitosamente')

      // Limpiar formulario
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
      })
    } catch (err) {
      console.error('Error al generar ticket:', err)
      setError('Error al generar el ticket. Por favor intenta nuevamente.')
      toast.error('Error al generar el ticket')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleDownloadPDF = async () => {
    if (!generatedTicket || !config) return

    setIsDownloading(true)

    // Esperar a que el preview se renderice completamente
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      await generateTicketPDF(generatedTicket.id)
      toast.success('PDF descargado exitosamente')
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast.error("Error al descargar el PDF. Por favor intenta nuevamente.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-xl">
        <CardHeader className="gradient-card border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Información del Cliente
          </CardTitle>
          <CardDescription className="text-base">
            Completa los datos del cliente para generar el ticket con QR único
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-base font-semibold">
                  Nombre del Cliente
                </Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="text-base font-semibold">
                  Email
                </Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="juan@ejemplo.com"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customerPhone" className="text-base font-semibold">
                  Teléfono
                </Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="+54 11 1234-5678"
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-14 text-lg gradient-primary shadow-lg" disabled={isGenerating}>
              {isGenerating ? (
                <>Generando Ticket...</>
              ) : (
                <>
                  <Ticket className="w-5 h-5 mr-2" />
                  Generar Ticket con QR
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedTicket && (
        <>
          <Card className="border-2 border-primary shadow-xl gradient-card">
            <CardHeader>
              <CardTitle className="text-2xl text-primary flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Ticket Generado Exitosamente
              </CardTitle>
              <CardDescription className="text-base">El ticket ha sido creado y guardado en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 space-y-3 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">ID del Ticket:</span>
                    <span className="font-mono font-bold text-lg text-primary">{generatedTicket.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Cliente:</span>
                    <span className="font-bold">{generatedTicket.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Email:</span>
                    <span className="font-semibold">{generatedTicket.customer_email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Estado:</span>
                    <span className="px-4 py-1 rounded-full bg-accent text-accent-foreground font-bold text-sm">
                      Pendiente de Pago
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="w-full h-14 text-lg gradient-accent shadow-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isDownloading ? "Descargando..." : "Descargar Ticket PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {config && (
            <div style={{ position: 'fixed', left: '-9999px', top: '0' }}>
              <TicketPreview
                config={config}
                ticketData={{
                  id: generatedTicket.id,
                  customerName: generatedTicket.customer_name,
                  createdAt: generatedTicket.created_at,
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
