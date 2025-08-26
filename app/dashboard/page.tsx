"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, FileText, Plus, User, LogOut, Eye, CheckCircle, XCircle, History, Filter } from "lucide-react"
import {
  getCurrentUser,
  logout,
  getRequestsByRole,
  getRequestsByStatus,
  getRequestStats,
  updateRequest,
  type User as UserType,
  type AccessRequest,
  updateUser,
} from "@/lib/storage"
import Link from "next/link"

// Agregar estos imports al inicio del archivo:
import { SignatureModal } from "@/components/signature-modal"
import { RequestDetailModal } from "@/components/request-detail-modal"

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

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  // Agregar estos estados después de los estados existentes:
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<AccessRequest | null>(null)
  // Agregar después de los estados existentes:
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [stats, setStats] = useState<any>(null)
  const router = useRouter()

  // Modificar el useEffect para cargar estadísticas:
  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    loadRequests(currentUser)
    loadStats(currentUser)
  }, [router])

  // Agregar función para cargar estadísticas:
  const loadStats = (currentUser: UserType) => {
    const userStats = getRequestStats(currentUser.role, currentUser.id)
    setStats(userStats)
  }

  // Modificar la función loadRequests:
  const loadRequests = (currentUser: UserType) => {
    let userRequests
    if (filterStatus === "all") {
      userRequests = getRequestsByRole(currentUser.role, currentUser.id)
    } else {
      userRequests = getRequestsByStatus(currentUser.role, filterStatus, currentUser.id)
    }
    setRequests(userRequests)
  }

  // Agregar función para manejar cambio de filtro:
  const handleFilterChange = (status: string) => {
    setFilterStatus(status)
    if (user) {
      let userRequests
      if (status === "all") {
        userRequests = getRequestsByRole(user.role, user.id)
      } else {
        userRequests = getRequestsByStatus(user.role, status, user.id)
      }
      setRequests(userRequests)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Reemplazar la función handleApproveRequest:
  const handleApproveRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId)
    if (!request) return

    setSelectedRequestForAction(request)
    setShowSignatureModal(true)
  }

  // Agregar esta nueva función:
  const handleSignatureApproval = (signature: string, comments?: string) => {
    if (!user || !selectedRequestForAction) return

    const request = selectedRequestForAction
    const now = new Date().toISOString().split("T")[0]
    let updates: Partial<AccessRequest> = {}

    switch (user.role) {
      case "talento-humano":
        if (request.estado === "pendiente-th") {
          updates = {
            estado: "pendiente-gerencia-th",
            firmas: { ...request.firmas, talentoHumano: signature },
            aprobaciones: {
              ...request.aprobaciones,
              talentoHumano: { fecha: now, usuario: user.name, comentarios: comments },
            },
          }
        }
        break
      case "gerencia-th":
        if (request.estado === "pendiente-gerencia-th") {
          updates = {
            estado: "pendiente-ti",
            firmas: { ...request.firmas, gerenciaTH: signature },
            aprobaciones: {
              ...request.aprobaciones,
              gerenciaTH: { fecha: now, usuario: user.name, comentarios: comments },
            },
          }
        }
        break
      case "tecnologia":
        if (request.estado === "pendiente-ti") {
          updates = {
            estado: "pendiente-gerencia-ti",
            firmas: { ...request.firmas, tecnologia: signature },
            aprobaciones: {
              ...request.aprobaciones,
              tecnologia: { fecha: now, usuario: user.name, comentarios: comments },
            },
          }
        }
        break
      case "gerencia-ti":
        if (request.estado === "pendiente-gerencia-ti") {
          updates = {
            estado: "implementacion",
            firmas: { ...request.firmas, gerenciaTI: signature },
            aprobaciones: {
              ...request.aprobaciones,
              gerenciaTI: { fecha: now, usuario: user.name, comentarios: comments },
            },
          }
        }
        break
    }

    if (Object.keys(updates).length > 0) {
      updateRequest(request.id, updates)
      loadRequests(user)
      loadStats(user) // Recargar estadísticas

      // Actualizar la firma del usuario si es nueva
      if (signature !== user.signature) {
        updateUser({ ...user, signature })
        setUser({ ...user, signature })
      }

      alert("Solicitud aprobada y firmada correctamente")
    }

    setSelectedRequestForAction(null)
  }

  const handleRejectRequest = (requestId: string) => {
    updateRequest(requestId, { estado: "rechazado" })
    if (user) {
      loadRequests(user)
      loadStats(user) // Recargar estadísticas
    }
  }

  const handleCompleteImplementation = (requestId: string, credentials: { email: string; usuario: string }) => {
    const updates: Partial<AccessRequest> = {
      estado: "completado",
      credenciales: {
        ...credentials,
        fechaEnvio: new Date().toISOString().split("T")[0],
      },
    }
    updateRequest(requestId, updates)
    if (user) {
      loadRequests(user)
      loadStats(user) // Recargar estadísticas
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  const canApproveRequest = (request: AccessRequest) => {
    if (!user) return false

    switch (user.role) {
      case "talento-humano":
        return request.estado === "pendiente-th"
      case "gerencia-th":
        return request.estado === "pendiente-gerencia-th"
      case "tecnologia":
        return request.estado === "pendiente-ti"
      case "gerencia-ti":
        return request.estado === "pendiente-gerencia-ti"
      default:
        return false
    }
  }
  const canImplement = user.role === "tecnologia"

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                {getRoleDisplayName(user.role)} - {user.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="requests">{user.role === "solicitante" ? "Mis Solicitudes" : "Historial"}</TabsTrigger>
            {user.role === "solicitante" && <TabsTrigger value="new-request">Nueva Solicitud</TabsTrigger>}
            {user.role !== "solicitante" && <TabsTrigger value="pending">Solo Pendientes</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {user.role === "solicitante" ? "Enviadas por ti" : "En tu área"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats?.pendientes || 0}</div>
                  <p className="text-xs text-muted-foreground">Requieren atención</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.aprobadas || 0}</div>
                  <p className="text-xs text-muted-foreground">Por tu área</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.completadas || 0}</div>
                  <p className="text-xs text-muted-foreground">Finalizadas</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Recientes</CardTitle>
                <CardDescription>
                  {user.role === "solicitante" ? "Tus últimas solicitudes" : "Solicitudes que requieren tu atención"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{request.id}</span>
                          <Badge className={getPriorityColor(request.prioridad)}>
                            {request.prioridad.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {request.solicitanteName} - {request.tipo}
                        </p>
                        <p className="text-xs text-gray-500">{request.fechaCreacion}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.estado)}>{getStatusDisplayName(request.estado)}</Badge>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {user.role === "solicitante" ? "Mis Solicitudes" : "Historial de Solicitudes"}
                    </CardTitle>
                    <CardDescription>
                      {user.role === "solicitante"
                        ? "Gestiona todas tus solicitudes de acceso"
                        : "Todas las solicitudes que han pasado por tu área"}
                    </CardDescription>
                  </div>
                  {user.role !== "solicitante" && (
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <Select value={filterStatus} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las solicitudes</SelectItem>
                          {user.role === "talento-humano" && (
                            <SelectItem value="pendiente-th">Pendientes TH</SelectItem>
                          )}
                          {user.role === "gerencia-th" && (
                            <SelectItem value="pendiente-gerencia-th">Pendientes Gerencia TH</SelectItem>
                          )}
                          {user.role === "tecnologia" && (
                            <>
                              <SelectItem value="pendiente-ti">Pendientes TI</SelectItem>
                              <SelectItem value="implementacion">En Implementación</SelectItem>
                            </>
                          )}
                          {user.role === "gerencia-ti" && (
                            <SelectItem value="pendiente-gerencia-ti">Pendientes Gerencia TI</SelectItem>
                          )}
                          <SelectItem value="completado">Completadas</SelectItem>
                          <SelectItem value="rechazado">Rechazadas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{request.id}</span>
                          <Badge className={getPriorityColor(request.prioridad)}>
                            {request.prioridad.toUpperCase()}
                          </Badge>
                          {/* Mostrar si ya fue aprobado por el usuario actual */}
                          {user.role !== "solicitante" && (
                            <>
                              {user.role === "talento-humano" && request.aprobaciones.talentoHumano && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  ✓ Aprobado por ti
                                </Badge>
                              )}
                              {user.role === "gerencia-th" && request.aprobaciones.gerenciaTH && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  ✓ Aprobado por ti
                                </Badge>
                              )}
                              {user.role === "tecnologia" && request.aprobaciones.tecnologia && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  ✓ Aprobado por ti
                                </Badge>
                              )}
                              {user.role === "gerencia-ti" && request.aprobaciones.gerenciaTI && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  ✓ Aprobado por ti
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{request.tipo}</p>
                        <p className="text-xs text-gray-500">Creado: {request.fechaCreacion}</p>
                        {user.role !== "solicitante" && (
                          <p className="text-xs text-gray-500">Solicitante: {request.solicitanteName}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.estado)}>{getStatusDisplayName(request.estado)}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowDetailModal(true)
                          }}
                        >
                          Ver Detalles
                        </Button>
                        {canApproveRequest(request) && (
                          <>
                            <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar y Firmar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleRejectRequest(request.id)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {canImplement && request.estado === "implementacion" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleCompleteImplementation(request.id, {
                                email: `${request.solicitanteName.toLowerCase().replace(" ", ".")}@empresa.com`,
                                usuario: request.solicitanteName.toLowerCase().replace(" ", "."),
                              })
                            }
                          >
                            Completar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay solicitudes para mostrar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === "solicitante" && (
            <TabsContent value="new-request">
              <Card>
                <CardHeader>
                  <CardTitle>Nueva Solicitud</CardTitle>
                  <CardDescription>Crear una nueva solicitud de acceso</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/request/new">
                    <Button className="w-full" size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nueva Solicitud
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {user.role !== "solicitante" && (
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes Pendientes</CardTitle>
                  <CardDescription>Solicitudes que requieren tu atención inmediata</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests
                      .filter((req) => canApproveRequest(req))
                      .map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 border-orange-200 bg-orange-50"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{request.id}</span>
                              <Badge className={getPriorityColor(request.prioridad)}>
                                {request.prioridad.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                ⏳ Requiere Acción
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{request.tipo}</p>
                            <p className="text-xs text-gray-500">Solicitante: {request.solicitanteName}</p>
                            <p className="text-xs text-gray-500">Fecha requerida: {request.fechaRequerida}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(request.estado)}>
                              {getStatusDisplayName(request.estado)}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowDetailModal(true)
                              }}
                            >
                              Ver Detalles
                            </Button>
                            <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar y Firmar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleRejectRequest(request.id)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      ))}
                    {requests.filter((req) => canApproveRequest(req)).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>¡Excelente! No tienes solicitudes pendientes</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Modal de detalles de solicitud */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Detalles de Solicitud - {selectedRequest.id}</CardTitle>
                <Button variant="ghost" className="absolute top-4 right-4 bg-white" onClick={() => setSelectedRequest(null)}>
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Solicitante</Label>
                    <p className="font-medium">{selectedRequest.solicitanteName}</p>
                  </div>
                  <div>
                    <Label>Tipo de Acceso</Label>
                    <p className="font-medium">{selectedRequest.tipo}</p>
                  </div>
                  <div>
                    <Label>Prioridad</Label>
                    <Badge className={getPriorityColor(selectedRequest.prioridad)}>
                      {selectedRequest.prioridad.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Badge className={getStatusColor(selectedRequest.estado)}>
                      {getStatusDisplayName(selectedRequest.estado)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Justificación</Label>
                  <p className="text-sm">{selectedRequest.justificacion}</p>
                </div>

                {selectedRequest.detalles && (
                  <div>
                    <Label>Detalles Adicionales</Label>
                    <p className="text-sm">{selectedRequest.detalles}</p>
                  </div>
                )}

                <div>
                  <Label>Historial de Aprobaciones</Label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(selectedRequest.aprobaciones).map(([role, approval]) => (
                      <div key={role} className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm font-medium">{getRoleDisplayName(role)}</span>
                        <div className="text-right">
                          <p className="text-sm">{approval.usuario}</p>
                          <p className="text-xs text-gray-500">{approval.fecha}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedRequest.credenciales && (
                  <div>
                    <Label>Credenciales Creadas</Label>
                    <div className="p-3 bg-blue-50 rounded mt-2">
                      <p className="text-sm">
                        <strong>Email:</strong> {selectedRequest.credenciales.email}
                      </p>
                      <p className="text-sm">
                        <strong>Usuario:</strong> {selectedRequest.credenciales.usuario}
                      </p>
                      <p className="text-sm">
                        <strong>Enviado:</strong> {selectedRequest.credenciales.fechaEnvio}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {/* Modales */}
        {showSignatureModal && selectedRequestForAction && (
          <SignatureModal
            isOpen={showSignatureModal}
            onClose={() => {
              setShowSignatureModal(false)
              setSelectedRequestForAction(null)
            }}
            onApprove={handleSignatureApproval}
            request={selectedRequestForAction}
            user={user}
          />
        )}

        {showDetailModal && selectedRequest && (
          <RequestDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedRequest(null)
            }}
            request={selectedRequest}
            user={user}
            canApprove={canApproveRequest(selectedRequest)}
            onApprove={() => {
              setShowDetailModal(false)
              handleApproveRequest(selectedRequest.id)
            }}
            onReject={() => {
              setShowDetailModal(false)
              handleRejectRequest(selectedRequest.id)
            }}
          />
        )}
      </div>
    </div>
  )
}
