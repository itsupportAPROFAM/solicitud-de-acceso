// Sistema de almacenamiento local y datos de ejemplo

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "solicitante" | "talento-humano" | "gerencia-th" | "tecnologia" | "gerencia-ti"
  department: string
  position: string
  phone: string
  signature?: string
}

export interface AccessRequest {
  id: string
  solicitanteId: string
  solicitanteName: string
  codigoEmpleadoSAP: string
  // Datos Generales
  nombreCompleto: string
  departamento: string
  sucursales: string[]
  puestos: string[]
  areas: string[]
  modalidadContratacion: "nomina" | "honorario" | "destajo" | "especifico" | "generico"
  tipoUsuario: "nuevo" | "modificar" | "inactivar"
  sustitucionDe?: string

  // Accesos SAP
  usuarioSAP: boolean
  accesoSAPTodas: boolean
  codigoSAP?: string
  encargadoBodega: boolean
  numeroBodega?: string

  // Accesos a Sistemas
  accesoHIS: boolean
  numeroCaja?: string
  accesoEcommerce: boolean
  accesoHTIS: boolean
  accesoGestor: boolean
  accesoVMA: boolean

  // Red y Comunicaciones
  usoExtension: boolean
  correoElectronico: boolean
  internet: boolean
  redesSociales: boolean
  youtube: boolean
  paginasWeb: string

  // Campos originales mantenidos para compatibilidad
  tipo: string
  prioridad: "alta" | "media" | "baja"
  justificacion: string
  detalles: string
  fechaRequerida: string
  fechaCreacion: string
  estado:
    | "pendiente-th"
    | "pendiente-gerencia-th"
    | "pendiente-ti"
    | "pendiente-gerencia-ti"
    | "implementacion"
    | "completado"
    | "rechazado"
  firmas: {
    solicitante?: string
    talentoHumano?: string
    gerenciaTH?: string
    tecnologia?: string
    gerenciaTI?: string
  }
  aprobaciones: {
    talentoHumano?: { fecha: string; usuario: string; comentarios?: string }
    gerenciaTH?: { fecha: string; usuario: string; comentarios?: string }
    tecnologia?: { fecha: string; usuario: string; comentarios?: string }
    gerenciaTI?: { fecha: string; usuario: string; comentarios?: string }
  }
  credenciales?: {
    email?: string
    usuario?: string
    usuarioRED?: string
    usuarioAPP?: string
    fechaEnvio?: string
  }
  observaciones: {
    sap?: string
    his?: string
    ecommerce?: string
    htis?: string
    gestor?: string
    vma?: string
    red?: string
    general?: string
  }
}

// Datos para los dual list boxes
export const SUCURSALES = [
  "Sucursal Central",
  "Sucursal Norte",
  "Sucursal Sur",
  "Sucursal Este",
  "Sucursal Oeste",
  "Sucursal Centro Comercial",
  "Sucursal Aeropuerto",
  "Sucursal Hospital",
]

export const PUESTOS = [
  "Gerente General",
  "Gerente de Área",
  "Supervisor",
  "Coordinador",
  "Analista",
  "Asistente",
  "Técnico",
  "Operador",
  "Recepcionista",
  "Contador",
  "Auxiliar Contable",
  "Vendedor",
  "Cajero",
  "Bodeguero",
  "Conserje",
]

export const AREAS = [
  "Gerencia General",
  "Gestión del Talento Humano",
  "Tecnología de la Información",
  "Contabilidad y Finanzas",
  "Ventas",
  "Marketing",
  "Operaciones",
  "Logística",
  "Compras",
  "Servicio al Cliente",
  "Calidad",
  "Seguridad",
  "Mantenimiento",
]

// Usuarios predefinidos para testing
const defaultUsers: User[] = [
  {
    id: "1",
    email: "juan.perez@empresa.com",
    password: "123456",
    name: "Juan Pérez",
    role: "solicitante",
    department: "Desarrollo",
    position: "Desarrollador Senior",
    phone: "+1234567890",
  },
  {
    id: "2",
    email: "maria.garcia@empresa.com",
    password: "123456",
    name: "María García",
    role: "talento-humano",
    department: "Recursos Humanos",
    position: "Analista de TH",
    phone: "+1234567891",
  },
  {
    id: "3",
    email: "carlos.lopez@empresa.com",
    password: "123456",
    name: "Carlos López",
    role: "gerencia-th",
    department: "Recursos Humanos",
    position: "Gerente de Talento Humano",
    phone: "+1234567892",
  },
  {
    id: "4",
    email: "ana.martinez@empresa.com",
    password: "123456",
    name: "Ana Martínez",
    role: "tecnologia",
    department: "Tecnología",
    position: "Analista de TI",
    phone: "+1234567893",
  },
  {
    id: "5",
    email: "luis.rodriguez@empresa.com",
    password: "123456",
    name: "Luis Rodríguez",
    role: "gerencia-ti",
    department: "Tecnología",
    position: "Gerente de TI",
    phone: "+1234567894",
  },
]

