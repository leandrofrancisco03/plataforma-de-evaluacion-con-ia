"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Brain, BarChart3, Target, Database, Settings, Trash2, X } from "lucide-react"

export default function AutomatedEvaluation() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [evaluationType, setEvaluationType] = useState("")
  const [evaluationCriteria, setEvaluationCriteria] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [evaluationResults, setEvaluationResults] = useState<any>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) return

    // Validar que todos sean PDFs
    const pdfFiles = files.filter((file) => file.type === "application/pdf")
    const invalidFiles = files.filter((file) => file.type !== "application/pdf")

    if (invalidFiles.length > 0) {
      setError(`Se encontraron ${invalidFiles.length} archivo(s) que no son PDF. Solo se permiten archivos PDF.`)
      return
    }

    // Validar tamaño de archivos
    const oversizedFiles = pdfFiles.filter((file) => file.size > 50 * 1024 * 1024) // 50MB
    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.length} archivo(s) superan el límite de 50MB`)
      return
    }

    // Validar cantidad total (archivos existentes + nuevos)
    if (selectedFiles.length + pdfFiles.length > 10) {
      setError(
        `No puedes seleccionar más de 10 archivos en total. Actualmente tienes ${selectedFiles.length}, intentas agregar ${pdfFiles.length}`,
      )
      return
    }

    // Agregar archivos a la lista existente (evitar duplicados por nombre)
    const existingNames = selectedFiles.map((f) => f.name)
    const newFiles = pdfFiles.filter((file) => !existingNames.includes(file.name))

    if (newFiles.length !== pdfFiles.length) {
      const duplicateCount = pdfFiles.length - newFiles.length
      setError(`${duplicateCount} archivo(s) ya están seleccionados y fueron omitidos`)
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
      setError("")
      console.log(`✅ ${newFiles.length} archivo(s) agregado(s). Total: ${selectedFiles.length + newFiles.length}`)
    }

    // Limpiar el input para permitir seleccionar los mismos archivos de nuevo si es necesario
    event.target.value = ""
  }

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
  }

  const removeAllFiles = () => {
    setSelectedFiles([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0)
  }

  const handleEvaluate = async () => {
    // Validaciones
    if (selectedFiles.length === 0) {
      setError("Debes seleccionar al menos un archivo PDF")
      return
    }
    if (!evaluationType) {
      setError("Debes seleccionar el tipo de evaluación")
      return
    }
    if (!evaluationCriteria.trim()) {
      setError("Debes especificar los criterios de evaluación")
      return
    }

    setIsProcessing(true)
    setError("")
    setSuccess("")
    setProcessingProgress(0)
    setEvaluationResults(null)

    try {
      console.log(`🚀 Iniciando evaluación automatizada de ${selectedFiles.length} archivo(s)...`)

      // Crear FormData para enviar los datos
      const formData = new FormData()

      // Agregar todos los archivos PDF
      selectedFiles.forEach((file, index) => {
        formData.append(`pdf_${index}`, file)
      })

      // Agregar metadatos
      formData.append("evaluation_type", evaluationType)
      formData.append("evaluation_criteria", evaluationCriteria)
      formData.append("total_files", selectedFiles.length.toString())
      formData.append("uploaded_at", new Date().toISOString())

      // Agregar nombres de archivos para referencia
      const fileNames = selectedFiles.map((file) => file.name)
      formData.append("file_names", JSON.stringify(fileNames))

      console.log("📤 Enviando datos al webhook de evaluación...")
      console.log(`📁 Archivos: ${fileNames.join(", ")}`)

      // Simular progreso mientras se procesa
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 5 // Más lento para múltiples archivos
        })
      }, 800)

      // Enviar a n8n webhook usando variable de entorno
      const webhookUrl = process.env.NEXT_PUBLIC_EVALUATION_WEBHOOK
      const response = await fetch(webhookUrl as string, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Evaluación procesada:", result)

      setProcessingProgress(100)
      setSuccess(`✅ Evaluación de ${selectedFiles.length} archivo(s) completada exitosamente`)

      // Procesar la respuesta JSON del webhook
      if (Array.isArray(result) && result.length > 0) {
        console.log(`📊 Procesando ${result.length} resultado(s) del webhook...`)

        // Procesar cada resultado del array
        const processedResults = result.map((item, index) => {
          const output = item.output || ""
          console.log(`📝 Procesando resultado ${index + 1}:`, output.substring(0, 100) + "...")

          // Extraer información del output usando regex más robustos
          const studentMatch = output.match(/Estudiante:\s*(.+?)(?:\n|$)/i)
          const gradeMatch = output.match(/Nota:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/i)
          const feedbackMatch = output.match(/Feedback:\s*([\s\S]+?)$/i) // Captura todo hasta el final

          const studentName = studentMatch ? studentMatch[1].trim() : `Evaluación ${index + 1}`
          const score = gradeMatch ? Number.parseFloat(gradeMatch[1]) : 0
          const maxScore = gradeMatch ? Number.parseInt(gradeMatch[2]) : 20
          const feedback = feedbackMatch ? feedbackMatch[1].trim() : "Sin feedback disponible"

          // Determinar estado basado en la nota
          let status = "attention"
          if (score >= maxScore * 0.8) {
            status = "approved" // 80% o más (16/20 o más)
          } else if (score >= maxScore * 0.6) {
            status = "review" // 60-79% (12-15.9/20)
          }

          // Calcular porcentaje
          const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

          return {
            name: studentName,
            score: score,
            maxScore: maxScore,
            percentage: percentage,
            feedback: feedback,
            status: status,
            rawOutput: output,
          }
        })

        // Calcular estadísticas generales
        const totalEvaluations = processedResults.length
        const validScores = processedResults.filter((r) => typeof r.score === "number" && r.score > 0)
        const averageScore =
          validScores.length > 0 ? validScores.reduce((sum, r) => sum + r.score, 0) / validScores.length : 0
        const approvedCount = processedResults.filter((r) => r.status === "approved").length
        const reviewCount = processedResults.filter((r) => r.status === "review").length
        const attentionCount = processedResults.filter((r) => r.status === "attention").length

        console.log(`📈 Estadísticas: ${totalEvaluations} evaluaciones, promedio: ${averageScore.toFixed(1)}`)

        setEvaluationResults({
          totalEvaluations: totalEvaluations,
          totalFiles: selectedFiles.length,
          averageScore: averageScore.toFixed(1),
          averagePercentage: validScores.length > 0 ? Math.round((averageScore / 20) * 100) : 0,
          processingTime: "Tiempo real",
          approvedCount: approvedCount,
          reviewCount: reviewCount,
          attentionCount: attentionCount,
          accuracy: `${Math.round((approvedCount / totalEvaluations) * 100)}%`,
          individualResults: processedResults,
          rawResponse: result,
        })
      } else if (result && typeof result === "object") {
        // Manejar respuesta única (no array)
        console.log("📝 Procesando respuesta única...")

        const output = result.output || JSON.stringify(result)
        const studentMatch = output.match(/Estudiante:\s*(.+?)(?:\n|$)/i)
        const gradeMatch = output.match(/Nota:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/i)
        const feedbackMatch = output.match(/Feedback:\s*([\s\S]+?)$/i)

        const studentName = studentMatch ? studentMatch[1].trim() : "Evaluación procesada"
        const score = gradeMatch ? Number.parseFloat(gradeMatch[1]) : 0
        const maxScore = gradeMatch ? Number.parseInt(gradeMatch[2]) : 20
        const feedback = feedbackMatch ? feedbackMatch[1].trim() : output

        setEvaluationResults({
          totalEvaluations: 1,
          totalFiles: selectedFiles.length,
          averageScore: score.toString(),
          averagePercentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
          processingTime: "Completado",
          approvedCount: score >= maxScore * 0.8 ? 1 : 0,
          reviewCount: score >= maxScore * 0.6 && score < maxScore * 0.8 ? 1 : 0,
          attentionCount: score < maxScore * 0.6 ? 1 : 0,
          accuracy: "100%",
          individualResults: [
            {
              name: studentName,
              score: score,
              maxScore: maxScore,
              percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
              feedback: feedback,
              status: score >= maxScore * 0.8 ? "approved" : score >= maxScore * 0.6 ? "review" : "attention",
              rawOutput: output,
            },
          ],
          rawResponse: result,
        })
      } else {
        // Fallback para respuestas inesperadas
        console.log("⚠️ Formato de respuesta no reconocido:", result)
        setEvaluationResults({
          totalEvaluations: 1,
          totalFiles: selectedFiles.length,
          averageScore: "N/A",
          averagePercentage: 0,
          processingTime: "Completado",
          approvedCount: 0,
          reviewCount: 0,
          attentionCount: 1,
          accuracy: "N/A",
          individualResults: [
            {
              name: "Resultado no procesable",
              score: "N/A",
              maxScore: 20,
              percentage: 0,
              feedback: `Respuesta del servidor: ${JSON.stringify(result, null, 2)}`,
              status: "attention",
              rawOutput: JSON.stringify(result),
            },
          ],
          rawResponse: result,
        })
      }
    } catch (error) {
      console.error("❌ Error en evaluación:", error)
      setError(`Error al procesar la evaluación: ${error}`)
      setProcessingProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload and Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8b4513]">
              <Upload className="mr-2 h-5 w-5" />
              Carga de Evaluaciones
            </CardTitle>
            <CardDescription>
              Sube múltiples exámenes, prácticas o proyectos para evaluación automatizada con RAG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">{success}</div>
            )}

            <div className="space-y-2">
              <Label className="text-[#8b4513]">Tipo de Evaluación *</Label>
              <Select value={evaluationType} onValueChange={setEvaluationType}>
                <SelectTrigger className="border-[#fedebb] focus:border-[#8b4513]">
                  <SelectValue placeholder="Selecciona el tipo de evaluación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Examen Parcial/Final</SelectItem>
                  <SelectItem value="lab">Práctica de Laboratorio</SelectItem>
                  <SelectItem value="project">Proyecto de Curso</SelectItem>
                  <SelectItem value="homework">Tarea/Ejercicios</SelectItem>
                  <SelectItem value="thesis">Trabajo de Investigación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#8b4513]">Criterios de Evaluación Específicos *</Label>
              <Textarea
                placeholder="Describe los criterios específicos para esta evaluación (ej: precisión en cálculos, metodología aplicada, claridad en explicaciones, uso correcto de fórmulas, etc.)"
                className="border-[#fedebb] focus:border-[#8b4513]"
                rows={4}
                value={evaluationCriteria}
                onChange={(e) => setEvaluationCriteria(e.target.value)}
              />
              <p className="text-xs text-[#8b4513]/70">
                Especifica qué aspectos debe evaluar la IA para obtener resultados más precisos
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#8b4513]">Archivos de Evaluaciones *</Label>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-[#fedebb] rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="evaluation-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf"
                  multiple
                />
                <div className="flex flex-col items-center space-y-4">
                  <Upload className="h-12 w-12 text-[#8b4513]/50" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("evaluation-upload")?.click()}
                      className="border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {selectedFiles.length > 0 ? "Agregar Más Archivos PDF" : "Seleccionar Archivos PDF"}
                    </Button>
                    <p className="text-sm text-[#8b4513]/70 mt-2">
                      Selecciona múltiples PDFs manteniendo presionado Ctrl/Cmd
                    </p>
                    <p className="text-xs text-[#8b4513]/50 mt-1">
                      Máximo 10 archivos • 50MB por archivo • Solo formato PDF
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[#8b4513]">Archivos Seleccionados ({selectedFiles.length})</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-[#8b4513]/70">Total: {formatFileSize(getTotalSize())}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeAllFiles}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpiar todo
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
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
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8b4513]/70">Procesando {selectedFiles.length} archivo(s)...</span>
                  <span className="text-[#8b4513]">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
                <p className="text-xs text-[#8b4513]/70">
                  {processingProgress < 30 && "Analizando documentos..."}
                  {processingProgress >= 30 && processingProgress < 60 && "Aplicando criterios de evaluación..."}
                  {processingProgress >= 60 && processingProgress < 90 && "Generando calificaciones..."}
                  {processingProgress >= 90 && "Finalizando proceso..."}
                </p>
              </div>
            )}

            <Button
              onClick={handleEvaluate}
              disabled={selectedFiles.length === 0 || !evaluationType || !evaluationCriteria.trim() || isProcessing}
              className="w-full bg-[#8b4513] hover:bg-[#8b4513]/90 text-white"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin" />
                  Procesando {selectedFiles.length} Evaluación(es)...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Evaluar {selectedFiles.length > 0 ? `${selectedFiles.length} Archivo(s)` : "Documentos"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* RAG Configuration */}
        <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
          <CardHeader>
            <CardTitle className="text-[#8b4513]">Sistema de Evaluación IA</CardTitle>
            <CardDescription>Configuración del motor de evaluación automatizada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-[#8b4513]" />
              <div>
                <p className="text-sm font-medium text-[#8b4513]">Base de Conocimiento</p>
                <p className="text-xs text-[#8b4513]/70">FIEI Academic Standards</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-[#8b4513]" />
              <div>
                <p className="text-sm font-medium text-[#8b4513]">Modelo IA</p>
                <p className="text-xs text-[#8b4513]/70">GPT-4 + RAG Enhanced</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-[#8b4513]" />
              <div>
                <p className="text-sm font-medium text-[#8b4513]">Precisión</p>
                <p className="text-xs text-[#8b4513]/70">94.7% en pruebas piloto</p>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="pt-2 border-t border-[#fedebb]/30">
                <div className="text-xs text-[#8b4513]/70 space-y-1">
                  <div>📁 Archivos: {selectedFiles.length}</div>
                  <div>📊 Tamaño total: {formatFileSize(getTotalSize())}</div>
                  <div>⚡ Procesamiento: Paralelo</div>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50 bg-transparent"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurar Parámetros
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader>
          <CardTitle className="text-[#8b4513]">Resultados de Evaluación Automatizada</CardTitle>
          <CardDescription>Análisis detallado generado por el sistema de IA</CardDescription>
        </CardHeader>
        <CardContent>
          {evaluationResults ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-[#fedebb]/20 rounded-lg">
                  <div className="text-2xl font-bold text-[#8b4513]">{evaluationResults.totalFiles}</div>
                  <div className="text-sm text-[#8b4513]/70">Archivos Procesados</div>
                </div>
                <div className="text-center p-4 bg-[#fedebb]/20 rounded-lg">
                  <div className="text-2xl font-bold text-[#8b4513]">{evaluationResults.totalEvaluations}</div>
                  <div className="text-sm text-[#8b4513]/70">Evaluaciones Totales</div>
                </div>
                <div className="text-center p-4 bg-[#fedebb]/20 rounded-lg">
                  <div className="text-2xl font-bold text-[#8b4513]">{evaluationResults.averageScore}</div>
                  <div className="text-sm text-[#8b4513]/70">Promedio (/20)</div>
                </div>
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{evaluationResults.approvedCount}</div>
                  <div className="text-sm text-green-700">Aprobados (≥16)</div>
                </div>
                <div className="text-center p-4 bg-yellow-100 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-800">{evaluationResults.reviewCount}</div>
                  <div className="text-sm text-yellow-700">A Revisar (12-15)</div>
                </div>
                <div className="text-center p-4 bg-red-100 rounded-lg">
                  <div className="text-2xl font-bold text-red-800">{evaluationResults.attentionCount}</div>
                  <div className="text-sm text-red-700">Atención (&lt;12)</div>
                </div>
              </div>

              {/* Individual Results */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[#8b4513]">Resultados Individuales</h4>
                {evaluationResults.individualResults.map((result: any, i: number) => (
                  <div key={i} className="border border-[#fedebb]/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[#fedebb]/30 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-[#8b4513]">
                            {typeof result.score === "number"
                              ? `${result.score}${result.maxScore ? `/${result.maxScore}` : ""}`
                              : result.score}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#8b4513]">{result.name}</p>
                          {typeof result.score === "number" && result.maxScore && (
                            <p className="text-xs text-[#8b4513]/70">
                              Porcentaje: {result.percentage}% • Nota: {result.score}/{result.maxScore}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          result.status === "approved"
                            ? "default"
                            : result.status === "review"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          result.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : result.status === "review"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {result.status === "approved"
                          ? "Aprobado"
                          : result.status === "review"
                            ? "Revisar"
                            : "Atención"}
                      </Badge>
                    </div>

                    {/* Feedback detallado */}
                    <div className="bg-[#fedebb]/10 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-[#8b4513] mb-2">Retroalimentación:</h5>
                      <p className="text-sm text-[#8b4513]/80 whitespace-pre-wrap">{result.feedback}</p>
                    </div>

                    {/* Mostrar output completo si está disponible */}
                    {result.rawOutput && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-[#8b4513]/70 hover:text-[#8b4513]">
                          Ver análisis completo
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto whitespace-pre-wrap">
                          {result.rawOutput}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <Button className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white">
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar Resultados
                </Button>
                <Button
                  variant="outline"
                  className="border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50 bg-transparent"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Análisis Detallado
                </Button>
                {evaluationResults.rawResponse && (
                  <details className="inline-block">
                    <summary className="cursor-pointer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50 bg-transparent"
                      >
                        Ver JSON Completo
                      </Button>
                    </summary>
                    <div className="absolute z-10 mt-2 p-4 bg-white border border-[#fedebb] rounded-lg shadow-lg max-w-2xl max-h-96 overflow-auto">
                      <pre className="text-xs">{JSON.stringify(evaluationResults.rawResponse, null, 2)}</pre>
                    </div>
                  </details>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-[#8b4513]/50 mx-auto mb-4" />
              <p className="text-[#8b4513]/70">
                Configura los parámetros y sube archivos para comenzar la evaluación automatizada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
