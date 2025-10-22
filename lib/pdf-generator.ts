import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function generateTicketPDF(ticketId: string): Promise<void> {
  const element = document.getElementById("ticket-preview")

  if (!element) {
    throw new Error("Ticket preview element not found")
  }

  try {
    // Esperar a que las imágenes se carguen (QR code canvas)
    await new Promise(resolve => setTimeout(resolve, 300))

    // Capturar el elemento como imagen
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
      width: element.scrollWidth,
      height: element.scrollHeight,
    })

    // Verificar que el canvas se generó correctamente
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Canvas generation failed - invalid dimensions")
    }

    // Crear PDF
    const imgData = canvas.toDataURL("image/png")

    // Validar que el data URL es válido
    if (!imgData || !imgData.startsWith('data:image/png')) {
      throw new Error("Invalid image data generated")
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Calcular dimensiones para centrar el ticket en el PDF
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = 150 // Ancho del ticket en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Centrar horizontalmente y con margen superior
    const x = (pageWidth - imgWidth) / 2
    const y = 15

    // Verificar si la imagen cabe en la página
    if (imgHeight > pageHeight - 30) {
      // Si es muy alta, ajustar por altura
      const scaledHeight = pageHeight - 30
      const scaledWidth = (canvas.width * scaledHeight) / canvas.height
      const scaledX = (pageWidth - scaledWidth) / 2
      pdf.addImage(imgData, "PNG", scaledX, 15, scaledWidth, scaledHeight)
    } else {
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight)
    }

    // Descargar el PDF
    pdf.save(`ticket-${ticketId}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
