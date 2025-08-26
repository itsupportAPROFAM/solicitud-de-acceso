"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SignaturePad } from "@/components/signature-pad"
import { DualListBox } from "@/components/dual-list-box"
import { ArrowLeft, Send, Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser, createRequest, SUCURSALES, PUESTOS, AREAS } from "@/lib/storage"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Simulación de API para validar código SAP
const validateSAPCode = async (code: string) => {
  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Datos simulados de empleados
  const employees = {
    EMP001: {
      nombres: "Juan Carlos",
      apellidos: "García López",
      departamento: "Tecnología",
      sucursalAsignada: "Sucursal Central",
      puesto: "Desarrollador Senior",
      area: "Desarrollo de Software",
      tipoContratacion: "nomina",
    },
    EMP002: {
      nombres: "María Elena",
      apellidos: "Rodríguez Martínez",
      departamento: "Recursos Humanos",
      sucursalAsignada: "Sucursal Norte",
      puesto: "Analista de RRHH",
      area: "Gestión Humana",
      tipoContratacion: "honorario",
    },
    EMP003: {
      nombres: "Carlos Alberto",
      apellidos: "Mendoza Silva",
      departamento: "Ventas",
      sucursalAsignada: "Sucursal Sur",
      puesto: "Ejecutivo de Ventas",
      area: "Comercial",
      tipoContratacion: "nomina",
    },
  }

  if (employees[code as keyof typeof employees]) {
    return {
      success: true,
      data: employees[code as keyof typeof employees],
    }
  } else {
    return {
      success: false,
      error: "Código de empleado no encontrado",
    }
  }
}

