import { Sidebar } from "@/components/sidebar"
import { QRScanner } from "@/components/qr-scanner"

export default function ScannerPage() {
  return (
    <div className="flex min-h-screen bg-secondary">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Escanear QR</h1>
            <p className="text-muted-foreground">Escanea el código QR del ticket para verificar y marcar como pagado</p>
          </div>
          <QRScanner />
        </div>
      </main>
    </div>
  )
}
