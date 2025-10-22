"use client"
import { useEffect, useRef } from "react"
import type { TicketConfig } from "@/lib/ticket-storage"
import QRCode from "qrcode"

interface TicketPreviewProps {
  config: TicketConfig
  ticketData?: {
    id: string
    customerName: string
    createdAt: string
  }
}

export function TicketPreview({ config, ticketData }: TicketPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const data = ticketData || {
    id: "TKT-PREVIEW-123",
    customerName: "Juan Pérez",
    createdAt: new Date().toISOString(),
  }

  useEffect(() => {
    if (canvasRef.current) {
      // Generar URL completa para el QR
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      const qrUrl = `${baseUrl}/verify/${data.id}`

      console.log('QR URL generada:', qrUrl) // Debug

      QRCode.toCanvas(canvasRef.current, qrUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: config.primaryColor,
          light: "#FFFFFF",
        },
      })
    }
  }, [data.id, config.primaryColor])

  return (
    <div
      id="ticket-preview"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '32px',
        width: '400px',
        margin: '0 auto'
      }}
    >
      {/* Header con Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: `4px solid ${config.primaryColor}`,
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px'
        }}
      >
        {config.logo ? (
          <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={config.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        ) : (
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: config.primaryColor,
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '20px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          >
            BB
          </div>
        )}
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '20px', color: config.primaryColor, margin: 0 }}>
            {config.companyName}
          </h3>
          <p style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500', margin: '4px 0 0 0' }}>{config.companyPhone}</p>
        </div>
      </div>

      {/* Información del Ticket */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            backgroundColor: config.primaryColor,
            color: '#ffffff',
            textAlign: 'center',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        >
          TICKET DE SERVICIO
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <span style={{ color: '#4b5563', fontWeight: '600' }}>Ticket ID:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: config.primaryColor }}>{data.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <span style={{ color: '#4b5563', fontWeight: '600' }}>Cliente:</span>
            <span style={{ fontWeight: 'bold', color: '#000000' }}>{data.customerName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <span style={{ color: '#4b5563', fontWeight: '600' }}>Fecha:</span>
            <span style={{ fontWeight: 'bold', color: '#000000' }}>{new Date(data.createdAt).toLocaleDateString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: `4px solid ${config.secondaryColor}`, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <canvas ref={canvasRef} />
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px', textAlign: 'center', fontWeight: '500' }}>Escanea este código para verificar el pago</p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '2px solid #e5e7eb' }}>
        <p style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500', margin: 0 }}>{config.companyAddress}</p>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginTop: '12px',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'inline-block',
            color: config.secondaryColor
          }}
        >
          Servicio de Imantación de Volante
        </p>
      </div>
    </div>
  )
}
