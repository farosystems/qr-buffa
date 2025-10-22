import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Tickets QR - Imantación de Volantes",
  description: "Sistema de gestión de tickets con QR para servicio de imantación de volantes de moto",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
