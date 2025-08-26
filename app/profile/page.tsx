"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignaturePad } from "@/components/signature-pad"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Upload } from "lucide-react"
import Link from "next/link"
import { getCurrentUser, updateUser, type User } from "@/lib/storage"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState({
    nombre: "",
    email: "",
    departamento: "",
    cargo: "",
    telefono: "",
    empleadoId: "",
  })
  const [signature, setSignature] = useState("")
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    setProfileData({
      nombre: currentUser.name,
      email: currentUser.email,
      departamento: currentUser.department,
      cargo: currentUser.position,
      telefono: currentUser.phone,
      empleadoId: currentUser.id,
    })
    setSignature(currentUser.signature || "")
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = () => {
    if (!user) return

    const updatedUser: User = {
      ...user,
      name: profileData.nombre,
      email: profileData.email,
      department: profileData.departamento,
      position: profileData.cargo,
      phone: profileData.telefono,
    }

    updateUser(updatedUser)
    setUser(updatedUser)
    alert("Perfil actualizado correctamente")
  }

  const handleSaveSignature = () => {
    if (!user) return

    const updatedUser: User = {
      ...user,
      signature: signature,
    }

    updateUser(updatedUser)
    setUser(updatedUser)
    alert("Firma actualizada correctamente")
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
          <p className="text-white mt-2">Gestiona tu información personal y firma digital</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="signature">Firma Digital</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" />
                    <AvatarFallback className="text-2xl">JP</AvatarFallback>
                  </Avatar>
                  <CardTitle>{profileData.nombre}</CardTitle>
                  <CardDescription>{profileData.cargo}</CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {profileData.departamento}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar Foto
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Actualiza tu información de contacto y detalles profesionales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 space-y-4 md:space-y-0">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        value={profileData.nombre}
                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento</Label>
                      <Input
                        id="departamento"
                        value={profileData.departamento}
                        onChange={(e) => handleInputChange("departamento", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        value={profileData.cargo}
                        onChange={(e) => handleInputChange("cargo", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={profileData.telefono}
                        onChange={(e) => handleInputChange("telefono", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="empleado-id">ID Empleado</Label>
                      <Input id="empleado-id" value={profileData.empleadoId} disabled className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="signature">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <SignaturePad onSignatureChange={setSignature} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Firma</CardTitle>
                  <CardDescription>Tu firma digital se utilizará para autorizar solicitudes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Importante</h4>
                    <p className="text-sm text-blue-700">
                      Tu firma digital tiene validez legal y se utilizará para firmar documentos oficiales. Asegúrate de
                      que sea clara y consistente.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Estado de la Firma</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Configurada
                      </Badge>
                      <span className="text-sm text-gray-600">Última actualización: Hoy</span>
                    </div>
                  </div>

                  <Button onClick={handleSaveSignature} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar Firma
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
                <CardDescription>Gestiona tu contraseña y configuraciones de seguridad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>

                <Button className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
