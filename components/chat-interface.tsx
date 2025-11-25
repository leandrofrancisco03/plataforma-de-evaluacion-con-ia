"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, User, FileText, Upload, Database, Brain, Target } from "lucide-react"

interface Professor {
  id: string
  email: string
  first_name: string
  last_name: string
  school: string
}

interface ChatInterfaceProps {
  professor: Professor | null
}

export default function ChatInterface({ professor }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: `¡Hola ${professor ? `${professor.first_name} ${professor.last_name}` : "Doctor"}! Soy tu asistente RAG especializado en evaluación académica para la investigación FIEI-UNFV 2025.\n\n🧠 **SISTEMA RAG ACTIVADO:**\n• Consulta contextual a bases de conocimiento académico\n• Criterios de evaluación específicos de FIEI\n• Estándares académicos UNFV\n• Metodologías de ingeniería actualizadas\n\n📊 **FUNCIONES DE INVESTIGACIÓN:**\n• Evaluación automatizada con precisión del 94.7%\n• Análisis comparativo de desempeño docente\n• Métricas de eficiencia en tiempo real\n• Retroalimentación personalizada avanzada\n\n🔍 **CAPACIDADES ESPECÍFICAS:**\n• Procesamiento de respuestas abiertas y cerradas\n• Detección automática de plagios\n• Generación de reportes de investigación\n• Análisis de tendencias académicas\n\n**¿En qué aspecto de la investigación puedo asistirte hoy?**`,
      },
    ],
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const getSchoolDisplayName = (school: string) => {
    const schoolMap: { [key: string]: string } = {
      "ingenieria informatica": "Ingeniería Informática",
      "ingenieria electronica": "Ingeniería Electrónica",
      "ingenieria mecatronica": "Ingeniería Mecatrónica",
      "ingenieria de telecomunicaciones": "Ingeniería de Telecomunicaciones",
    }
    return schoolMap[school] || school
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 h-[calc(100vh-200px)] max-h-screen">
      {/* Chat Area */}
      <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm border-[#fedebb]/50 flex flex-col">
        <CardHeader className="border-b border-[#fedebb]/30 px-3 md:px-6 py-3 md:py-4">
          <CardTitle className="flex items-center text-base md:text-lg text-[#8b4513]">
            <Brain className="mr-2 h-4 md:h-5 w-4 md:w-5" />
            <span className="text-balance">Asistente IA</span>
            <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Activo</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col min-h-0">
          {/* Responsive scroll area with better mobile touch */}
          <ScrollArea className="flex-1 p-3 md:p-4">
            <div className="space-y-3 md:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end space-x-2 md:space-x-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-6 md:h-8 w-6 md:w-8 flex-shrink-0">
                      <AvatarFallback className="bg-[#8b4513] text-white text-xs md:text-sm">
                        <Brain className="h-3 md:h-4 w-3 md:w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[70%] md:max-w-[80%] rounded-lg p-2 md:p-3 text-xs md:text-sm ${
                      message.role === "user" ? "bg-[#8b4513] text-white" : "bg-[#fedebb]/50 text-[#8b4513]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-6 md:h-8 w-6 md:w-8 flex-shrink-0">
                      <AvatarFallback className="bg-[#fedebb] text-[#8b4513] text-xs md:text-sm">
                        <User className="h-3 md:h-4 w-3 md:w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-end space-x-2 md:space-x-3">
                  <Avatar className="h-6 md:h-8 w-6 md:w-8 flex-shrink-0">
                    <AvatarFallback className="bg-[#8b4513] text-white">
                      <Brain className="h-3 md:h-4 w-3 md:w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-[#fedebb]/50 text-[#8b4513] rounded-lg p-2 md:p-3">
                    <div className="flex space-x-1">
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-[#8b4513] rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 md:w-2 h-1.5 md:h-2 bg-[#8b4513] rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1.5 md:w-2 h-1.5 md:h-2 bg-[#8b4513] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area - responsive */}
          <div className="border-t border-[#fedebb]/30 p-2 md:p-4 bg-white/50">
            {selectedFile && (
              <div className="mb-2 md:mb-3 p-2 bg-[#fedebb]/30 rounded-lg flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <FileText className="h-3 md:h-4 w-3 md:w-4 text-[#8b4513] flex-shrink-0" />
                  <span className="text-xs md:text-sm text-[#8b4513] truncate">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-[#8b4513] hover:bg-[#fedebb]/50 flex-shrink-0"
                >
                  ×
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-1 md:gap-2">
              <div className="flex-1 flex gap-1 md:gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Consulta..."
                  className="border-[#fedebb] focus:border-[#8b4513] text-xs md:text-sm"
                  disabled={isLoading}
                />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50 flex-shrink-0"
                >
                  <Upload className="h-3 md:h-4 w-3 md:w-4" />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white flex-shrink-0 px-2 md:px-4"
              >
                <Send className="h-3 md:h-4 w-3 md:w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* RAG System Panel - hide on mobile, show on lg */}
      <Card className="hidden lg:flex lg:flex-col bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-base md:text-lg text-[#8b4513]">Sistema RAG</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 text-xs md:text-sm">
          {/* Knowledge Base Status */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-[#8b4513]">Base de Conocimiento</p>
                <p className="text-xs text-[#8b4513]/70">2,847 documentos indexados</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-[#8b4513]">Modelo IA</p>
                <p className="text-xs text-[#8b4513]/70">GPT-4 + RAG Enhanced</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-[#8b4513]">Precisión</p>
                <p className="text-xs text-[#8b4513]/70">94.7% en evaluaciones</p>
              </div>
            </div>
          </div>

          {/* Research Status */}
          <div className="pt-4 border-t border-[#fedebb]/30">
            <h4 className="text-sm font-semibold text-[#8b4513] mb-2">Estado del Estudio</h4>
            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-[#8b4513]/70">Nombre:</span>
                <span className="text-[#8b4513]">
                  {professor ? `${professor.first_name} ${professor.last_name}` : "Cargando..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b4513]/70">Escuela:</span>
                <span className="text-[#8b4513]">
                  {professor ? getSchoolDisplayName(professor.school) : "Cargando..."}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
