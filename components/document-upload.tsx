"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

interface Professor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  school: string;
}

interface DocumentUploadProps {
  professor: Professor | null;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: "uploading" | "processing" | "completed" | "error";
}

export default function DocumentUpload({ professor }: DocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar documentos desde Supabase cuando el componente se monta o profesor cambia
  useEffect(() => {
    loadDocuments();
  }, [professor?.id]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);

      if (!professor?.id) {
        setUploadedDocuments([]);
        setIsLoading(false);
        return;
      }

      const professorId = professor.id;

      // Obtener documentos del profesor desde Supabase
      const { data, error: fetchError } = await supabase
        .from("documents")
        .select("*")
        .eq("professor_id", professorId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error al cargar documentos:", fetchError);
        setError("Error al cargar documentos");
        setUploadedDocuments([]);
        setIsLoading(false);
        return;
      }

      // Transformar datos de Supabase al formato de UploadedDocument
      const documents: UploadedDocument[] = (data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.filename,
        size: 0, // No tenemos size en Supabase, lo dejamos como 0
        uploadedAt: new Date(doc.created_at).toLocaleString(),
        status: "completed",
      }));

      setUploadedDocuments(documents);
      setError("");
      setIsLoading(false);
    } catch (err) {
      console.error("Error en loadDocuments:", err);
      setError("Error al cargar documentos");
      setUploadedDocuments([]);
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      setError("Solo se permiten archivos PDF");
      return;
    }

    if (pdfFiles.length > 5) {
      setError("Máximo 5 archivos por carga");
      return;
    }

    setSelectedFiles(pdfFiles);
    setError("");
  };

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
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

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Selecciona al menos un archivo PDF");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Crear FormData con múltiples archivos (soporta múltiples)
      const formData = new FormData();

      // Agregar todos los PDFs con patrón file_0, file_1, etc.
      selectedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      // Agregar metadata del profesor
      formData.append("professor_id", professor?.id || "");
      formData.append(
        "professor_name",
        `${professor?.first_name} ${professor?.last_name}` || ""
      );
      formData.append("school", professor?.school || "");
      formData.append("uploaded_at", new Date().toISOString());
      formData.append("file_count", selectedFiles.length.toString());

      // Agregar nombres de archivos
      const fileNames = selectedFiles.map((f) => f.name);
      formData.append("file_names", JSON.stringify(fileNames));

      //console.log(`📤 Enviando ${selectedFiles.length} archivo(s) a base vectorial...`)

      // Enviar todos los archivos en un solo POST
      const response = await fetch(
        process.env.NEXT_PUBLIC_DOCUMENT_UPLOAD_WEBHOOK!,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error al procesar documentos: ${response.statusText}`);
      }

      const result = await response.json();
      //console.log(`✅ Documentos procesados:`, result)

      // Guardar cada documento en Supabase
      if (professor?.id) {
        for (const file of selectedFiles) {
          const { error: insertError } = await supabase
            .from("documents")
            .insert([
              {
                professor_id: professor.id,
                filename: file.name,
                created_at: new Date().toISOString(),
              },
            ]);

          if (insertError) {
            console.error(
              `Error al guardar ${file.name} en Supabase:`,
              insertError
            );
          }
        }
      }

      setUploadProgress(100);
      setSuccess(
        `✅ ${selectedFiles.length} documento(s) cargado(s) exitosamente a la base vectorial y guardado(s) en base de datos`
      );
      setSelectedFiles([]);

      // Recargar documentos desde Supabase
      if (professor?.id) {
        const { data: updatedDocs, error: fetchError } = await supabase
          .from("documents")
          .select("*")
          .eq("professor_id", professor.id)
          .order("created_at", { ascending: false });

        if (!fetchError && updatedDocs) {
          const documents: UploadedDocument[] = updatedDocs.map((doc: any) => ({
            id: doc.id,
            name: doc.filename,
            size: 0,
            uploadedAt: new Date(doc.created_at).toLocaleString(),
            status: "completed",
          }));
          setUploadedDocuments(documents);
        }
      }
    } catch (error) {
      console.error("❌ Error en upload:", error);
      setError(`Error al cargar documentos: ${error}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeDocument = async (id: string) => {
    try {
      //console.log(`🗑️ Intentando eliminar documento con ID: ${id}`);

      // Remover de la UI inmediatamente
      setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== id));

      // Eliminar documento de Supabase
      const { data, error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id)
        .select(); // Agregar select para obtener feedback

      //console.log("Delete response:", { data, error });

      if (error) {
        console.error("Error al eliminar documento:", error);
        setError(`Error al eliminar documento: ${error.message}`);
        // Recargar documentos si hay error para revertir cambios
        await loadDocuments();
      } else {
        //console.log("✅ Documento eliminado exitosamente");
        setSuccess("✅ Documento eliminado exitosamente");
        setTimeout(() => setSuccess(""), 3000);
        // Recargar documentos para confirmar
        await loadDocuments();
      }
    } catch (err) {
      console.error("Error en removeDocument:", err);
      setError(`Error al eliminar documento: ${err}`);
      await loadDocuments();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Upload Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="flex items-center text-base md:text-lg text-[#8b4513]">
            <Database className="mr-2 h-4 md:h-5 w-4 md:w-5" />
            <span className="text-balance">
              Carga de Documentos a Base Vectorial
            </span>
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Sube PDFs de clases, libros y materiales académicos para crear tu
            base de conocimiento personalizada
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6 space-y-4 md:space-y-6">
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

          {/* File Upload Area */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[#fedebb] rounded-lg p-4 md:p-8 text-center">
              <input
                type="file"
                id="pdf-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf"
                multiple
              />
              <div className="flex flex-col items-center space-y-3 md:space-y-4">
                <Upload className="h-8 md:h-12 w-8 md:w-12 text-[#8b4513]/50" />
                <div>
                  <Button
                    type="button"
                    onClick={() =>
                      document.getElementById("pdf-upload")?.click()
                    }
                    className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white text-xs md:text-sm"
                  >
                    <Upload className="mr-2 h-3 md:h-4 w-3 md:w-4" />
                    Seleccionar Archivos PDF
                  </Button>
                  <p className="text-xs md:text-sm text-[#8b4513]/70 mt-2">
                    Arrastra y suelta archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-[#8b4513]/50 mt-1">
                    Máximo 5 archivos PDF • Tamaño máximo: 50MB por archivo
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Files - responsive scroll */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <h4 className="font-medium text-xs md:text-sm text-[#8b4513]">
                  Archivos Seleccionados ({selectedFiles.length})
                </h4>
                <div className="space-y-2 max-h-48 md:max-h-none overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 md:p-3 bg-[#fedebb]/20 rounded-lg gap-2"
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

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8b4513]/70">
                    Procesando documentos...
                  </span>
                  <span className="text-[#8b4513]">
                    {Math.round(uploadProgress)}%
                  </span>
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
              className="w-full bg-[#8b4513] hover:bg-[#8b4513]/90 text-white text-xs md:text-sm py-2 md:py-3"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Database className="mr-2 h-4 md:h-5 w-4 md:w-5 animate-pulse" />
                  <span className="hidden sm:inline">
                    Procesando en Base Vectorial...
                  </span>
                  <span className="sm:hidden">Procesando...</span>
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                  <span className="hidden sm:inline">
                    Cargar{" "}
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} archivo(s)`
                      : "Documentos"}{" "}
                    a Base de Conocimiento
                  </span>
                  <span className="sm:hidden">Cargar</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents List - responsive grid */}
      <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-base md:text-lg text-[#8b4513]">
            Documentos en Base de Conocimiento
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Documentos procesados y disponibles para consulta vectorial
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          {uploadedDocuments.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <BookOpen className="h-8 md:h-12 w-8 md:w-12 text-[#8b4513]/50 mx-auto mb-3 md:mb-4" />
              <p className="text-xs md:text-sm text-[#8b4513]/70">
                {isLoading
                  ? "Cargando documentos..."
                  : "No hay documentos cargados aún"}
              </p>
              <p className="text-xs text-[#8b4513]/50">
                {!isLoading && "Sube tu primer PDF para comenzar"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 md:p-4 border border-[#fedebb]/50 rounded-lg hover:bg-[#fedebb]/10 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-1 sm:mt-0">
                      {getStatusIcon(doc.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="font-medium text-xs md:text-sm text-[#8b4513] break-words">
                          {doc.name}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2 flex-wrap text-xs text-[#8b4513]/70 mt-1">
                        <span>{doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge
                      variant={
                        doc.status === "completed" ? "default" : "secondary"
                      }
                      className={`text-xs ${
                        doc.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : doc.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {doc.status === "completed"
                        ? "Procesado"
                        : doc.status === "processing"
                        ? "Procesando"
                        : "Error"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 md:h-4 w-3 md:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Panel - responsive grid */}
      <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-base md:text-lg text-[#8b4513]">
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6 space-y-3 md:space-y-4">
          <div className="flex items-start md:items-center space-x-2 md:space-x-3">
            <Database className="h-4 md:h-5 w-4 md:w-5 text-green-600 flex-shrink-0 mt-0.5 md:mt-0" />
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-[#8b4513]">
                Base Vectorial Activa
              </p>
              <p className="text-xs text-[#8b4513]/70">
                Conectada a n8n + OpenAI Embeddings
              </p>
            </div>
          </div>

          <div className="flex items-start md:items-center space-x-2 md:space-x-3">
            <GraduationCap className="h-4 md:h-5 w-4 md:w-5 text-blue-600 flex-shrink-0 mt-0.5 md:mt-0" />
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-[#8b4513]">
                Profesor: {professor?.first_name} {professor?.last_name}
              </p>
              <p className="text-xs text-[#8b4513]/70">
                Escuela: {professor?.school}
              </p>
            </div>
          </div>

          <div className="flex items-start md:items-center space-x-2 md:space-x-3">
            <FileCheck className="h-4 md:h-5 w-4 md:w-5 text-purple-600 flex-shrink-0 mt-0.5 md:mt-0" />
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-[#8b4513]">
                Documentos Procesados
              </p>
              <p className="text-xs text-[#8b4513]/70">
                {
                  uploadedDocuments.filter((d) => d.status === "completed")
                    .length
                }{" "}
                disponibles para consulta
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
