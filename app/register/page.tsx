"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const router = useRouter()

  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setNeedsEmailConfirmation(false)

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones")
      return
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    if (!formData.school) {
      setError("Debes seleccionar una escuela")
      return
    }

    setIsLoading(true)

    try {
      //console.log("🚀 Iniciando registro...")

      // Paso 1: Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            school: formData.school,
          },
        },
      })

      if (authError) {
        console.error("❌ Auth error:", authError)
        if (authError.message.includes("already registered")) {
          setError("Este correo ya está registrado. Intenta iniciar sesión.")
        } else {
          setError(`Error de registro: ${authError.message}`)
        }
        return
      }

      if (!authData.user) {
        setError("Error al crear el usuario. Inténtalo de nuevo.")
        return
      }

      //console.log("👤 Usuario creado:", authData.user.id)

      // Verificar si necesita confirmación de email
      if (!authData.session) {
        setNeedsEmailConfirmation(true)
        setSuccess(
          "¡Cuenta creada! Por favor, revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.",
        )

        // Crear perfil inmediatamente (se puede hacer sin sesión activa)
        const profileData = {
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          school: formData.school,
        }

        const { error: profileError } = await supabase.from("professor").insert(profileData)

        if (profileError) {
          console.error("❌ Profile error:", profileError)
          // No mostramos error al usuario ya que el registro fue exitoso
        }

        return
      }

      // Si hay sesión inmediata (email confirmado automáticamente)
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        school: formData.school,
      }

      const { error: profileError } = await supabase.from("professor").insert(profileData)

      if (profileError) {
        console.error("❌ Profile error:", profileError)
        setError(`Error al crear el perfil: ${profileError.message}`)
        return
      }

      setSuccess("¡Cuenta creada exitosamente! Redirigiendo al dashboard...")
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (error) {
      console.error("💥 Unexpected error:", error)
      setError("Error inesperado. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fedebb] to-[#f5d5a8] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-[#8b4513]" />
          </div>
          <CardTitle className="text-2xl text-[#8b4513]">Registro de Docente</CardTitle>
          <CardDescription className="text-[#8b4513]/70">Únete a la plataforma de evaluación FIEI-UNFV</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {success}
                {needsEmailConfirmation && (
                  <div className="mt-2 text-xs">
                    <strong>Importante:</strong> Después de confirmar tu email, podrás iniciar sesión y acceder al
                    dashboard.
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#8b4513]">
                  Nombres *
                </Label>
                <Input
                  id="firstName"
                  placeholder="Ingresa tus nombres"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="border-[#fedebb] focus:border-[#8b4513]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#8b4513]">
                  Apellidos *
                </Label>
                <Input
                  id="lastName"
                  placeholder="Ingresa tus apellidos"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="border-[#fedebb] focus:border-[#8b4513]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8b4513]">
                Correo Electrónico *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu.correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="border-[#fedebb] focus:border-[#8b4513]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school" className="text-[#8b4513]">
                Escuela *
              </Label>
              <Select value={formData.school} onValueChange={(value) => handleInputChange("school", value)} required>
                <SelectTrigger className="border-[#fedebb] focus:border-[#8b4513]">
                  <SelectValue placeholder="Selecciona tu escuela" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingenieria informatica">Ingeniería Informática</SelectItem>
                  <SelectItem value="ingenieria electronica">Ingeniería Electrónica</SelectItem>
                  <SelectItem value="ingenieria mecatronica">Ingeniería Mecatrónica</SelectItem>
                  <SelectItem value="ingenieria de telecomunicaciones">Ingeniería de Telecomunicaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#8b4513]">
                  Contraseña *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="border-[#fedebb] focus:border-[#8b4513] pr-10"
                    required
                    minLength={6}
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#8b4513]">
                  Confirmar Contraseña *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="border-[#fedebb] focus:border-[#8b4513] pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-[#8b4513]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#8b4513]" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                className="border-[#8b4513] data-[state=checked]:bg-[#8b4513]"
              />
              <Label htmlFor="terms" className="text-sm text-[#8b4513]/70">
                Acepto los{" "}
                <Link href="/terms" className="text-[#8b4513] hover:underline">
                  términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/privacy" className="text-[#8b4513] hover:underline">
                  política de privacidad
                </Link>{" "}
                *
              </Label>
            </div>

            <Button type="submit" className="w-full bg-[#8b4513] hover:bg-[#8b4513]/90 text-white" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-[#8b4513]/70">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-[#8b4513] hover:underline font-medium">
                Inicia sesión aquí
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
