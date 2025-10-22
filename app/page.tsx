import { Sidebar } from "@/components/sidebar"
import { TicketGeneratorForm } from "@/components/ticket-generator-form"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-72 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Generar Ticket
            </h1>
            <p className="text-muted-foreground text-lg">
              Crea un nuevo ticket con QR único para el servicio de imantación de volante
            </p>
          </div>
          <TicketGeneratorForm />
        </div>
      </main>
    </div>
  )
}
