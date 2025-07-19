import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Brain, FileText, BarChart3, Clock, Users, Target, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fedebb] to-[#f5d5a8]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-[#fedebb]/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-[#8b4513]" />
            <div>
              <h1 className="text-xl font-bold text-[#8b4513]">FIEI Evaluación IA</h1>
              <p className="text-sm text-[#8b4513]/70">UNFV - Investigación 2025</p>
            </div>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-[#8b4513] mb-6">
            Plataforma de Evaluación
            <span className="block text-[#8b4513]/80">Basada en IA con RAG</span>
          </h2>
          <p className="text-xl text-[#8b4513]/70 mb-8 max-w-4xl mx-auto">
            Investigación sobre el efecto de la implementación de una plataforma de evaluación basada en inteligencia
            artificial sobre el desempeño docente en la Facultad de Ingeniería Electrónica e Informática, UNFV, 2025
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <Button size="lg" className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white px-8 py-3">
                Participar en la Investigación
              </Button>
            </Link>
            <Link href="/research-info">
              <Button
                size="lg"
                variant="outline"
                className="border-[#8b4513] text-[#8b4513] hover:bg-[#fedebb]/50 px-8 py-3"
              >
                Información del Estudio
              </Button>
            </Link>
          </div>
        </div>

        {/* Research Objectives */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[#8b4513] text-center mb-8">Objetivos de la Investigación</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-[#8b4513] mb-4" />
                <CardTitle className="text-[#8b4513]">Eficiencia en Calificación</CardTitle>
                <CardDescription className="text-[#8b4513]/70">
                  Medir el efecto en la eficiencia del proceso de calificación docente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-[#8b4513] mb-4" />
                <CardTitle className="text-[#8b4513]">Calidad de Retroalimentación</CardTitle>
                <CardDescription className="text-[#8b4513]/70">
                  Evaluar la mejora en la calidad de retroalimentación académica
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-[#8b4513] mb-4" />
                <CardTitle className="text-[#8b4513]">Carga Administrativa</CardTitle>
                <CardDescription className="text-[#8b4513]/70">
                  Medir la reducción en la carga administrativa docente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-[#8b4513] mb-4" />
                <CardTitle className="text-[#8b4513]">Adopción Tecnológica</CardTitle>
                <CardDescription className="text-[#8b4513]/70">
                  Promover la adopción de herramientas tecnológicas avanzadas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Technology Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-[#8b4513] mb-4" />
              <CardTitle className="text-[#8b4513]">RAG + OpenAI</CardTitle>
              <CardDescription className="text-[#8b4513]/70">
                Retrieval-Augmented Generation con consulta a bases de datos contextuales para evaluación precisa
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-[#8b4513] mb-4" />
              <CardTitle className="text-[#8b4513]">Evaluación Automatizada</CardTitle>
              <CardDescription className="text-[#8b4513]/70">
                Procesamiento de respuestas abiertas y cerradas con criterios académicos específicos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-[#8b4513] mb-4" />
              <CardTitle className="text-[#8b4513]">Análisis de Desempeño</CardTitle>
              <CardDescription className="text-[#8b4513]/70">
                Métricas avanzadas para medir el impacto en el desempeño docente
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Research Context */}
        <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8b4513] text-center">Contexto de la Investigación</CardTitle>
            <CardDescription className="text-center text-[#8b4513]/70">
              Facultad de Ingeniería Electrónica e Informática - UNFV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-[#8b4513] mb-3">Problemática Identificada</h4>
                <ul className="space-y-2 text-[#8b4513]/80 text-sm">
                  <li>• Elevado consumo de tiempo en evaluación estudiantil</li>
                  <li>• Ausencia de herramientas automatizadas</li>
                  <li>• Sobrecarga de trabajo docente</li>
                  <li>• Métodos tradicionales de evaluación</li>
                  <li>• Retroalimentación tardía a estudiantes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#8b4513] mb-3">Solución Propuesta</h4>
                <ul className="space-y-2 text-[#8b4513]/80 text-sm">
                  <li>• Plataforma automatizada con IA</li>
                  <li>• Integración RAG + n8n + OpenAI</li>
                  <li>• Evaluación objetiva y consistente</li>
                  <li>• Retroalimentación personalizada</li>
                  <li>• Reducción significativa de tiempos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-[#8b4513] text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 FIEI - UNFV. Investigación: Plataforma de Evaluación con IA.</p>
          <p className="text-sm mt-2 opacity-80">
            Estudio sobre el efecto en el desempeño docente - Año académico 2025
          </p>
        </div>
      </footer>
    </div>
  )
}
