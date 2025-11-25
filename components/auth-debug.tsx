"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase"

export default function AuthDebug() {
  const [authUser, setAuthUser] = useState<any>(null)
  const [professor, setProfessor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [envCheck, setEnvCheck] = useState<any>({})

  useEffect(() => {
    // Check environment variables
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Present" : "❌ Missing",
      NODE_ENV: process.env.NODE_ENV || "unknown",
    }
    setEnvCheck(envStatus)

    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = getSupabaseClient()

      // Verificar usuario autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setAuthUser(user)

      if (user) {
        // Verificar perfil del profesor
        const { data: professorData, error } = await supabase.from("professor").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching professor:", error)
        } else {
          setProfessor(professorData)
        }
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("professor").select("count").limit(1)

      if (error) {
        alert(`Error de conexión: ${error.message}`)
      } else {
        alert("✅ Conexión a Supabase exitosa!")
      }
    } catch (error) {
      alert(`Error inesperado: ${error}`)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug de Variables de Entorno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Estado de Variables de Entorno:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(envCheck, null, 2)}</pre>
          </div>

          <div>
            <h3 className="font-semibold">Usuario Auth (Supabase):</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {authUser ? JSON.stringify(authUser, null, 2) : "No autenticado"}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Perfil Profesor (Tabla professor):</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {professor ? JSON.stringify(professor, null, 2) : "No encontrado"}
            </pre>
          </div>

          <div className="space-x-2">
            <Button onClick={checkAuth}>Verificar Auth</Button>
            <Button onClick={testConnection} variant="outline">
              Test Conexión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
