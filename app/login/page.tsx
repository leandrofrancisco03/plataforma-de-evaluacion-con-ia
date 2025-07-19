"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("🔐 Intentando login con:", email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("❌ Auth error:", authError)
        if (authError.message.includes("Invalid login credentials")) {
          setError("Credenciales incorrectas. Verifica tu email y contraseña.")
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Por favor, confirma tu correo electrónico antes de iniciar sesión.")
        } else {
          setError(`Error de inicio de sesión: ${authError.message}`)
        }
        return
      }

      if (data.user && data.session) {
        console.log("👤 Usuario autenticado:", data.user.id)

        // Verificar que el perfil del profesor existe
        const { data: professorData, error: profileError } = await supabase
          .from("professor")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError || !professorData) {
          console.error("❌ Profile error:", profileError)
          setError("Perfil no encontrado. Por favor, contacta al administrador.")
          return
        }

        console.log("✅ Login exitoso, redirigiendo al dashboard...")
        // Redirigir al dashboard después del login exitoso
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("💥 Login error:", error)
      setError("Error inesperado. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fedebb] to-[#f5d5a8] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-[#8b4513]" />
          </div>
          <CardTitle className="text-2xl text-[#8b4513]">Iniciar Sesión</CardTitle>
          <CardDescription className="text-[#8b4513]/70">
            Accede a la plataforma de evaluación FIEI-UNFV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8b4513]">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu.correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#fedebb] focus:border-[#8b4513]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#8b4513]">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#fedebb] focus:border-[#8b4513] pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#8b4513]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#8b4513]" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#8b4513] hover:bg-[#8b4513]/90 text-white" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/forgot-password" className="text-sm text-[#8b4513] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
            <div className="text-sm text-[#8b4513]/70">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-[#8b4513] hover:underline font-medium">
                Regístrate aquí
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#fedebb]/50">
            <Link href="/">
              <Button
                variant="outline"
                className="w-full border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50 bg-transparent"
              >
                Volver al inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
