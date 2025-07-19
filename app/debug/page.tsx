"use client"

import AuthDebug from "@/components/auth-debug"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fedebb] to-[#f5d5a8] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#8b4513] mb-6">Debug de Autenticación</h1>
        <AuthDebug />
      </div>
    </div>
  )
}
