"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Target, Users, Zap, TrendingUp, TrendingDown, BarChart3, Activity, Award } from "lucide-react"

export default function PerformanceMetrics() {
  const metrics = [
    {
      title: "Eficiencia en Calificación",
      icon: Clock,
      current: 78,
      previous: 45,
      improvement: 73,
      unit: "%",
      description: "Reducción en tiempo de calificación",
      trend: "up",
    },
    {
      title: "Calidad de Retroalimentación",
      icon: Target,
      current: 85,
      previous: 62,
      improvement: 37,
      unit: "%",
      description: "Mejora en calidad percibida",
      trend: "up",
    },
    {
      title: "Carga Administrativa",
      icon: Users,
      current: 35,
      previous: 100,
      improvement: -65,
      unit: "%",
      description: "Reducción de carga administrativa",
      trend: "down",
    },
    {
      title: "Adopción Tecnológica",
      icon: Zap,
      current: 92,
      previous: 23,
      improvement: 300,
      unit: "%",
      description: "Incremento en uso de tecnología",
      trend: "up",
    },
  ]

  const detailedMetrics = [
    { label: "Tiempo promedio por evaluación", before: "45 min", after: "12 min", improvement: "-73%" },
    { label: "Consistencia en calificaciones", before: "67%", after: "94%", improvement: "+40%" },
    { label: "Retroalimentación personalizada", before: "23%", after: "89%", improvement: "+287%" },
    { label: "Satisfacción docente", before: "6.2/10", after: "8.7/10", improvement: "+40%" },
    { label: "Detección de plagios", before: "Manual", after: "Automática", improvement: "100%" },
    { label: "Análisis de tendencias", before: "No disponible", after: "Tiempo real", improvement: "Nuevo" },
  ]

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon
          return (
            <Card key={i} className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-[#8b4513]" />
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <CardTitle className="text-sm text-[#8b4513]/70">{metric.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-[#8b4513]">
                    {metric.current}
                    {metric.unit}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        metric.improvement > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {metric.improvement > 0 ? "+" : ""}
                      {Math.abs(metric.improvement)}%
                    </Badge>
                    <span className="text-xs text-[#8b4513]/70">vs. anterior</span>
                  </div>
                  <p className="text-xs text-[#8b4513]/70">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Comparison */}
      <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
        <CardHeader>
          <CardTitle className="text-[#8b4513]">Comparación Detallada: Antes vs Después</CardTitle>
          <CardDescription>Análisis del impacto de la implementación de IA en el desempeño docente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {detailedMetrics.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-[#fedebb]/30 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-[#8b4513]">{item.label}</p>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-[#8b4513]/70">Antes</p>
                    <p className="font-semibold text-[#8b4513]">{item.before}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#8b4513]/70">Después</p>
                    <p className="font-semibold text-[#8b4513]">{item.after}</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {item.improvement}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Research Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
          <CardHeader>
            <CardTitle className="text-[#8b4513]">Impacto en la Investigación</CardTitle>
            <CardDescription>Contribuciones al conocimiento académico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-[#8b4513]" />
              <div>
                <p className="font-medium text-[#8b4513]">Validación de Hipótesis</p>
                <p className="text-sm text-[#8b4513]/70">La IA mejora significativamente el desempeño docente</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-5 w-5 text-[#8b4513]" />
              <div>
                <p className="font-medium text-[#8b4513]">Datos Cuantitativos</p>
                <p className="text-sm text-[#8b4513]/70">1,247 evaluaciones procesadas con 94.7% de precisión</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-[#8b4513]" />
              <div>
                <p className="font-medium text-[#8b4513]">Evidencia Empírica</p>
                <p className="text-sm text-[#8b4513]/70">Reducción del 78% en tiempo de evaluación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
          <CardHeader>
            <CardTitle className="text-[#8b4513]">Objetivos de Investigación</CardTitle>
            <CardDescription>Progreso en los objetivos específicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8b4513]">Eficiencia de Calificación</span>
                <span className="text-[#8b4513]">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8b4513]">Calidad de Retroalimentación</span>
                <span className="text-[#8b4513]">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8b4513]">Reducción Carga Administrativa</span>
                <span className="text-[#8b4513]">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8b4513]">Adopción Tecnológica</span>
                <span className="text-[#8b4513]">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