export default function NewRequestPage() {
  const [user, setUser] = useState<any>(null)
  const [sapCode, setSapCode] = useState("")
  const [sapValidation, setSapValidation] = useState<{
    status: "idle" | "loading" | "success" | "error"
    data?: any
    error?: string
  }>({ status: "idle" })

  const [formData, setFormData] = useState({
    // Información del Empleado (auto-completada)
    codigoEmpleadoSAP: "",
    nombres: "",
    apellidos: "",
    nombreCompleto: "",
    departamento: "",
    sucursalAsignada: "",
    puestoAsignado: "",
    areaAsignada: "",
    modalidadContratacion: "",

    // Accesos Solicitados
    sucursalesAcceso: [] as string[],
    puestosAdicionales: [] as string[],
    areasAdicionales: [] as string[],
    tipoUsuario: "",
    sustitucionDe: "",

    // Accesos SAP
    usuarioSAP: false,
    accesoSAPTodas: false,
    codigoSAP: "",
    encargadoBodega: false,
    numeroBodega: "",

    // Accesos a Sistemas
    accesoHIS: false,
    numeroCaja: "",
    accesoEcommerce: false,
    accesoHTIS: false,
    accesoGestor: false,
    accesoVMA: false,

    // Red y Comunicaciones
    usoExtension: false,
    correoElectronico: false,
    internet: false,
    redesSociales: false,
    youtube: false,
    paginasWeb: "",

    // Información de la Solicitud
    prioridad: "",
    justificacion: "",
    detalles: "",
    fechaRequerida: "",

    // Observaciones
    observacionesSAP: "",
    observacionesHIS: "",
    observacionesEcommerce: "",
    observacionesHTIS: "",
    observacionesGestor: "",
    observacionesVMA: "",
    observacionesRed: "",
    observacionesGeneral: "",
  })

  const [signature, setSignature] = useState("")
  const [useExistingSignature, setUseExistingSignature] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)

    if (currentUser.signature) {
      setSignature(currentUser.signature)
      setUseExistingSignature(true)
    }
  }, [router])

  const handleSAPCodeValidation = async () => {
    if (!sapCode.trim()) return

    setSapValidation({ status: "loading" })

    try {
      //const result = await validateSAPCode(sapCode)

      //if (result.success) {
        setSapValidation({ status: "success", data: "" })

        // Auto-completar formulario
        /*setFormData((prev) => ({
          ...prev,
          codigoEmpleadoSAP: sapCode,
          nombres: result.data.nombres,
          apellidos: result.data.apellidos,
          nombreCompleto: `${result.data.nombres} ${result.data.apellidos}`,
          departamento: result.data.departamento,
          sucursalAsignada: result.data.sucursalAsignada,
          puestoAsignado: result.data.puesto,
          areaAsignada: result.data.area,
          modalidadContratacion: result.data.tipoContratacion,
        }))*/

         setFormData((prev) => ({
          ...prev,
          codigoEmpleadoSAP: "4493",
          nombres: "Kevin Daniel",
          apellidos: "Gonzales Vasquez",
          nombreCompleto: `Kevin Daniel Gonzales Vasquez`,
          departamento: "Tecnologia",
          sucursalAsignada: "Oficiinas Administrativas",
          puestoAsignado: "Analista Programador",
          areaAsignada: "Tecnologia de la Informacion",
          modalidadContratacion: "Nomina",
        }))
      //} else {
       // setSapValidation({ status: "error", error: result.error })
     // }
    } catch (error) {
      setSapValidation({ status: "error", error: "Error al validar el código" })
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (sapValidation.status !== "success") {
      alert("Por favor, valida el código de empleado SAP")
      return
    }

    if (!signature) {
      alert("Por favor, proporciona tu firma digital")
      return
    }

    if (!user) return

    const newRequest = createRequest({
      solicitanteId: user.id,
      solicitanteName: user.name,
      codigoEmpleadoSAP: formData.codigoEmpleadoSAP,
      nombreCompleto: formData.nombreCompleto,
      departamento: formData.departamento,
      sucursales: formData.sucursalesAcceso,
      puestos: formData.puestosAdicionales,
      areas: formData.areasAdicionales,
      modalidadContratacion: formData.modalidadContratacion as any,
      tipoUsuario: formData.tipoUsuario as any,
      sustitucionDe: formData.sustitucionDe,
      usuarioSAP: formData.usuarioSAP,
      accesoSAPTodas: formData.accesoSAPTodas,
      codigoSAP: formData.codigoSAP,
      encargadoBodega: formData.encargadoBodega,
      numeroBodega: formData.numeroBodega,
      accesoHIS: formData.accesoHIS,
      numeroCaja: formData.numeroCaja,
      accesoEcommerce: formData.accesoEcommerce,
      accesoHTIS: formData.accesoHTIS,
      accesoGestor: formData.accesoGestor,
      accesoVMA: formData.accesoVMA,
      usoExtension: formData.usoExtension,
      correoElectronico: formData.correoElectronico,
      internet: formData.internet,
      redesSociales: formData.redesSociales,
      youtube: formData.youtube,
      paginasWeb: formData.paginasWeb,
      tipo: "solicitud-accesos",
      prioridad: formData.prioridad as "alta" | "media" | "baja",
      justificacion: formData.justificacion,
      detalles: formData.detalles,
      fechaRequerida: formData.fechaRequerida,
      estado: "pendiente-th",
      firmas: {
        solicitante: signature,
      },
      aprobaciones: {},
      observaciones: {
        sap: formData.observacionesSAP,
        his: formData.observacionesHIS,
        ecommerce: formData.observacionesEcommerce,
        htis: formData.observacionesHTIS,
        gestor: formData.observacionesGestor,
        vma: formData.observacionesVMA,
        red: formData.observacionesRed,
        general: formData.observacionesGeneral,
      },
    })

    alert(`Solicitud ${newRequest.id} creada exitosamente`)
    router.push("/dashboard")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitud de Accesos</h1>
            <p className="text-gray-600">Código: TH-RS-P-F-09 | Versión: 1</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* VALIDACIÓN DE EMPLEADO */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader className="bg-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Search className="h-5 w-5" />
                Validación de Empleado
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="sap-code">Código de Empleado SAP *</Label>
                    <Input
                      id="sap-code"
                      value={sapCode}
                      onChange={(e) => setSapCode(e.target.value.toUpperCase())}
                      placeholder="Ej: EMP001"
                      className="font-mono"
                      disabled={sapValidation.status === "loading"}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSAPCodeValidation}
                    disabled={!sapCode.trim() || sapValidation.status === "loading"}
                    className="px-6"
                  >
                    {sapValidation.status === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Validar
                  </Button>
                </div>

                {sapValidation.status === "success" && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Empleado encontrado:</strong> {sapValidation.data.nombres} {sapValidation.data.apellidos}
                    </AlertDescription>
                  </Alert>
                )}

                {sapValidation.status === "error" && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{sapValidation.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* INFORMACIÓN DEL EMPLEADO */}
          {sapValidation.status === "success" && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Empleado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Nombres</Label>
                    <Input value={formData.nombres} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellidos</Label>
                    <Input value={formData.apellidos} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Input value={formData.departamento} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Sucursal Asignada</Label>
                    <Input value={formData.sucursalAsignada} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Puesto</Label>
                    <Input value={formData.puestoAsignado} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Área</Label>
                    <Input value={formData.areaAsignada} disabled className="bg-gray-50" />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Tipo de Contratación</Label>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="capitalize font-medium">
                          {formData.modalidadContratacion === "nomina"
                            ? "Nómina"
                            : formData.modalidadContratacion === "honorario"
                              ? "Honorario"
                              : formData.modalidadContratacion === "destajo"
                                ? "Destajo"
                                : formData.modalidadContratacion === "especifico"
                                  ? "Específico"
                                  : formData.modalidadContratacion === "generico"
                                    ? "Genérico"
                                    : formData.modalidadContratacion}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Usuario *</Label>
                      <RadioGroup
                        value={formData.tipoUsuario}
                        onValueChange={(value) => handleInputChange("tipoUsuario", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nuevo" id="nuevo" />
                          <Label htmlFor="nuevo">Nuevo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="modificar" id="modificar" />
                          <Label htmlFor="modificar">Modificar</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="inactivar" id="inactivar" />
                          <Label htmlFor="inactivar">Inactivar</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="sustitucion">Sustitución de</Label>
                    <Input
                      id="sustitucion"
                      value={formData.sustitucionDe}
                      onChange={(e) => handleInputChange("sustitucionDe", e.target.value)}
                      placeholder="Nombre de la persona a sustituir (si aplica)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ACCESOS SOLICITADOS */}
          {sapValidation.status === "success" && (
            <Card>
              <CardHeader>
                <CardTitle>Accesos Solicitados</CardTitle>
                <p className="text-sm text-gray-600">
                  Selecciona las sucursales, puestos y áreas adicionales para los cuales necesitas acceso
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <DualListBox
                  label="Sucursales (Accesos Adicionales)"
                  availableItems={SUCURSALES}
                  selectedItems={formData.sucursalesAcceso}
                  onSelectionChange={(selected) => handleInputChange("sucursalesAcceso", selected)}
                />
                <DualListBox
                  label="Puestos Adicionales"
                  availableItems={PUESTOS}
                  selectedItems={formData.puestosAdicionales}
                  onSelectionChange={(selected) => handleInputChange("puestosAdicionales", selected)}
                />
                <DualListBox
                  label="Áreas Adicionales"
                  availableItems={AREAS}
                  selectedItems={formData.areasAdicionales}
                  onSelectionChange={(selected) => handleInputChange("areasAdicionales", selected)}
                />
              </CardContent>
            </Card>
          )}

          {/* APLICACIONES - SAP */}
          {sapValidation.status === "success" && (
            <Card>
              <CardHeader>
                <CardTitle>Aplicaciones - SAP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="usuario-sap"
                          checked={formData.usuarioSAP}
                          onCheckedChange={(checked) => handleInputChange("usuarioSAP", checked)}
                        />
                        <Label htmlFor="usuario-sap" className="font-medium">
                          Usuario SAP
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="acceso-sap-todas"
                          checked={formData.accesoSAPTodas}
                          onCheckedChange={(checked) => handleInputChange("accesoSAPTodas", checked)}
                        />
                        <Label htmlFor="acceso-sap-todas" className="font-medium">
                          Acceso a SAP: Todas
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="codigo-sap">Código SAP</Label>
                        <Input
                          id="codigo-sap"
                          value={formData.codigoSAP}
                          onChange={(e) => handleInputChange("codigoSAP", e.target.value)}
                          placeholder="Código específico de SAP"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="encargado-bodega"
                          checked={formData.encargadoBodega}
                          onCheckedChange={(checked) => handleInputChange("encargadoBodega", checked)}
                        />
                        <Label htmlFor="encargado-bodega" className="font-medium">
                          Encargado de bodega
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numero-bodega">Número de bodega</Label>
                        <Input
                          id="numero-bodega"
                          value={formData.numeroBodega}
                          onChange={(e) => handleInputChange("numeroBodega", e.target.value)}
                          placeholder="Número de bodega asignada"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observaciones-sap">Observaciones SAP</Label>
                    <Textarea
                      id="observaciones-sap"
                      value={formData.observacionesSAP}
                      onChange={(e) => handleInputChange("observacionesSAP", e.target.value)}
                      rows={10}
                      placeholder="Detalles específicos sobre los accesos SAP requeridos..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ACCESOS A SISTEMAS */}
          {sapValidation.status === "success" && (
            <Card>
              <CardHeader>
                <CardTitle>Accesos a Sistemas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* HIS */}
                <div className="grid lg:grid-cols-2 gap-6 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-blue-700">HIS</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceso-his"
                        checked={formData.accesoHIS}
                        onCheckedChange={(checked) => handleInputChange("accesoHIS", checked)}
                      />
                      <Label htmlFor="acceso-his" className="font-medium">
                        Acceso a HIS
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero-caja"># de caja</Label>
                      <Input
                        id="numero-caja"
                        value={formData.numeroCaja}
                        onChange={(e) => handleInputChange("numeroCaja", e.target.value)}
                        placeholder="Número de caja asignada"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observaciones-his">Observaciones HIS</Label>
                    <Textarea
                      id="observaciones-his"
                      value={formData.observacionesHIS}
                      onChange={(e) => handleInputChange("observacionesHIS", e.target.value)}
                      rows={4}
                      placeholder="Detalles específicos sobre HIS..."
                    />
                  </div>
                </div>

                {/* E-COMMERCE */}
                <div className="grid lg:grid-cols-2 gap-6 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-green-700">E-COMMERCE</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceso-ecommerce"
                        checked={formData.accesoEcommerce}
                        onCheckedChange={(checked) => handleInputChange("accesoEcommerce", checked)}
                      />
                      <Label htmlFor="acceso-ecommerce" className="font-medium">
                        Acceso a E-commerce
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observaciones-ecommerce">Observaciones E-commerce</Label>
                    <Textarea
                      id="observaciones-ecommerce"
                      value={formData.observacionesEcommerce}
                      onChange={(e) => handleInputChange("observacionesEcommerce", e.target.value)}
                      rows={4}
                      placeholder="Detalles específicos sobre E-commerce..."
                    />
                  </div>
                </div>

                {/* HTIS */}
                <div className="grid lg:grid-cols-2 gap-6 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-purple-700">HTIS</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceso-htis"
                        checked={formData.accesoHTIS}
                        onCheckedChange={(checked) => handleInputChange("accesoHTIS", checked)}
                      />
                      <Label htmlFor="acceso-htis" className="font-medium">
                        Accesos a HTIS
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observaciones-htis">Observaciones HTIS</Label>
                    <Textarea
                      id="observaciones-htis"
                      value={formData.observacionesHTIS}
                      onChange={(e) => handleInputChange("observacionesHTIS", e.target.value)}
                      rows={4}
                      placeholder="Detalles específicos sobre HTIS..."
                    />
                  </div>
                </div>

                {/* GESTOR DOCUMENTAL */}
                <div className="grid lg:grid-cols-2 gap-6 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-orange-700">GESTOR DOCUMENTAL</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceso-gestor"
                        checked={formData.accesoGestor}
                        onCheckedChange={(checked) => handleInputChange("accesoGestor", checked)}
                      />
                      <Label htmlFor="acceso-gestor" className="font-medium">
                        Accesos a Gestor
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observaciones-gestor">Observaciones Gestor</Label>
                    <Textarea
                      id="observaciones-gestor"
                      value={formData.observacionesGestor}
                      onChange={(e) => handleInputChange("observacionesGestor", e.target.value)}
                      rows={4}
                      placeholder="Detalles específicos sobre Gestor Documental..."
                    />
                  </div>
                </div>

                {/* VMA (VENTAS) */}
                <div className="grid lg:grid-cols-2 gap-6 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-red-700">VMA (VENTAS)</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceso-vma"
                        checked={formData.accesoVMA}
                        onCheckedChange={(checked) => handleInputChange("accesoVMA", checked)}
                      />
                      <Label htmlFor="acceso-vma" className="font-medium">
                        Acceso a VMA
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observaciones-vma">Observaciones VMA</Label>
                    <Textarea
                      id="observaciones-vma"
                      value={formData.observacionesVMA}
                      onChange={(e) => handleInputChange("observacionesVMA", e.target.value)}
                      rows={4}
                      placeholder="Detalles específicos sobre VMA..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* GTI / Apps / Redes */}
          {sapValidation.status === "success" && (
            <Card>
              <CardHeader>
                <CardTitle>GTI / Apps / Redes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-semibold text-lg text-indigo-700">Accesos de Red</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="uso-extension"
                          checked={formData.usoExtension}
                          onCheckedChange={(checked) => handleInputChange("usoExtension", checked)}
                        />
                        <Label htmlFor="uso-extension" className="font-medium">
                          Uso de extensión
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="correo-electronico"
                          checked={formData.correoElectronico}
                          onCheckedChange={(checked) => handleInputChange("correoElectronico", checked)}
                        />
                        <Label htmlFor="correo-electronico" className="font-medium">
                          Correo electrónico
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="internet"
                          checked={formData.internet}
                          onCheckedChange={(checked) => handleInputChange("internet", checked)}
                        />
                        <Label htmlFor="internet" className="font-medium">
                          Internet
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="redes-sociales"
                          checked={formData.redesSociales}
                          onCheckedChange={(checked) => handleInputChange("redesSociales", checked)}
                        />
                        <Label htmlFor="redes-sociales" className="font-medium">
                          Redes sociales
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="youtube"
                          checked={formData.youtube}
                          onCheckedChange={(checked) => handleInputChange("youtube", checked)}
                        />
                        <Label htmlFor="youtube" className="font-medium">
                          YouTube
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paginas-web">Páginas web específicas</Label>
                        <Input
                          id="paginas-web"
                          value={formData.paginasWeb}
                          onChange={(e) => handleInputChange("paginasWeb", e.target.value)}
                          placeholder="URLs específicas separadas por comas"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observaciones-red">Observaciones Red</Label>
                    <Textarea
                      id="observaciones-red"
                      value={formData.observacionesRed}
                      onChange={(e) => handleInputChange("observacionesRed", e.target.value)}
                      rows={12}
                      placeholder="Detalles específicos sobre accesos de red y comunicaciones..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* INFORMACIÓN DE LA SOLICITUD */}
          {sapValidation.status === "success" && (
            <Card>
              <CardHeader>
                <CardTitle>Información de la Solicitud</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="prioridad">Prioridad *</Label>
                    <Select
                      value={formData.prioridad}
                      onValueChange={(value) => handleInputChange("prioridad", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">🔴 Alta</SelectItem>
                        <SelectItem value="media">🟡 Media</SelectItem>
                        <SelectItem value="baja">🟢 Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha-requerida">Fecha Requerida *</Label>
                    <Input
                      id="fecha-requerida"
                      type="date"
                      value={formData.fechaRequerida}
                      onChange={(e) => handleInputChange("fechaRequerida", e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justificacion">Justificación *</Label>
                  <Textarea
                    id="justificacion"
                    placeholder="Explica detalladamente por qué necesitas estos accesos y cómo contribuirán a tu trabajo..."
                    value={formData.justificacion}
                    onChange={(e) => handleInputChange("justificacion", e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones-general">Observaciones Generales</Label>
                  <Textarea
                    id="observaciones-general"
                    placeholder="Información adicional relevante para procesar la solicitud..."
                    value={formData.observacionesGeneral}
                    onChange={(e) => handleInputChange("observacionesGeneral", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* FIRMA DIGITAL */}
          {sapValidation.status === "success" && (
            <Card>
              <CardHeader>
                <CardTitle>Firma Digital del Solicitante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.signature && (
                  <div className="space-y-4">
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
                      <Label htmlFor="existing-signature" className="font-medium">
                        Usar mi firma guardada
                      </Label>
                    </div>
                    {useExistingSignature && (
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <img
                          src={user.signature || "/placeholder.svg"}
                          alt="Firma guardada"
                          className="max-h-24 border bg-white p-2 rounded"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="new-signature"
                      name="signature-option"
                      checked={!useExistingSignature}
                      onChange={() => setUseExistingSignature(false)}
                    />
                    <Label htmlFor="new-signature" className="font-medium">
                      Crear nueva firma
                    </Label>
                  </div>
                  {!useExistingSignature && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <SignaturePad onSignatureChange={setSignature} width={500} height={200} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* BOTÓN DE ENVÍO */}
          {sapValidation.status === "success" && (
            <div className="flex justify-center pt-8">
              <Button
                type="submit"
                className="w-full md:w-auto px-12 py-3 text-lg"
                size="lg"
                disabled={!signature || !formData.prioridad || !formData.fechaRequerida || !formData.justificacion}
              >
                <Send className="h-5 w-5 mr-2" />
                Enviar Solicitud
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
