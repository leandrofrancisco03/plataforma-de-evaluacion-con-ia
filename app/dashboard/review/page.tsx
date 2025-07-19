"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, Download, Eye, Star, Clock, Users, CheckCircle, AlertCircle, BarChart3 } from "lucide-react"

export default function ReviewPage() {
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState("")

  const courses = [
    { id: "ce1", name: "Circuitos Electrónicos I", students: 45 },
    { id: "ce2", name: "Circuitos Electrónicos II", students: 38 },
    { id: "sd", name: "Sistemas Digitales", students: 52 },
    { id: "mc", name: "Microcontroladores", students: 41 },
  ]

  const assignments = [
    {
      id: "lab1",
      title: "Práctica 1: Análisis de Circuitos RC",
      type: "Laboratorio",
      dueDate: "2025-01-15",
      submitted: 42,
      total: 45,
      avgScore: 16.8,
      status: "En revisión",
    },
    {
      id: "exam1",
      title: "Examen Parcial - Amplificadores",
      type: "Examen",
      dueDate: "2025-01-10",
      submitted: 45,
      total: 45,
      avgScore: 14.2,
      status: "Completado",
    },
    {
      id: "proj1",
      title: "Proyecto: Diseño de Filtros Activos",
      type: "Proyecto",
      dueDate: "2025-01-20",
      submitted: 38,
      total: 45,
      avgScore: 15.5,
      status: "En progreso",
    },
  ]

  const studentSubmissions = [
    {
      id: 1,
      name: "Ana García Pérez",
      code: "2021001234",
      submission: "Informe_Lab1_Garcia.pdf",
      submittedAt: "2025-01-14 23:45",
      status: "Pendiente",
      score: null,
      priority: "high",
    },
    {
      id: 2,
      name: "Carlos Mendoza Silva",
      code: "2021001235",
      submission: "Lab1_Mendoza_Final.pdf",
      submittedAt: "2025-01-15 10:30",
      status: "Revisado",
      score: 18,
      priority: "low",
    },
    {
      id: 3,
      name: "María Rodriguez López",
      code: "2021001236",
      submission: "Practica1_Rodriguez.pdf",
      submittedAt: "2025-01-13 16:20",
      status: "En revisión",
      score: null,
      priority: "medium",
    },
    {
      id: 4,
      name: "José Fernández Torres",
      code: "2021001237",
      submission: "Laboratorio_1_Fernandez.pdf",
      submittedAt: "2025-01-15 08:15",
      status: "Pendiente",
      score: null,
      priority: "high",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fedebb] to-[#f5d5a8] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#8b4513]">Centro de Revisión</h1>
            <p className="text-[#8b4513]/70">Gestiona y evalúa trabajos de estudiantes</p>
          </div>
          <div className="flex space-x-3">
            <Button className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white">
              <Download className="mr-2 h-4 w-4" />
              Exportar Calificaciones
            </Button>
            <Button variant="outline" className="border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50">
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver Estadísticas
            </Button>
          </div>
        </div>

        {/* Course and Assignment Selection */}
        <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
          <CardHeader>
            <CardTitle className="text-[#8b4513]">Seleccionar Curso y Evaluación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#8b4513]">Curso</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="border-[#fedebb] focus:border-[#8b4513]">
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.students} estudiantes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#8b4513]">Evaluación</Label>
                <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                  <SelectTrigger className="border-[#fedebb] focus:border-[#8b4513]">
                    <SelectValue placeholder="Selecciona una evaluación" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Overview */}
        {selectedAssignment && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-[#8b4513]" />
                  <div>
                    <p className="text-sm text-[#8b4513]/70">Entregados</p>
                    <p className="text-2xl font-bold text-[#8b4513]">42/45</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-[#8b4513]/70">Revisados</p>
                    <p className="text-2xl font-bold text-[#8b4513]">15</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-[#8b4513]/70">Pendientes</p>
                    <p className="text-2xl font-bold text-[#8b4513]">27</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-[#8b4513]/70">Promedio</p>
                    <p className="text-2xl font-bold text-[#8b4513]">16.8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Submissions List */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
              <CardHeader>
                <CardTitle className="text-[#8b4513]">Trabajos de Estudiantes</CardTitle>
                <CardDescription>Lista de entregas para revisión</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 border border-[#fedebb]/50 rounded-lg hover:bg-[#fedebb]/20 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-[#8b4513]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#8b4513]">{submission.name}</h4>
                          <p className="text-sm text-[#8b4513]/70">{submission.code}</p>
                          <p className="text-xs text-[#8b4513]/50">Entregado: {submission.submittedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            submission.status === "Revisado"
                              ? "default"
                              : submission.status === "En revisión"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            submission.status === "Revisado"
                              ? "bg-green-100 text-green-800"
                              : submission.status === "En revisión"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {submission.status}
                        </Badge>
                        {submission.score && (
                          <Badge variant="outline" className="text-[#8b4513]">
                            {submission.score}/20
                          </Badge>
                        )}
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-[#8b4513] text-[#8b4513]">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white">
                            Revisar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Tools */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
              <CardHeader>
                <CardTitle className="text-[#8b4513]">Herramientas de Revisión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-[#8b4513] hover:bg-[#8b4513]/90 text-white">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Rúbrica
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Plantilla de Feedback
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Análisis Comparativo
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Detector de Plagio
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
              <CardHeader>
                <CardTitle className="text-[#8b4513]">Progreso de Revisión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#8b4513]/70">Trabajos Revisados</span>
                      <span className="text-[#8b4513]">15/42</span>
                    </div>
                    <Progress value={35.7} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#8b4513]/70">Tiempo Estimado Restante</span>
                      <span className="text-[#8b4513]">3.5 horas</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#8b4513]/70">Promedio por Trabajo</span>
                      <span className="text-[#8b4513]">8 minutos</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
              <CardHeader>
                <CardTitle className="text-[#8b4513]">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-[#8b4513]/70">Revisado: Carlos Mendoza (18/20)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-[#8b4513]/70">En progreso: María Rodriguez</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-[#8b4513]/70">Nueva entrega: José Fernández</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
