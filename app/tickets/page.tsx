"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getAllTickets } from "@/lib/tickets"
import { getConfig, type TicketConfig } from "@/lib/config"
import { TicketPreview } from "@/components/ticket-preview"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { Ticket, Search, Calendar, Mail, Phone, CheckCircle2, Clock, Download } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 10

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [filteredTickets, setFilteredTickets] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, porAtender: 0, pagados: 0 })
  const [downloadingTickets, setDownloadingTickets] = useState<Set<string>>(new Set())
  const [currentTicketForPDF, setCurrentTicketForPDF] = useState<any>(null)
  const [config, setConfig] = useState<TicketConfig | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadTickets()
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

  useEffect(() => {
    filterTickets()
  }, [searchTerm, tickets])

  const loadTickets = async () => {
    try {
      const data = await getAllTickets()
      setTickets(data)

      // Calcular estadísticas
      const total = data.length
      const porAtender = data.filter(t => t.status === 'por_atender').length
      const pagados = data.filter(t => t.status === 'pagado').length
      setStats({ total, porAtender, pagados })
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTickets = () => {
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets)
      setCurrentPage(1) // Reset a primera página al filtrar
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = tickets.filter(ticket =>
      ticket.id.toLowerCase().includes(term) ||
      ticket.customer_name.toLowerCase().includes(term) ||
      ticket.customer_email.toLowerCase().includes(term) ||
      ticket.customer_phone.toLowerCase().includes(term)
    )
    setFilteredTickets(filtered)
    setCurrentPage(1) // Reset a primera página al filtrar
  }

  // Calcular tickets para la página actual
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTickets = filteredTickets.slice(startIndex, endIndex)

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleDownloadPDF = async (ticket: any) => {
    setDownloadingTickets(prev => new Set(prev).add(ticket.id))
    setCurrentTicketForPDF(ticket)

    // Esperar a que el DOM se actualice con el preview y el QR code se genere
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      await generateTicketPDF(ticket.id)
      toast.success('PDF descargado exitosamente')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Error al descargar el PDF. Intenta nuevamente.')
    } finally {
      setDownloadingTickets(prev => {
        const newSet = new Set(prev)
        newSet.delete(ticket.id)
        return newSet
      })
      setCurrentTicketForPDF(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-72 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tickets Generados
            </h1>
            <p className="text-muted-foreground text-lg">
              Visualiza y gestiona todos los tickets del sistema
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Total Tickets</p>
                    <p className="text-3xl font-bold text-primary">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Por Atender</p>
                    <p className="text-3xl font-bold text-accent">{stats.porAtender}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Pagados</p>
                    <p className="text-3xl font-bold text-green-600">{stats.pagados}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Búsqueda */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Buscar por ID, nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Tickets */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? "No se encontraron tickets" : "No hay tickets generados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {currentTickets.map((ticket) => (
                <Card key={ticket.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg font-mono">{ticket.id}</CardTitle>
                          <Badge
                            variant={ticket.status === 'pagado' ? 'default' : 'secondary'}
                            className={ticket.status === 'pagado' ? 'bg-green-500 hover:bg-green-600' : 'bg-accent'}
                          >
                            {ticket.status === 'pagado' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Pagado
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Por Atender
                              </>
                            )}
                          </Badge>
                        </div>
                        <CardDescription className="text-base font-semibold text-foreground">
                          {ticket.customer_name}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(ticket.created_at), "dd 'de' MMM, yyyy", { locale: es })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(ticket.created_at), "HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{ticket.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{ticket.customer_phone}</span>
                      </div>
                    </div>

                    {ticket.status === 'pagado' && ticket.paid_at && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Pagado el:</span>
                          <span className="font-semibold">
                            {format(new Date(ticket.paid_at), "dd 'de' MMM, yyyy 'a las' HH:mm", { locale: es })}
                          </span>
                        </div>
                        {ticket.paid_by_user && (
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Atendido por:</span>
                            <span className="font-semibold">{ticket.paid_by_user.name}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {ticket.status === 'por_atender' && (
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          onClick={() => handleDownloadPDF(ticket)}
                          disabled={downloadingTickets.has(ticket.id)}
                          className="w-full"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {downloadingTickets.has(ticket.id) ? 'Descargando...' : 'Descargar Ticket PDF'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page as number)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  Mostrando {startIndex + 1} - {Math.min(endIndex, filteredTickets.length)} de {filteredTickets.length} tickets
                </p>
              </div>
            )}
          </>
          )}

          {/* Preview oculto para generar PDFs */}
          {currentTicketForPDF && config && (
            <div style={{ position: 'fixed', left: '-9999px', top: '0' }}>
              <TicketPreview
                config={config}
                ticketData={{
                  id: currentTicketForPDF.id,
                  customerName: currentTicketForPDF.customer_name,
                  createdAt: currentTicketForPDF.created_at,
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
