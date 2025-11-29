"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Brain,
  Target,
  Database,
  Settings,
  Trash2,
  X,
} from "lucide-react";

interface Professor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  school: string;
}

interface AutomatedEvaluationProps {
  professor: Professor | null;
}

export default function AutomatedEvaluation({
  professor,
}: AutomatedEvaluationProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [evaluationType, setEvaluationType] = useState("");
  const [evaluationCriteria, setEvaluationCriteria] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [evaluationResults, setEvaluationResults] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Validar que todos sean PDFs
    const pdfFiles = files.filter((file) => file.type === "application/pdf");
    const invalidFiles = files.filter(
      (file) => file.type !== "application/pdf"
    );

    if (invalidFiles.length > 0) {
      setError(
        `Se encontraron ${invalidFiles.length} archivo(s) que no son PDF. Solo se permiten archivos PDF.`
      );
      return;
    }

    // Validar tamaño de archivos
    const oversizedFiles = pdfFiles.filter(
      (file) => file.size > 50 * 1024 * 1024
    ); // 50MB
    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.length} archivo(s) superan el límite de 50MB`);
      return;
    }

    // Validar cantidad total (archivos existentes + nuevos)
    if (selectedFiles.length + pdfFiles.length > 10) {
      setError(
        `No puedes seleccionar más de 10 archivos en total. Actualmente tienes ${selectedFiles.length}, intentas agregar ${pdfFiles.length}`
      );
      return;
    }

    // Agregar archivos a la lista existente (evitar duplicados por nombre)
    const existingNames = selectedFiles.map((f) => f.name);
    const newFiles = pdfFiles.filter(
      (file) => !existingNames.includes(file.name)
    );

    if (newFiles.length !== pdfFiles.length) {
      const duplicateCount = pdfFiles.length - newFiles.length;
      setError(
        `${duplicateCount} archivo(s) ya están seleccionados y fueron omitidos`
      );
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setError("");
      //console.log(`✅ ${newFiles.length} archivo(s) agregado(s). Total: ${selectedFiles.length + newFiles.length}`)
    }

    // Limpiar el input para permitir seleccionar los mismos archivos de nuevo si es necesario
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  const removeAllFiles = () => {
    setSelectedFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  const handleEvaluate = async () => {
    // Validaciones
    if (selectedFiles.length === 0) {
      setError("Debes seleccionar al menos un archivo PDF");
      return;
    }
    if (!evaluationType) {
      setError("Debes seleccionar el tipo de evaluación");
      return;
    }
    if (!evaluationCriteria.trim()) {
      setError("Debes especificar los criterios de evaluación");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");
    setProcessingProgress(0);
    setEvaluationResults(null);

    try {
      //console.log(`🚀 Iniciando evaluación automatizada de ${selectedFiles.length} archivo(s)...`)

      // Crear FormData para enviar los datos
      const formData = new FormData();

      // Agregar todos los archivos PDF (soporta múltiples)
      selectedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      // Agregar metadatos
      formData.append("evaluation_type", evaluationType);
      formData.append("evaluation_criteria", evaluationCriteria);
      formData.append("total_files", selectedFiles.length.toString());
      formData.append("uploaded_at", new Date().toISOString());
      formData.append("professor_id", professor?.id || "");
      formData.append(
        "professor_name",
        `${professor?.first_name} ${professor?.last_name}` || ""
      );
      formData.append("school", professor?.school || "");

      // Agregar nombres de archivos para referencia
      const fileNames = selectedFiles.map((file) => file.name);
      formData.append("file_names", JSON.stringify(fileNames));
      formData.append("file_count", selectedFiles.length.toString());

      //console.log("📤 Enviando datos al webhook de evaluación...")
      //console.log(`📁 Archivos: ${fileNames.join(", ")}`)

      // Simular progreso mientras se procesa
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5; // Más lento para múltiples archivos
        });
      }, 800);

      // Crear AbortController para timeout personalizado (10 minutos)
      const controller = new AbortController();
      const timeoutMs = 15 * 60 * 1000; // 10 minutos en milisegundos
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Enviar a n8n webhook usando variable de entorno
      const webhookUrl = process.env.NEXT_PUBLIC_EVALUATION_WEBHOOK;
      const response = await fetch(webhookUrl as string, {
        method: "POST",
        body: formData,
        signal: controller.signal, // Agregar signal para timeout
      });

      clearTimeout(timeoutId); // Limpiar timeout si responde antes
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`);
      }

      const result = await response.json();
      //console.log("✅ Evaluación procesada:", result)

      setProcessingProgress(100);
      setSuccess(
        `✅ Evaluación de ${selectedFiles.length} archivo(s) completada exitosamente`
      );

      // Procesar la respuesta JSON del webhook
      if (Array.isArray(result) && result.length > 0) {
        //console.log(`📊 Procesando ${result.length} resultado(s) del webhook...`)

        // Procesar cada resultado del array
        const processedResults = result.map((item, index) => {
          const output = item.output;
          let studentName = `Evaluación ${index + 1}`;
          let score = 0;
          let maxScore = 20;
          let feedback = "Sin feedback disponible";

          // Verificar si output es un objeto JSON con propiedades Estudiante, Nota, Feedback
          if (output && typeof output === "object") {
            studentName = output.Estudiante || output.estudiante || studentName;
            score = output.Nota || output.nota || 0;
            feedback =
              output.Feedback || output.feedback || "Sin feedback disponible";
            // Si la nota no incluye máximo, asumir que es sobre 20
            maxScore = 20;
          } else if (typeof output === "string") {
            // Fallback: parsear como string si es texto plano
            const studentMatch = output.match(/Estudiante:\s*(.+?)(?:\n|$)/i);
            const gradeMatch = output.match(
              /Nota:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/i
            );
            const feedbackMatch = output.match(/Feedback:\s*([\s\S]+?)$/i);

            studentName = studentMatch ? studentMatch[1].trim() : studentName;
            score = gradeMatch ? Number.parseFloat(gradeMatch[1]) : 0;
            maxScore = gradeMatch ? Number.parseInt(gradeMatch[2]) : 20;
            feedback = feedbackMatch
              ? feedbackMatch[1].trim()
              : "Sin feedback disponible";
          }

          // Convertir score a número si es string
          if (typeof score === "string") {
            score = Number.parseFloat(score);
          }

          // Determinar estado basado en la nota
          let status = "attention";
          if (score >= 10.5) {
            status = "approved"; // >= 10.5/20
          } else if (score >= 8) {
            status = "review"; // 8-10.4/20
          }

          // Calcular porcentaje
          const percentage =
            maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

          return {
            name: studentName,
            score: score,
            maxScore: maxScore,
            percentage: percentage,
            feedback: feedback,
            status: status,
            rawOutput: output,
          };
        });

        // Calcular estadísticas generales
        const totalEvaluations = processedResults.length;
        const validScores = processedResults.filter(
          (r) => typeof r.score === "number" && r.score > 0
        );
        const averageScore =
          validScores.length > 0
            ? validScores.reduce((sum, r) => sum + r.score, 0) /
              validScores.length
            : 0;
        const approvedCount = processedResults.filter(
          (r) => r.status === "approved"
        ).length;
        const reviewCount = processedResults.filter(
          (r) => r.status === "review"
        ).length;
        const attentionCount = processedResults.filter(
          (r) => r.status === "attention"
        ).length;

        //console.log(`📈 Estadísticas: ${totalEvaluations} evaluaciones, promedio: ${averageScore.toFixed(1)}`)

        setEvaluationResults({
          totalEvaluations: totalEvaluations,
          totalFiles: selectedFiles.length,
          averageScore: averageScore.toFixed(1),
          averagePercentage:
            validScores.length > 0 ? Math.round((averageScore / 20) * 100) : 0,
          processingTime: "Tiempo real",
          approvedCount: approvedCount,
          reviewCount: reviewCount,
          attentionCount: attentionCount,
          accuracy: `${Math.round((approvedCount / totalEvaluations) * 100)}%`,
          individualResults: processedResults,
          rawResponse: result,
        });
      } else if (result && typeof result === "object") {
        // Manejar respuesta única (no array)
        //console.log("📝 Procesando respuesta única...")

        const output = result.output;
        let studentName = "Evaluación procesada";
        let score = 0;
        let maxScore = 20;
        let feedback = "";

        // Verificar si output es un objeto JSON con propiedades Estudiante, Nota, Feedback
        if (output && typeof output === "object") {
          studentName = output.Estudiante || output.estudiante || studentName;
          score = output.Nota || output.nota || 0;
          feedback =
            output.Feedback || output.feedback || "Sin feedback disponible";
          maxScore = 20;
        } else if (typeof output === "string") {
          // Fallback: parsear como string si es texto plano
          const studentMatch = output.match(/Estudiante:\s*(.+?)(?:\n|$)/i);
          const gradeMatch = output.match(
            /Nota:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/i
          );
          const feedbackMatch = output.match(/Feedback:\s*([\s\S]+?)$/i);

          studentName = studentMatch ? studentMatch[1].trim() : studentName;
          score = gradeMatch ? Number.parseFloat(gradeMatch[1]) : 0;
          maxScore = gradeMatch ? Number.parseInt(gradeMatch[2]) : 20;
          feedback = feedbackMatch ? feedbackMatch[1].trim() : output;
        } else {
          feedback = JSON.stringify(result);
        }

        // Convertir score a número si es string
        if (typeof score === "string") {
          score = Number.parseFloat(score);
        }

        setEvaluationResults({
          totalEvaluations: 1,
          totalFiles: selectedFiles.length,
          averageScore: score.toString(),
          averagePercentage:
            maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
          processingTime: "Completado",
          approvedCount: score >= 10.5 ? 1 : 0,
          reviewCount: score >= 8 && score < 10.5 ? 1 : 0,
          attentionCount: score < 8 ? 1 : 0,
          accuracy: "100%",
          individualResults: [
            {
              name: studentName,
              score: score,
              maxScore: maxScore,
              percentage:
                maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
              feedback: feedback,
              status:
                score >= 10.5
                  ? "approved"
                  : score >= 8
                  ? "review"
                  : "attention",
              rawOutput: output,
            },
          ],
          rawResponse: result,
        });
      } else {
        // Fallback para respuestas inesperadas
        //console.log("⚠️ Formato de respuesta no reconocido:", result)
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
              feedback: `Respuesta del servidor: ${JSON.stringify(
                result,
                null,
                2
              )}`,
              status: "attention",
              rawOutput: JSON.stringify(result),
            },
          ],
          rawResponse: result,
        });
      }
    } catch (error) {
      console.error("❌ Error en evaluación:", error);

      // Manejar timeout específicamente
      if (error instanceof Error && error.name === "AbortError") {
        setError(
          "⏱️ Tiempo de espera agotado (15 minutos). El servidor tardó demasiado en responder. Por favor intenta nuevamente o contacta soporte si el problema persiste."
        );
      } else {
        setError(`Error al procesar la evaluación: ${error}`);
      }

      setProcessingProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Upload and Configuration - responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="flex items-center text-base md:text-lg text-[#8b4513]">
              <Upload className="mr-2 h-4 md:h-5 w-4 md:w-5" />
              <span className="text-balance">Carga de Evaluaciones</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Sube múltiples exámenes, prácticas o proyectos para evaluación
              automatizada con RAG
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs md:text-sm text-[#8b4513]">
                Tipo de Evaluación *
              </Label>
              <Select value={evaluationType} onValueChange={setEvaluationType}>
                <SelectTrigger className="border-[#fedebb] focus:border-[#8b4513] text-xs md:text-sm">
                  <SelectValue placeholder="Selecciona el tipo de evaluación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Examen Parcial/Final</SelectItem>
                  <SelectItem value="lab">Práctica de Laboratorio</SelectItem>
                  <SelectItem value="project">Proyecto de Curso</SelectItem>
                  <SelectItem value="homework">Tarea/Ejercicios</SelectItem>
                  <SelectItem value="thesis">
                    Trabajo de Investigación
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-sm text-[#8b4513]">
                Criterios de Evaluación Específicos *
              </Label>
              <Textarea
                placeholder="Describe los criterios específicos para esta evaluación..."
                className="border-[#fedebb] focus:border-[#8b4513] text-xs md:text-sm"
                rows={4}
                value={evaluationCriteria}
                onChange={(e) => setEvaluationCriteria(e.target.value)}
              />
              <p className="text-xs text-[#8b4513]/70">
                Especifica qué aspectos debe evaluar la IA para obtener
                resultados más precisos
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-sm text-[#8b4513]">
                Archivos de Evaluaciones *
              </Label>

              {/* Upload Area - responsive padding */}
              <div className="border-2 border-dashed border-[#fedebb] rounded-lg p-4 md:p-6 text-center">
                <input
                  type="file"
                  id="evaluation-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf"
                  multiple
                />
                <div className="flex flex-col items-center space-y-3 md:space-y-4">
                  <Upload className="h-8 md:h-12 w-8 md:w-12 text-[#8b4513]/50" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("evaluation-upload")?.click()
                      }
                      className="border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50 text-xs md:text-sm"
                    >
                      <Upload className="mr-2 h-3 md:h-4 w-3 md:w-4" />
                      {selectedFiles.length > 0 ? "Agregar Más" : "Seleccionar"}
                    </Button>
                    <p className="text-xs md:text-sm text-[#8b4513]/70 mt-2">
                      {selectedFiles.length > 0
                        ? "Selecciona más PDFs o"
                        : "Selecciona PDFs o"}{" "}
                      arrastra aquí
                    </p>
                    <p className="text-xs text-[#8b4513]/50 mt-1">
                      Máximo 10 • 50MB c/u • Solo PDF
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Files List - responsive with overflow */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2 md:space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h4 className="font-medium text-xs md:text-sm text-[#8b4513]">
                      Archivos ({selectedFiles.length})
                    </h4>
                    <div className="flex items-center space-x-2 text-xs md:text-sm">
                      <span className="text-[#8b4513]/70">
                        {formatFileSize(getTotalSize())}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeAllFiles}
                        className="text-red-600 hover:bg-red-50 text-xs md:text-sm"
                      >
                        <X className="h-3 md:h-4 w-3 md:w-4 mr-1" />
                        <span className="hidden sm:inline">Limpiar</span>
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-40 md:max-h-60 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 md:p-3 bg-[#fedebb]/20 rounded-lg"
                      >
                        <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                          <FileText className="h-4 md:h-5 w-4 md:w-5 text-[#8b4513] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm font-medium text-[#8b4513] truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-[#8b4513]/70">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="h-3 md:h-4 w-3 md:w-4" />
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
                  <span className="text-[#8b4513]/70">
                    Procesando {selectedFiles.length} archivo(s)...
                  </span>
                  <span className="text-[#8b4513]">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
                <p className="text-xs text-[#8b4513]/70">
                  {processingProgress < 30 && "Analizando documentos..."}
                  {processingProgress >= 30 &&
                    processingProgress < 60 &&
                    "Aplicando criterios de evaluación..."}
                  {processingProgress >= 60 &&
                    processingProgress < 90 &&
                    "Generando calificaciones..."}
                  {processingProgress >= 90 && "Finalizando proceso..."}
                </p>
              </div>
            )}

            <Button
              onClick={handleEvaluate}
              disabled={
                selectedFiles.length === 0 ||
                !evaluationType ||
                !evaluationCriteria.trim() ||
                isProcessing
              }
              className="w-full bg-[#8b4513] hover:bg-[#8b4513]/90 text-white text-xs md:text-sm py-2 md:py-3"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Brain className="mr-2 h-4 md:h-5 w-4 md:w-5 animate-spin" />
                  <span className="hidden sm:inline">Procesando...</span>
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                  <span className="hidden sm:inline">
                    Evaluar{" "}
                    {selectedFiles.length > 0 ? `${selectedFiles.length}` : ""}
                  </span>
                  <span className="sm:hidden">Evaluar</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Configuration Panel - responsive */}
        <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
          <CardHeader>
            <CardTitle className="text-[#8b4513]">
              Sistema de Evaluación IA
            </CardTitle>
            <CardDescription>
              Configuración del motor de evaluación automatizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-[#8b4513]" />
              <div>
                <p className="text-sm font-medium text-[#8b4513]">
                  Base de Conocimiento
                </p>
                <p className="text-xs text-[#8b4513]/70">
                  FIEI Academic Standards
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-[#8b4513]" />
              <div>
                <p className="text-sm font-medium text-[#8b4513]">Modelo IA</p>
                <p className="text-xs text-[#8b4513]/70">
                  GPT-4 + RAG Enhanced
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-[#8b4513]" />
              <div>
                <p className="text-sm font-medium text-[#8b4513]">Precisión</p>
                <p className="text-xs text-[#8b4513]/70">
                  94.7% en pruebas piloto
                </p>
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

      {/* Results Section - responsive grid */}
      {evaluationResults && (
        <div className="space-y-4 md:space-y-6">
          {/* Stats Grid - responsive */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="text-center p-4 bg-[#fedebb]/20 rounded-lg">
              <div className="text-2xl font-bold text-[#8b4513]">
                {evaluationResults.totalFiles}
              </div>
              <div className="text-sm text-[#8b4513]/70">
                Archivos Procesados
              </div>
            </div>
            <div className="text-center p-4 bg-[#fedebb]/20 rounded-lg">
              <div className="text-2xl font-bold text-[#8b4513]">
                {evaluationResults.totalEvaluations}
              </div>
              <div className="text-sm text-[#8b4513]/70">
                Evaluaciones Totales
              </div>
            </div>
            <div className="text-center p-4 bg-[#fedebb]/20 rounded-lg">
              <div className="text-2xl font-bold text-[#8b4513]">
                {evaluationResults.averageScore}
              </div>
              <div className="text-sm text-[#8b4513]/70">Promedio (/20)</div>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-800">
                {evaluationResults.approvedCount}
              </div>
              <div className="text-sm text-green-700">Aprobados (≥10.5)</div>
            </div>
            <div className="text-center p-4 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-800">
                {evaluationResults.reviewCount}
              </div>
              <div className="text-sm text-yellow-700">A Revisar (12-15)</div>
            </div>
            <div className="text-center p-4 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-800">
                {evaluationResults.attentionCount}
              </div>
              <div className="text-sm text-red-700">Atención (&lt;12)</div>
            </div>
          </div>

          {/* Individual Results - responsive */}
          <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base md:text-lg text-[#8b4513]">
                Resultados Detallados
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="space-y-3 md:space-y-4">
                {evaluationResults.individualResults.map(
                  (result: any, i: number) => {
                    const statusColors = {
                      approved: "bg-green-100 text-green-800 border-green-300",
                      review: "bg-yellow-100 text-yellow-800 border-yellow-300",
                      attention: "bg-red-100 text-red-800 border-red-300",
                    };

                    return (
                      <div
                        key={i}
                        className={`p-3 md:p-4 border-2 rounded-lg transition-all ${
                          statusColors[
                            result.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        <div className="flex flex-col space-y-2">
                          {/* Nombre y Score en una línea */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <p className="font-bold text-xs md:text-sm">
                              {result.name}
                            </p>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className="text-lg md:text-xl font-bold">
                                  {result.score}/{result.maxScore}
                                </p>
                                <p className="text-xs text-opacity-70">
                                  ({result.percentage}%)
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className={`text-xs md:text-sm font-semibold ${
                                  result.status === "approved"
                                    ? "bg-green-200 text-green-900"
                                    : result.status === "review"
                                    ? "bg-yellow-200 text-yellow-900"
                                    : "bg-red-200 text-red-900"
                                }`}
                              >
                                {result.status === "approved"
                                  ? "✓ Aprobado"
                                  : result.status === "review"
                                  ? "⚠ A Revisar"
                                  : "✗ Atención"}
                              </Badge>
                            </div>
                          </div>

                          {/* Feedback */}
                          <div className="pt-2 border-t border-opacity-30">
                            <p className="text-xs md:text-sm font-medium opacity-70">
                              Feedback:
                            </p>
                            <p className="text-xs md:text-sm mt-1 break-words leading-relaxed">
                              {result.feedback}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
