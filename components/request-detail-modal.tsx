"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { X, Download, CheckCircle, XCircle } from "lucide-react"
import type { AccessRequest, User } from "@/lib/storage"
import { jsPDF } from "jspdf"

interface RequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: AccessRequest
  user: User
  onApprove?: () => void
  onReject?: () => void
  canApprove?: boolean
}

export function RequestDetailModal({
  isOpen,
  onClose,
  request,
  user,
  onApprove,
  onReject,
  canApprove,
}: RequestDetailModalProps) {
  if (!isOpen) return null

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      solicitante: "Solicitante",
      "talento-humano": "Talento Humano",
      "gerencia-th": "Gerencia de Talento Humano",
      tecnologia: "Tecnología de la Información",
      "gerencia-ti": "Gerencia de Tecnología de la Información",
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getStatusColor = (status: string) => {
    const colors = {
      "pendiente-th": "bg-yellow-100 text-yellow-800",
      "pendiente-gerencia-th": "bg-orange-100 text-orange-800",
      "pendiente-ti": "bg-blue-100 text-blue-800",
      "pendiente-gerencia-ti": "bg-purple-100 text-purple-800",
      implementacion: "bg-indigo-100 text-indigo-800",
      completado: "bg-green-100 text-green-800",
      rechazado: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusDisplayName = (status: string) => {
    const statusNames = {
      "pendiente-th": "Pendiente TH",
      "pendiente-gerencia-th": "Pendiente Gerencia TH",
      "pendiente-ti": "Pendiente TI",
      "pendiente-gerencia-ti": "Pendiente Gerencia TI",
      implementacion: "En Implementación",
      completado: "Completado",
      rechazado: "Rechazado",
    }
    return statusNames[status as keyof typeof statusNames] || status
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-orange-100 text-orange-800"
      case "baja":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const generatePDF = async () => {
    try {
      // Crear nuevo documento PDF
      const doc = new jsPDF()

      // Configuración inicial
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPosition = 30

      // Función para verificar si necesitamos nueva página
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 30) {
          doc.addPage()
          yPosition = 30
          return true
        }
        return false
      }

      // Función para agregar texto con salto de línea automático
      const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize?: number) => {
        if (fontSize) doc.setFontSize(fontSize)

        if (maxWidth) {
          const lines = doc.splitTextToSize(text, maxWidth)
          doc.text(lines, x, y)
          return y + lines.length * (fontSize ? fontSize * 0.4 : 6)
        } else {
          doc.text(text, x, y)
          return y + (fontSize ? fontSize * 0.4 : 6)
        }
      }

      // Función para agregar checkbox visual
      const addCheckbox = (x: number, y: number, checked: boolean, label: string) => {
        // Dibujar checkbox
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.5)
        doc.rect(x, y - 3, 4, 4)

        if (checked) {
          doc.setFontSize(8)
          doc.text("✓", x + 1, y)
        }

        // Agregar label
        doc.setFontSize(10)
        doc.text(label, x + 6, y)
        return y + 6
      }

      // Función para cargar y procesar imagen
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
      }

      // Función para agregar imagen de firma
      const addSignatureImage = async (signatureData: string, x: number, y: number, width: number, height: number) => {
        try {
          if (signatureData && signatureData.startsWith("data:image")) {
            const img = await loadImage(signatureData)
            doc.addImage(signatureData, "PNG", x, y, width, height)
            return true
          }
          return false
        } catch (error) {
          console.warn("Error al cargar firma:", error)
          doc.setDrawColor(200, 200, 200)
          doc.rect(x, y, width, height)
          doc.setFontSize(8)
          doc.text("Firma Digital", x + 5, y + height / 2)
          return false
        }
      }

      // ENCABEZADO
      doc.setFillColor(59, 130, 246)
      doc.rect(0, 0, pageWidth, 25, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("SOLICITUD DE ACCESOS", pageWidth / 2, 15, { align: "center" })

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      yPosition = addText(`Código: TH-RS-P-F-09 | Solicitud: ${request.id}`, margin, yPosition, undefined, 12)
      yPosition += 5

      // Línea separadora
      doc.setDrawColor(59, 130, 246)
      doc.setLineWidth(1)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 15

      // DATOS GENERALES
      checkNewPage(80)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      yPosition = addText("DATOS GENERALES", margin, yPosition, undefined, 14)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      // Información básica en dos columnas
      const leftColumn = margin
      const rightColumn = pageWidth / 2 + 10

      let leftY = yPosition
      let rightY = yPosition

      leftY = addText(
        `Nombre Completo: ${request.nombreCompleto || request.solicitanteName}`,
        leftColumn,
        leftY,
        contentWidth / 2 - 10,
        10,
      )
      rightY = addText(`Departamento: ${request.departamento}`, rightColumn, rightY, contentWidth / 2 - 10, 10)

      // Sucursales
      if (request.sucursales && request.sucursales.length > 0) {
        leftY = addText(`Sucursales: ${request.sucursales.join(", ")}`, leftColumn, leftY, contentWidth / 2 - 10, 10)
      }

      // Puestos
      if (request.puestos && request.puestos.length > 0) {
        rightY = addText(`Puestos: ${request.puestos.join(", ")}`, rightColumn, rightY, contentWidth / 2 - 10, 10)
      }

      // Áreas
      if (request.areas && request.areas.length > 0) {
        leftY = addText(`Áreas: ${request.areas.join(", ")}`, leftColumn, leftY, contentWidth / 2 - 10, 10)
      }

      // Modalidad y tipo
      if (request.modalidadContratacion) {
        rightY = addText(
          `Modalidad: ${request.modalidadContratacion.toUpperCase()}`,
          rightColumn,
          rightY,
          contentWidth / 2 - 10,
          10,
        )
      }

      if (request.tipoUsuario) {
        leftY = addText(
          `Tipo Usuario: ${request.tipoUsuario.toUpperCase()}`,
          leftColumn,
          leftY,
          contentWidth / 2 - 10,
          10,
        )
      }

      if (request.sustitucionDe) {
        rightY = addText(`Sustitución de: ${request.sustitucionDe}`, rightColumn, rightY, contentWidth / 2 - 10, 10)
      }

      yPosition = Math.max(leftY, rightY) + 15

      // APLICACIONES - SAP
      checkNewPage(60)
      doc.setFont("helvetica", "bold")
      yPosition = addText("APLICACIONES - SAP", margin, yPosition, undefined, 12)
      yPosition += 8

      doc.setFont("helvetica", "normal")

      leftY = yPosition
      rightY = yPosition

      // Checkboxes SAP
      leftY = addCheckbox(leftColumn, leftY, request.usuarioSAP || false, "Usuario SAP")
      leftY = addCheckbox(leftColumn, leftY, request.accesoSAPTodas || false, "Acceso SAP: Todas")
      leftY = addCheckbox(leftColumn, leftY, request.encargadoBodega || false, "Encargado de bodega")

      if (request.codigoSAP) {
        leftY = addText(`Código SAP: ${request.codigoSAP}`, leftColumn, leftY, contentWidth / 2 - 10, 10)
      }

      if (request.numeroBodega) {
        leftY = addText(`Número de bodega: ${request.numeroBodega}`, leftColumn, leftY, contentWidth / 2 - 10, 10)
      }

      // Observaciones SAP
      if (request.observaciones?.sap) {
        rightY = addText("Observaciones SAP:", rightColumn, rightY, undefined, 10)
        rightY = addText(request.observaciones.sap, rightColumn, rightY, contentWidth / 2 - 10, 9) + 5
      }

      yPosition = Math.max(leftY, rightY) + 10

      // ACCESOS A SISTEMAS
      checkNewPage(100)
      doc.setFont("helvetica", "bold")
      yPosition = addText("ACCESOS A SISTEMAS", margin, yPosition, undefined, 12)
      yPosition += 8

      doc.setFont("helvetica", "normal")

      // HIS
      yPosition = addText("HIS:", margin, yPosition, undefined, 11)
      yPosition = addCheckbox(margin + 5, yPosition, request.accesoHIS || false, "Acceso a HIS")
      if (request.numeroCaja) {
        yPosition = addText(`# de caja: ${request.numeroCaja}`, margin + 5, yPosition, undefined, 10)
      }
      if (request.observaciones?.his) {
        yPosition =
          addText(`Observaciones: ${request.observaciones.his}`, margin + 5, yPosition, contentWidth - 10, 9) + 5
      }

      // E-COMMERCE
      yPosition = addText("E-COMMERCE:", margin, yPosition, undefined, 11)
      yPosition = addCheckbox(margin + 5, yPosition, request.accesoEcommerce || false, "Acceso a E-commerce")
      if (request.observaciones?.ecommerce) {
        yPosition =
          addText(`Observaciones: ${request.observaciones.ecommerce}`, margin + 5, yPosition, contentWidth - 10, 9) + 5
      }

      // HTIS
      yPosition = addText("HTIS:", margin, yPosition, undefined, 11)
      yPosition = addCheckbox(margin + 5, yPosition, request.accesoHTIS || false, "Accesos a HTIS")
      if (request.observaciones?.htis) {
        yPosition =
          addText(`Observaciones: ${request.observaciones.htis}`, margin + 5, yPosition, contentWidth - 10, 9) + 5
      }

      // GESTOR DOCUMENTAL
      yPosition = addText("GESTOR DOCUMENTAL:", margin, yPosition, undefined, 11)
      yPosition = addCheckbox(margin + 5, yPosition, request.accesoGestor || false, "Accesos a Gestor")
      if (request.observaciones?.gestor) {
        yPosition =
          addText(`Observaciones: ${request.observaciones.gestor}`, margin + 5, yPosition, contentWidth - 10, 9) + 5
      }

      // VMA (VENTAS)
      yPosition = addText("VMA (VENTAS):", margin, yPosition, undefined, 11)
      yPosition = addCheckbox(margin + 5, yPosition, request.accesoVMA || false, "Acceso a VMA")
      if (request.observaciones?.vma) {
        yPosition =
          addText(`Observaciones: ${request.observaciones.vma}`, margin + 5, yPosition, contentWidth - 10, 9) + 5
      }

      // GTI / Apps / Redes
      checkNewPage(80)
      doc.setFont("helvetica", "bold")
      yPosition = addText("GTI / Apps / Redes", margin, yPosition, undefined, 12)
      yPosition += 8

      doc.setFont("helvetica", "normal")
      yPosition = addText("RED:", margin, yPosition, undefined, 11)

      yPosition = addCheckbox(margin + 5, yPosition, request.usoExtension || false, "Uso de extensión")
      yPosition = addCheckbox(margin + 5, yPosition, request.correoElectronico || false, "Correo electrónico")
      yPosition = addCheckbox(margin + 5, yPosition, request.internet || false, "Internet")
      yPosition = addCheckbox(margin + 5, yPosition, request.redesSociales || false, "Redes sociales")
      yPosition = addCheckbox(margin + 5, yPosition, request.youtube || false, "YouTube")

      if (request.paginasWeb) {
        yPosition = addText(`Páginas web: ${request.paginasWeb}`, margin + 5, yPosition, contentWidth - 10, 10)
      }

      if (request.observaciones?.red) {
        yPosition =
          addText(`Observaciones Red: ${request.observaciones.red}`, margin + 5, yPosition, contentWidth - 10, 9) + 5
      }

      // JUSTIFICACIÓN Y DETALLES
      checkNewPage(40)
      doc.setFont("helvetica", "bold")
      yPosition = addText("JUSTIFICACIÓN:", margin, yPosition, undefined, 12)
      doc.setFont("helvetica", "normal")
      yPosition = addText(request.justificacion, margin, yPosition, contentWidth, 10) + 8

      if (request.detalles) {
        checkNewPage(30)
        doc.setFont("helvetica", "bold")
        yPosition = addText("DETALLES ADICIONALES:", margin, yPosition, undefined, 12)
        doc.setFont("helvetica", "normal")
        yPosition = addText(request.detalles, margin, yPosition, contentWidth, 10) + 8
      }

      if (request.observaciones?.general) {
        checkNewPage(30)
        doc.setFont("helvetica", "bold")
        yPosition = addText("OBSERVACIONES GENERALES:", margin, yPosition, undefined, 12)
        doc.setFont("helvetica", "normal")
        yPosition = addText(request.observaciones.general, margin, yPosition, contentWidth, 10) + 8
      }

      // INFORMACIÓN DEL PROCESO
      checkNewPage(40)
      doc.setFont("helvetica", "bold")
      yPosition = addText("INFORMACIÓN DEL PROCESO", margin, yPosition, undefined, 12)
      yPosition += 8

      doc.setFont("helvetica", "normal")
      leftY = yPosition
      rightY = yPosition

      leftY = addText(`Prioridad: ${request.prioridad?.toUpperCase()}`, leftColumn, leftY, contentWidth / 2 - 10, 10)
      rightY = addText(
        `Estado: ${getStatusDisplayName(request.estado)}`,
        rightColumn,
        rightY,
        contentWidth / 2 - 10,
        10,
      )

      leftY = addText(`Fecha Creación: ${request.fechaCreacion}`, leftColumn, leftY, contentWidth / 2 - 10, 10)
      rightY = addText(`Fecha Requerida: ${request.fechaRequerida}`, rightColumn, rightY, contentWidth / 2 - 10, 10)

      yPosition = Math.max(leftY, rightY) + 15

      // FIRMAS Y APROBACIONES
      checkNewPage(50)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      yPosition = addText("FIRMAS Y APROBACIONES", margin, yPosition, undefined, 14)
      yPosition += 10

      // Configuración para firmas
      const signatureWidth = 50
      const signatureHeight = 25
      const signatureSpacing = 15

      // Array de firmas para procesar
      const signatures = [
        {
          key: "solicitante",
          title: "Solicitante/Responsable Accesos",
          signature: request.firmas.solicitante,
          approval: { fecha: request.fechaCreacion, usuario: request.solicitanteName },
        },
        {
          key: "talentoHumano",
          title: "Gestión del Talento Humano",
          signature: request.firmas.talentoHumano,
          approval: request.aprobaciones.talentoHumano,
        },
        {
          key: "gerenciaTH",
          title: "Gerencia de Gestión del Talento Humano",
          signature: request.firmas.gerenciaTH,
          approval: request.aprobaciones.gerenciaTH,
        },
        {
          key: "tecnologia",
          title: "Tecnología de la Información",
          signature: request.firmas.tecnologia,
          approval: request.aprobaciones.tecnologia,
        },
        {
          key: "gerenciaTI",
          title: "Gerencia de Tecnología de la Información",
          signature: request.firmas.gerenciaTI,
          approval: request.aprobaciones.gerenciaTI,
        },
      ]

      // Procesar cada firma
      for (const sig of signatures) {
        if (sig.signature && sig.approval) {
          checkNewPage(signatureHeight + signatureSpacing + 10)

          // Título del rol
          doc.setFontSize(11)
          doc.setFont("helvetica", "bold")
          yPosition = addText(`${sig.title}:`, margin, yPosition, undefined, 11)

          // Dibujar borde para la firma
          doc.setDrawColor(200, 200, 200)
          doc.setLineWidth(0.5)
          doc.rect(margin, yPosition, signatureWidth, signatureHeight)

          // Agregar la firma
          try {
            await addSignatureImage(sig.signature, margin, yPosition, signatureWidth, signatureHeight)
          } catch (error) {
            console.warn(`Error al agregar firma de ${sig.key}:`, error)
          }

          // Información de la aprobación
          doc.setFont("helvetica", "normal")
          doc.setFontSize(10)
          const infoX = margin + signatureWidth + 10
          let infoY = yPosition + 5

          infoY = addText(`Fecha: ${sig.approval.fecha}`, infoX, infoY, undefined, 10)
          infoY = addText(`Firmado por: ${sig.approval.usuario}`, infoX, infoY, undefined, 10)

          if (sig.approval.comentarios) {
            infoY = addText(
              `Comentarios: ${sig.approval.comentarios}`,
              infoX,
              infoY,
              contentWidth - signatureWidth - 20,
              10,
            )
          }

          yPosition += signatureHeight + signatureSpacing
        }
      }

      // USO EXCLUSIVO DE LA GERENCIA DE TECNOLOGÍA DE LA INFORMACIÓN
      if (request.credenciales) {
        checkNewPage(60)
        doc.setFont("helvetica", "bold")
        yPosition = addText(
          "USO EXCLUSIVO DE LA GERENCIA DE TECNOLOGÍA DE LA INFORMACIÓN",
          margin,
          yPosition,
          undefined,
          12,
        )
        yPosition += 10

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)

        if (request.credenciales.usuarioRED) {
          yPosition = addText(
            `Usuario RED Asignado: ${request.credenciales.usuarioRED}`,
            margin,
            yPosition,
            undefined,
            10,
          )
        }
        if (request.credenciales.usuarioAPP) {
          yPosition = addText(
            `Usuario APP asignado: ${request.credenciales.usuarioAPP}`,
            margin,
            yPosition,
            undefined,
            10,
          )
        }
        if (request.credenciales.email) {
          yPosition = addText(`Email: ${request.credenciales.email}`, margin, yPosition, undefined, 10)
        }
        if (request.credenciales.usuario) {
          yPosition = addText(`Usuario: ${request.credenciales.usuario}`, margin, yPosition, undefined, 10)
        }
        yPosition = addText(`Fecha de Envío: ${request.credenciales.fechaEnvio}`, margin, yPosition, undefined, 10)
      }

      // NOTAS IMPORTANTES
      checkNewPage(50)
      doc.setFont("helvetica", "bold")
      yPosition = addText("NOTAS IMPORTANTES:", margin, yPosition, undefined, 11)
      yPosition += 5

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)

      const notas = [
        "1. Para procesar la solicitud es necesario que los datos generales estén completos y tenga las firmas correspondientes.",
        "2. Para inactivación únicamente complete el código y nombre completo.",
        "3. Este formulario debe ser autorizado por el jefe del área.",
        "4. Para acceso a Internet debe tener la autorización de la Gerencia del área y llenar el formulario autorizado por la Gerencia de Tecnología de la Información.",
        "5. Tiempo estimado de creación de usuarios 24 horas. Una vez el formulario este llenado correctamente.",
      ]

      notas.forEach((nota) => {
        yPosition = addText(nota, margin, yPosition, contentWidth, 9) + 3
      })

      // PIE DE PÁGINA en todas las páginas
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        const currentDate = new Date()
        const footerText = `Documento generado el ${currentDate.toLocaleDateString()} a las ${currentDate.toLocaleTimeString()} - Página ${i} de ${totalPages}`
        doc.setFontSize(8)
        doc.setFont("helvetica", "italic")
        doc.setTextColor(128, 128, 128)
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" })
      }

      // Guardar el PDF
      doc.save(`Solicitud_${request.id}.pdf`)
    } catch (error) {
      console.error("Error al generar PDF:", error)
      alert("Error al generar el PDF. Por favor, intenta nuevamente.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Detalles de Solicitud - {request.id}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getStatusColor(request.estado)}>{getStatusDisplayName(request.estado)}</Badge>
                <Badge className={getPriorityColor(request.prioridad)}>{request.prioridad.toUpperCase()}</Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={generatePDF}>
                <Download className="h-4 w-4 mr-1" />
                Descargar PDF
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información básica */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Solicitante</Label>
              <p className="font-medium">{request.solicitanteName}</p>
            </div>
            <div>
              <Label>Nombre Completo</Label>
              <p className="font-medium">{request.nombreCompleto || request.solicitanteName}</p>
            </div>
            <div>
              <Label>Departamento</Label>
              <p className="font-medium">{request.departamento}</p>
            </div>
            <div>
              <Label>Modalidad de Contratación</Label>
              <p className="font-medium">{request.modalidadContratacion?.toUpperCase() || "N/A"}</p>
            </div>
            <div>
              <Label>Tipo de Usuario</Label>
              <p className="font-medium">{request.tipoUsuario?.toUpperCase() || "N/A"}</p>
            </div>
            <div>
              <Label>Fecha de Creación</Label>
              <p className="font-medium">{request.fechaCreacion}</p>
            </div>
            <div>
              <Label>Fecha Requerida</Label>
              <p className="font-medium">{request.fechaRequerida}</p>
            </div>
            <div>
              <Label>Prioridad</Label>
              <Badge className={getPriorityColor(request.prioridad)}>{request.prioridad?.toUpperCase()}</Badge>
            </div>
          </div>

          {/* Sucursales, Puestos y Áreas */}
          {(request.sucursales?.length > 0 || request.puestos?.length > 0 || request.areas?.length > 0) && (
            <div className="grid md:grid-cols-3 gap-4">
              {request.sucursales?.length > 0 && (
                <div>
                  <Label>Sucursales</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.sucursales.map((sucursal, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sucursal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {request.puestos?.length > 0 && (
                <div>
                  <Label>Puestos</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.puestos.map((puesto, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {puesto}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {request.areas?.length > 0 && (
                <div>
                  <Label>Áreas</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accesos SAP */}
          {(request.usuarioSAP ||
            request.accesoSAPTodas ||
            request.encargadoBodega ||
            request.codigoSAP ||
            request.numeroBodega) && (
            <div>
              <Label className="text-lg">Accesos SAP</Label>
              <div className="grid md:grid-cols-2 gap-4 mt-2 p-3 bg-blue-50 rounded">
                {request.usuarioSAP && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Usuario SAP</span>
                  </div>
                )}
                {request.accesoSAPTodas && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Acceso SAP: Todas</span>
                  </div>
                )}
                {request.encargadoBodega && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Encargado de bodega</span>
                  </div>
                )}
                {request.codigoSAP && (
                  <div>
                    <span className="text-sm font-medium">Código SAP: </span>
                    <span className="text-sm">{request.codigoSAP}</span>
                  </div>
                )}
                {request.numeroBodega && (
                  <div>
                    <span className="text-sm font-medium">Número de bodega: </span>
                    <span className="text-sm">{request.numeroBodega}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accesos a Sistemas */}
          {(request.accesoHIS ||
            request.accesoEcommerce ||
            request.accesoHTIS ||
            request.accesoGestor ||
            request.accesoVMA) && (
            <div>
              <Label className="text-lg">Accesos a Sistemas</Label>
              <div className="grid md:grid-cols-2 gap-4 mt-2 p-3 bg-green-50 rounded">
                {request.accesoHIS && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm font-medium">HIS</span>
                    </div>
                    {request.numeroCaja && (
                      <p className="text-xs text-gray-600 ml-6"># de caja: {request.numeroCaja}</p>
                    )}
                  </div>
                )}
                {request.accesoEcommerce && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">E-commerce</span>
                  </div>
                )}
                {request.accesoHTIS && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">HTIS</span>
                  </div>
                )}
                {request.accesoGestor && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Gestor Documental</span>
                  </div>
                )}
                {request.accesoVMA && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">VMA (Ventas)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GTI / Apps / Redes */}
          {(request.usoExtension ||
            request.correoElectronico ||
            request.internet ||
            request.redesSociales ||
            request.youtube ||
            request.paginasWeb) && (
            <div>
              <Label className="text-lg">GTI / Apps / Redes</Label>
              <div className="grid md:grid-cols-2 gap-4 mt-2 p-3 bg-purple-50 rounded">
                {request.usoExtension && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Uso de extensión</span>
                  </div>
                )}
                {request.correoElectronico && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Correo electrónico</span>
                  </div>
                )}
                {request.internet && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Internet</span>
                  </div>
                )}
                {request.redesSociales && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Redes sociales</span>
                  </div>
                )}
                {request.youtube && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">YouTube</span>
                  </div>
                )}
                {request.paginasWeb && (
                  <div className="col-span-2">
                    <span className="text-sm font-medium">Páginas web: </span>
                    <span className="text-sm">{request.paginasWeb}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observaciones por sección */}
          {request.observaciones && Object.values(request.observaciones).some((obs) => obs) && (
            <div>
              <Label className="text-lg">Observaciones</Label>
              <div className="space-y-2 mt-2">
                {request.observaciones.sap && (
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">SAP: </span>
                    <span className="text-sm">{request.observaciones.sap}</span>
                  </div>
                )}
                {request.observaciones.his && (
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">HIS: </span>
                    <span className="text-sm">{request.observaciones.his}</span>
                  </div>
                )}
                {request.observaciones.ecommerce && (
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">E-commerce: </span>
                    <span className="text-sm">{request.observaciones.ecommerce}</span>
                  </div>
                )}
                {request.observaciones.htis && (
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">HTIS: </span>
                    <span className="text-sm">{request.observaciones.htis}</span>
                  </div>
                )}
                {request.observaciones.gestor && (
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Gestor: </span>
                    <span className="text-sm">{request.observaciones.gestor}</span>
                  </div>
                )}
                {request.observaciones.vma && (
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">VMA: </span>
                    <span className="text-sm">{request.observaciones.vma}</span>
                  </div>
                )}
                {request.observaciones.red && (
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Red: </span>
                    <span className="text-sm">{request.observaciones.red}</span>
                  </div>
                )}
                {request.observaciones.general && (
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">General: </span>
                    <span className="text-sm">{request.observaciones.general}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Firmas */}
          <div>
            <Label className="text-lg">Firmas Digitales</Label>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {request.firmas.solicitante && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Solicitante</h4>
                  <img
                    src={request.firmas.solicitante || "/placeholder.svg"}
                    alt="Firma Solicitante"
                    className="max-h-16 border rounded mb-2"
                  />
                  <p className="text-xs text-gray-600">Fecha: {request.fechaCreacion}</p>
                </div>
              )}

              {request.firmas.talentoHumano && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Talento Humano</h4>
                  <img
                    src={request.firmas.talentoHumano || "/placeholder.svg"}
                    alt="Firma TH"
                    className="max-h-16 border rounded mb-2"
                  />
                  <p className="text-xs text-gray-600">Fecha: {request.aprobaciones.talentoHumano?.fecha}</p>
                  <p className="text-xs text-gray-600">Por: {request.aprobaciones.talentoHumano?.usuario}</p>
                </div>
              )}

              {request.firmas.gerenciaTH && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Gerencia TH</h4>
                  <img
                    src={request.firmas.gerenciaTH || "/placeholder.svg"}
                    alt="Firma Gerencia TH"
                    className="max-h-16 border rounded mb-2"
                  />
                  <p className="text-xs text-gray-600">Fecha: {request.aprobaciones.gerenciaTH?.fecha}</p>
                  <p className="text-xs text-gray-600">Por: {request.aprobaciones.gerenciaTH?.usuario}</p>
                </div>
              )}

              {request.firmas.tecnologia && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Tecnología TI</h4>
                  <img
                    src={request.firmas.tecnologia || "/placeholder.svg"}
                    alt="Firma TI"
                    className="max-h-16 border rounded mb-2"
                  />
                  <p className="text-xs text-gray-600">Fecha: {request.aprobaciones.tecnologia?.fecha}</p>
                  <p className="text-xs text-gray-600">Por: {request.aprobaciones.tecnologia?.usuario}</p>
                </div>
              )}

              {request.firmas.gerenciaTI && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Gerencia TI</h4>
                  <img
                    src={request.firmas.gerenciaTI || "/placeholder.svg"}
                    alt="Firma Gerencia TI"
                    className="max-h-16 border rounded mb-2"
                  />
                  <p className="text-xs text-gray-600">Fecha: {request.aprobaciones.gerenciaTI?.fecha}</p>
                  <p className="text-xs text-gray-600">Por: {request.aprobaciones.gerenciaTI?.usuario}</p>
                </div>
              )}
            </div>
          </div>

          {/* Historial de aprobaciones */}
          <div>
            <Label className="text-lg">Historial de Aprobaciones</Label>
            <div className="space-y-2 mt-4">
              {Object.entries(request.aprobaciones).map(([role, approval]) => (
                <div
                  key={role}
                  className="flex justify-between items-center p-3 bg-green-50 rounded border-l-4 border-green-500"
                >
                  <div>
                    <span className="font-medium">{getRoleDisplayName(role)}</span>
                    <p className="text-sm text-gray-600">{approval.usuario}</p>
                    {approval.comentarios && <p className="text-sm text-gray-600 italic">"{approval.comentarios}"</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{approval.fecha}</p>
                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credenciales */}
          {request.credenciales && (
            <div>
              <Label className="text-lg">Credenciales Creadas</Label>
              <div className="p-4 bg-blue-50 rounded-lg mt-2">
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Email:</span> {request.credenciales.email}
                  </div>
                  <div>
                    <span className="font-medium">Usuario:</span> {request.credenciales.usuario}
                  </div>
                  <div>
                    <span className="font-medium">Fecha de Envío:</span> {request.credenciales.fechaEnvio}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          {canApprove && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="destructive" onClick={onReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
              <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar y Firmar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
