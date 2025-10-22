"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login, initDemoUser, isAuthenticated } from "@/lib/auth"
import { Bike, LogIn, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Inicializar usuario demo
    initDemoUser()

    // Redirigir si ya está autenticado
    if (isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      const user = login(formData.username, formData.password)

      if (user) {
        router.push("/")
      } else {
        setError("Usuario o contraseña incorrectos")
        setIsLoading(false)
      }
    }, 800)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Bike className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Buffa-Bikes QR</CardTitle>
            <CardDescription className="text-base mt-2">Sistema de Gestión de Tickets</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-semibold">
                Usuario
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="admin"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="h-12 text-base"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-14 text-lg gradient-primary shadow-lg" disabled={isLoading}>
              {isLoading ? (
                <>Iniciando sesión...</>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Usuario demo: <span className="font-semibold">admin</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Contraseña: <span className="font-semibold">admin123</span>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
