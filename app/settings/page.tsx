import { Sidebar } from "@/components/sidebar"
import { TicketDesigner } from "@/components/ticket-designer"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-secondary">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Configuración del Ticket</h1>
            <p className="text-muted-foreground">Personaliza el diseño y la información que aparecerá en los tickets</p>
          </div>
          <TicketDesigner />
        </div>
      </main>
    </div>
  )
}
