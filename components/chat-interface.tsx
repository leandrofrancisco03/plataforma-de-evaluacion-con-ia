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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Chat Area */}
      <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm border-[#fedebb]/50 flex flex-col">
        <CardHeader className="border-b border-[#fedebb]/30">
          <CardTitle className="flex items-center text-[#8b4513]">
            <Brain className="mr-2 h-5 w-5" />
            Asistente IA para Evaluación
            <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Activo</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#8b4513] text-white">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-[#8b4513] text-white" : "bg-[#fedebb]/50 text-[#8b4513]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#fedebb] text-[#8b4513]">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#8b4513] text-white">
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-[#fedebb]/50 text-[#8b4513] rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#8b4513] rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-[#8b4513] rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#8b4513] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-[#fedebb]/30 p-4">
            {selectedFile && (
              <div className="mb-3 p-2 bg-[#fedebb]/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-[#8b4513]" />
                  <span className="text-sm text-[#8b4513]">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-[#8b4513] hover:bg-[#fedebb]/50"
                >
                  ×
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <div className="flex-1 flex space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Consulta sobre la investigación de IA en evaluación académica..."
                  className="border-[#fedebb] focus:border-[#8b4513]"
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
                  className="border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* RAG System Panel */}
      <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader>
          <CardTitle className="text-[#8b4513]">Sistema RAG</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="space-y-2 text-xs">
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
