"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Database,
  BookOpen,
  GraduationCap,
  FileCheck,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface Professor {
  id: string
  email: string
  first_name: string
  last_name: string
  school: string
}

interface DocumentUploadProps {
  professor: Professor | null
}

interface UploadedDocument {
  id: string
  name: string
  size: number
  uploadedAt: string
  status: "uploading" | "processing" | "completed" | "error"
}

export default function DocumentUpload({ professor }: DocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([
    // Documentos de ejemplo para mostrar la interfaz
    {
      id: "1",
      name: "Circuitos_Electronicos_Capitulo_1.pdf",
      size: 2.5 * 1024 * 1024,
      uploadedAt: "2025-01-26 10:30",
      status: "completed",
    },
    {
      id: "2",
      name: "Libro_Sistemas_Digitales.pdf",
      size: 15.2 * 1024 * 1024,
      uploadedAt: "2025-01-25 14:20",
      status: "completed",
    },
  ])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const pdfFiles = files.filter((file) => file.type === "application/pdf")

    if (pdfFiles.length !== files.length) {
      setError("Solo se permiten archivos PDF")
      return
    }

    if (pdfFiles.length > 5) {
      setError("Máximo 5 archivos por carga")
      return
    }

    setSelectedFiles(pdfFiles)
    setError("")
  }

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Selecciona al menos un archivo PDF")
      return
    }

    setIsUploading(true)
    setError("")
    setSuccess("")
    setUploadProgress(0)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        // Crear FormData para enviar el PDF
        const formData = new FormData()
        formData.append("pdf", file)
        formData.append("professor_id", professor?.id || "")
        formData.append("professor_name", `${professor?.first_name} ${professor?.last_name}` || "")
        formData.append("school", professor?.school || "")
        formData.append("uploaded_at", new Date().toISOString())

        console.log(`📤 Enviando archivo ${i + 1}/${selectedFiles.length}: ${file.name}`)

        // Enviar a n8n webhook
        const response = await fetch(
          "https://n8n.llamasolutions.pe/webhook/43cb9c44-215e-430d-84eb-8f72113ada7f",
          {
            method: "POST",
            body: formData,
          },
        )

        if (!response.ok) {
          throw new Error(`Error al procesar ${file.name}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log(`✅ Archivo procesado: ${file.name}`, result)

        // Agregar documento a la lista
        const newDocument: UploadedDocument = {
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toLocaleString(),
          status: "completed",
        }

        setUploadedDocuments((prev) => [newDocument, ...prev])

        // Actualizar progreso
        setUploadProgress(((i + 1) / selectedFiles.length) * 100)
      }

      setSuccess(`✅ ${selectedFiles.length} documento(s) cargado(s) exitosamente a la base vectorial`)
      setSelectedFiles([])
    } catch (error) {
      console.error("❌ Error en upload:", error)
      setError(`Error al cargar documentos: ${error}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeDocument = (id: string) => {
    setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader>
          <CardTitle className="flex items-center text-[#8b4513]">
            <Database className="mr-2 h-5 w-5" />
            Carga de Documentos a Base Vectorial
          </CardTitle>
          <CardDescription>
            Sube PDFs de clases, libros y materiales académicos para crear tu base de conocimiento personalizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">{success}</div>
          )}

          {/* File Upload Area */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[#fedebb] rounded-lg p-8 text-center">
              <input
                type="file"
                id="pdf-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf"
                multiple
              />
              <div className="flex flex-col items-center space-y-4">
                <Upload className="h-12 w-12 text-[#8b4513]/50" />
                <div>
                  <Button
                    type="button"
                    onClick={() => document.getElementById("pdf-upload")?.click()}
                    className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar Archivos PDF
                  </Button>
                  <p className="text-sm text-[#8b4513]/70 mt-2">
                    Arrastra y suelta archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-[#8b4513]/50 mt-1">
                    Máximo 5 archivos PDF • Tamaño máximo: 50MB por archivo
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-[#8b4513]">Archivos Seleccionados ({selectedFiles.length})</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#fedebb]/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-[#8b4513]" />
                        <div>
                          <p className="text-sm font-medium text-[#8b4513]">{file.name}</p>
                          <p className="text-xs text-[#8b4513]/70">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8b4513]/70">Procesando documentos...</span>
                  <span className="text-[#8b4513]">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-[#8b4513]/70">
                  Enviando a base vectorial para procesamiento con embeddings...
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className="w-full bg-[#8b4513] hover:bg-[#8b4513]/90 text-white"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Database className="mr-2 h-5 w-5 animate-pulse" />
                  Procesando en Base Vectorial...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Cargar {selectedFiles.length > 0 ? `${selectedFiles.length} archivo(s)` : "Documentos"} a Base de
                  Conocimiento
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents List */}
      <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader>
          <CardTitle className="text-[#8b4513]">Documentos en Base de Conocimiento</CardTitle>
          <CardDescription>Documentos procesados y disponibles para consulta vectorial</CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedDocuments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-[#8b4513]/50 mx-auto mb-4" />
              <p className="text-[#8b4513]/70">No hay documentos cargados aún</p>
              <p className="text-sm text-[#8b4513]/50">Sube tu primer PDF para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-[#fedebb]/50 rounded-lg hover:bg-[#fedebb]/10 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">{getStatusIcon(doc.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-[#8b4513]">{doc.name}</h4>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-[#8b4513]/70 mt-1">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={doc.status === "completed" ? "default" : "secondary"}
                      className={
                        doc.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : doc.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {doc.status === "completed" ? "Procesado" : doc.status === "processing" ? "Procesando" : "Error"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader>
          <CardTitle className="text-[#8b4513]">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-[#8b4513]">Base Vectorial Activa</p>
              <p className="text-xs text-[#8b4513]/70">Conectada a n8n + OpenAI Embeddings</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-[#8b4513]">
                Profesor: {professor?.first_name} {professor?.last_name}
              </p>
              <p className="text-xs text-[#8b4513]/70">Escuela: {professor?.school}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <FileCheck className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-[#8b4513]">Documentos Procesados</p>
              <p className="text-xs text-[#8b4513]/70">
                {uploadedDocuments.filter((d) => d.status === "completed").length} disponibles para consulta
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
