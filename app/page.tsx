import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Shield, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Plataforma de Solicitudes de Acceso</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema integral para gestionar solicitudes de acceso con flujo de aprobación digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-blue-600" />
              <CardTitle>5 Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Sistema de roles completo desde solicitante hasta gerencia</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-12 w-12 mx-auto text-green-600" />
              <CardTitle>Firmas Digitales</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Captura y validación de firmas digitales con touchpad</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-purple-600" />
              <CardTitle>Flujo Seguro</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Proceso de aprobación estructurado y trazable</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Settings className="h-12 w-12 mx-auto text-orange-600" />
              <CardTitle>Gestión TI</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Creación y envío automático de credenciales</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/login">
            <Button size="lg" className="px-8 py-3 text-lg">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
