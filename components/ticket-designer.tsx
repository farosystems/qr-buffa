"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getConfig, saveConfig, uploadLogo, deleteLogo, type TicketConfig } from "@/lib/config"
import { getAllTickets } from "@/lib/tickets"
import { TicketPreview } from "@/components/ticket-preview"
import { Upload, Save, Download, Trash2, Loader2 } from "lucide-react"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { toast } from "sonner"

export function TicketDesigner() {
  const [config, setConfig] = useState<TicketConfig | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConfig()
    loadTickets()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await getConfig()
      setConfig(data)
      setLogoPreview(data.logo)
    } catch (error) {
      console.error('Error loading config:', error)
      toast.error('Error al cargar la configuración')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTickets = async () => {
    try {
      const data = await getAllTickets()
      setTickets(data.slice(0, 5))
    } catch (error) {
      console.error('Error loading tickets:', error)
    }
  }

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El archivo es muy grande. Máximo 2MB.')
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes')
        return
      }

      setLogoFile(file)

      // Mostrar preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = async () => {
    if (config.logo) {
      try {
        await deleteLogo(config.logo)
        setConfig({ ...config, logo: null })
        setLogoPreview(null)
        setLogoFile(null)
        toast.success('Logo eliminado')
      } catch (error) {
        console.error('Error removing logo:', error)
        toast.error('Error al eliminar el logo')
      }
    } else {
      setLogoPreview(null)
      setLogoFile(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      let logoUrl = config.logo

      // Si hay un nuevo logo, subirlo primero
      if (logoFile) {
        setIsUploading(true)
        logoUrl = await uploadLogo(logoFile)
        setIsUploading(false)
      }

      // Guardar configuración
      await saveConfig({
        ...config,
        logo: logoUrl,
      })

      setConfig({ ...config, logo: logoUrl })
      setLogoFile(null)
      toast.success('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
      setIsUploading(false)
    }
  }

  const handleDownloadSample = async () => {
    setIsDownloading(true)
    try {
      await generateTicketPDF("PREVIEW-123")
    } catch (error) {
      console.error("Error downloading sample PDF:", error)
      alert("Error al descargar el PDF de muestra. Por favor intenta nuevamente.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Panel de Configuración */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Logo de la Empresa</CardTitle>
            <CardDescription>Sube el logo que aparecerá en los tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="w-24 h-24 border-2 border-border rounded-lg overflow-hidden bg-white flex items-center justify-center relative group">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="w-6 h-6 text-white" />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <Label htmlFor="logo" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors w-fit">
                    <Upload className="w-4 h-4" />
                    <span>{logoPreview ? 'Cambiar Logo' : 'Subir Logo'}</span>
                  </div>
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </Label>
                <p className="text-xs text-muted-foreground mt-2">PNG, JPG o SVG (máx. 2MB)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colores del Ticket</CardTitle>
            <CardDescription>Personaliza los colores principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Color Primario</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={config.primaryColor}
                    onChange={handleChange}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Color Secundario</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    name="secondaryColor"
                    type="color"
                    value={config.secondaryColor}
                    onChange={handleChange}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
            <CardDescription>Datos que aparecerán en el ticket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de la Empresa</Label>
              <Input
                id="companyName"
                name="companyName"
                value={config.companyName}
                onChange={handleChange}
                placeholder="Imantación de Volantes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Dirección</Label>
              <Input
                id="companyAddress"
                name="companyAddress"
                value={config.companyAddress}
                onChange={handleChange}
                placeholder="Calle Principal 123, Ciudad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyPhone">Teléfono</Label>
              <Input
                id="companyPhone"
                name="companyPhone"
                value={config.companyPhone || ''}
                onChange={handleChange}
                placeholder="+54 11 1234-5678"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Contraseña requerida para marcar tickets como pagados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="accessPassword">Contraseña de Acceso</Label>
              <Input
                id="accessPassword"
                name="accessPassword"
                type="password"
                value={config.accessPassword}
                onChange={handleChange}
                placeholder="Ingresa una contraseña segura"
                required
              />
              <p className="text-xs text-muted-foreground">
                Esta contraseña será solicitada al escanear tickets para marcarlos como pagados
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" disabled={isSaving || isUploading}>
          {isSaving || isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isUploading ? 'Subiendo logo...' : 'Guardando...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>

      {/* Panel de Previsualización */}
      <div className="lg:sticky lg:top-8 h-fit space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Previsualización del Ticket</CardTitle>
            <CardDescription>Así se verá el ticket generado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TicketPreview config={config} />

            <Button
              onClick={handleDownloadSample}
              disabled={isDownloading}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? "Descargando..." : "Descargar Muestra PDF"}
            </Button>
          </CardContent>
        </Card>

        {tickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tickets Generados</CardTitle>
              <CardDescription>Total: {tickets.length} tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-2 bg-secondary rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-semibold">{ticket.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{ticket.id}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold ${ticket.status === "pagado" ? "text-green-600" : "text-accent"}`}
                    >
                      {ticket.status === "pagado" ? "Pagado" : "Pendiente"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
