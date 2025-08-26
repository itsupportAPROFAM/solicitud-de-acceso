"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import { authenticateUser, setCurrentUser, initializeStorage, resetData, getUsers } from "@/lib/storage"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeStorage()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const user = authenticateUser(email, password)
      if (user) {
        setCurrentUser(user.id)
        router.push("/dashboard")
      } else {
        setError("Credenciales incorrectas")
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail)
    setPassword("123456")
  }

  const handleResetData = () => {
    resetData()
    setError("")
    alert("Datos reseteados correctamente")
  }

  const users = getUsers()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
            <CardDescription>Accede a la plataforma de solicitudes de acceso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleResetData} className="w-full" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetear Datos de Prueba
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios de Prueba</CardTitle>
            <CardDescription>Haz clic para usar las credenciales automáticamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleQuickLogin(user.email)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.position}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {user.role.replace("-", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Contraseña para todos:</strong> 123456
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