// Solicitudes de ejemplo actualizadas
const defaultRequests: AccessRequest[] = [
  {
    id: "REQ-001",
    solicitanteId: "1",
    solicitanteName: "Juan Pérez",
    nombreCompleto: "Juan Pérez García",
    codigoEmpleadoSAP: "4493",
    departamento: "Tecnología de la Información",
    sucursales: ["Sucursal Central", "Sucursal Norte"],
    puestos: ["Desarrollador Senior"],
    areas: ["Tecnología de la Información"],
    modalidadContratacion: "nomina",
    tipoUsuario: "nuevo",
    usuarioSAP: true,
    accesoSAPTodas: false,
    encargadoBodega: false,
    accesoHIS: false,
    accesoEcommerce: true,
    accesoHTIS: false,
    accesoGestor: false,
    accesoVMA: false,
    usoExtension: true,
    correoElectronico: true,
    internet: true,
    redesSociales: false,
    youtube: false,
    paginasWeb: "",
    tipo: "acceso-sistemas",
    prioridad: "alta",
    justificacion: "Nuevo empleado requiere accesos para desarrollo",
    detalles: "Acceso completo para desarrollo de aplicaciones",
    fechaRequerida: "2024-01-20",
    fechaCreacion: "2024-01-15",
    estado: "pendiente-th",
    firmas: {
      solicitante:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
    aprobaciones: {},
    observaciones: {
      general: "Usuario nuevo en el departamento de TI",
    },
  },
]

// Funciones de localStorage (mantener las existentes y agregar nuevas)
export const initializeStorage = () => {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(defaultUsers))
  }
  if (!localStorage.getItem("requests")) {
    localStorage.setItem("requests", JSON.stringify(defaultRequests))
  }
}

export const getUsers = (): User[] => {
  const users = localStorage.getItem("users")
  return users ? JSON.parse(users) : defaultUsers
}

export const getUser = (id: string): User | null => {
  const users = getUsers()
  return users.find((user) => user.id === id) || null
}

export const updateUser = (user: User): void => {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index !== -1) {
    users[index] = user
    localStorage.setItem("users", JSON.stringify(users))
  }
}

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers()
  return users.find((user) => user.email === email && user.password === password) || null
}

export const getRequests = (): AccessRequest[] => {
  const requests = localStorage.getItem("requests")
  return requests ? JSON.parse(requests) : defaultRequests
}

export const getRequestsByRole = (userRole: string, userId?: string): AccessRequest[] => {
  const requests = getRequests()

  switch (userRole) {
    case "solicitante":
      return requests.filter((req) => req.solicitanteId === userId)
    case "talento-humano":
      return requests.filter((req) => req.estado === "pendiente-th" || req.aprobaciones.talentoHumano)
    case "gerencia-th":
      return requests.filter((req) => req.estado === "pendiente-gerencia-th" || req.aprobaciones.gerenciaTH)
    case "tecnologia":
      return requests.filter(
        (req) => req.estado === "pendiente-ti" || req.estado === "implementacion" || req.aprobaciones.tecnologia,
      )
    case "gerencia-ti":
      return requests.filter((req) => req.estado === "pendiente-gerencia-ti" || req.aprobaciones.gerenciaTI)
    default:
      return requests
  }
}

export const getRequestsByStatus = (userRole: string, status: string, userId?: string): AccessRequest[] => {
  const allRequests = getRequestsByRole(userRole, userId)
  return allRequests.filter((req) => req.estado === status)
}

export const getRequestStats = (userRole: string, userId?: string) => {
  const requests = getRequestsByRole(userRole, userId)

  return {
    total: requests.length,
    pendientes: requests.filter((req) => {
      switch (userRole) {
        case "talento-humano":
          return req.estado === "pendiente-th"
        case "gerencia-th":
          return req.estado === "pendiente-gerencia-th"
        case "tecnologia":
          return req.estado === "pendiente-ti" || req.estado === "implementacion"
        case "gerencia-ti":
          return req.estado === "pendiente-gerencia-ti"
        default:
          return false
      }
    }).length,
    aprobadas: requests.filter((req) => {
      switch (userRole) {
        case "talento-humano":
          return req.aprobaciones.talentoHumano && req.estado !== "pendiente-th"
        case "gerencia-th":
          return req.aprobaciones.gerenciaTH && req.estado !== "pendiente-gerencia-th"
        case "tecnologia":
          return req.aprobaciones.tecnologia && req.estado !== "pendiente-ti" && req.estado !== "implementacion"
        case "gerencia-ti":
          return req.aprobaciones.gerenciaTI && req.estado !== "pendiente-gerencia-ti"
        default:
          return false
      }
    }).length,
    completadas: requests.filter((req) => req.estado === "completado").length,
    rechazadas: requests.filter((req) => req.estado === "rechazado").length,
  }
}

export const createRequest = (request: Omit<AccessRequest, "id" | "fechaCreacion">): AccessRequest => {
  const requests = getRequests()
  const newRequest: AccessRequest = {
    ...request,
    id: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
    fechaCreacion: new Date().toISOString().split("T")[0],
  }
  requests.push(newRequest)
  localStorage.setItem("requests", JSON.stringify(requests))
  return newRequest
}

export const updateRequest = (requestId: string, updates: Partial<AccessRequest>): void => {
  const requests = getRequests()
  const index = requests.findIndex((req) => req.id === requestId)
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates }
    localStorage.setItem("requests", JSON.stringify(requests))
  }
}

export const getCurrentUser = (): User | null => {
  const currentUserId = localStorage.getItem("currentUserId")
  return currentUserId ? getUser(currentUserId) : null
}

export const setCurrentUser = (userId: string): void => {
  localStorage.setItem("currentUserId", userId)
}

export const logout = (): void => {
  localStorage.removeItem("currentUserId")
}

export const resetData = (): void => {
  localStorage.removeItem("users")
  localStorage.removeItem("requests")
  localStorage.removeItem("currentUserId")
  initializeStorage()
}
