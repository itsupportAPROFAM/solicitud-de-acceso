"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SignaturePad } from "@/components/signature-pad"
import { CheckCircle, X } from "lucide-react"
import type { AccessRequest, User } from "@/lib/storage"

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: (signature: string, comments?: string) => void
  request: AccessRequest
  user: User
}

export function SignatureModal({ isOpen, onClose, onApprove, request, user }: SignatureModalProps) {
  const [signature, setSignature] = useState(user.signature || "")
  const [comments, setComments] = useState("")
  const [useExistingSignature, setUseExistingSignature] = useState(!!user.signature)

  if (!isOpen) return null

  const handleApprove = () => {
    if (!signature) {
      alert("Debes proporcionar una firma para aprobar la solicitud")
      return
    }
    onApprove(signature, comments)
    onClose()
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      "talento-humano": "Talento Humano",
      "gerencia-th": "Gerencia de Talento Humano",
      tecnologia: "Tecnología de la Información",
      "gerencia-ti": "Gerencia de Tecnología de la Información",
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Aprobar y Firmar Solicitud</CardTitle>
              <CardDescription>
                {request.id} - {getRoleDisplayName(user.role)}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumen de la solicitud */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Resumen de la Solicitud</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Solicitante:</span> {request.solicitanteName}
              </div>
              <div>
                <span className="font-medium">Tipo:</span> {request.tipo}
              </div>
              <div>
                <span className="font-medium">Prioridad:</span> {request.prioridad}
              </div>
              <div>
                <span className="font-medium">Fecha requerida:</span> {request.fechaRequerida}
              </div>
            </div>
            <div className="mt-2">
              <span className="font-medium">Justificación:</span>
              <p className="text-sm mt-1">{request.justificacion}</p>
            </div>
          </div>

          {/* Comentarios */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comentarios (Opcional)</Label>
            <Textarea
              id="comments"
              placeholder="Agrega comentarios sobre tu aprobación..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          {/* Opciones de firma */}
          <div className="space-y-4">
            <Label>Firma Digital</Label>

            {user.signature && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="existing-signature"
                    name="signature-option"
                    checked={useExistingSignature}
                    onChange={() => {
                      setUseExistingSignature(true)
                      setSignature(user.signature || "")
                    }}
                  />
                  <Label htmlFor="existing-signature">Usar mi firma guardada</Label>
                </div>
                {useExistingSignature && (
                  <div className="p-2 border rounded">
                    <img src={user.signature || "/placeholder.svg"} alt="Firma guardada" className="max-h-20 border" />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-signature"
                  name="signature-option"
                  checked={!useExistingSignature}
                  onChange={() => setUseExistingSignature(false)}
                />
                <Label htmlFor="new-signature">Crear nueva firma</Label>
              </div>
              {!useExistingSignature && <SignaturePad onSignatureChange={setSignature} width={400} height={150} />}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprobar y Firmar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
