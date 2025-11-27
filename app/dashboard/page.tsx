"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Database,
  BarChart3,
  LogOut,
  Bell,
  Plus,
  Clock,
  Users,
  Target,
  Zap,
  Brain,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import DocumentUpload from "@/components/document-upload";
import AutomatedEvaluation from "@/components/automated-evaluation";

interface Professor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  school: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = getSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          //console.log("❌ No user found, redirecting to login")
          router.push("/login");
          return;
        }

        //console.log("👤 User found:", user.id)

        // Obtener datos del profesor
        const { data: professorData, error } = await supabase
          .from("professor")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("❌ Error fetching professor:", error);
          router.push("/login");
        } else {
          //console.log("✅ Professor data loaded:", professorData)
          setProfessor(professorData as unknown as Professor);
        }
      } catch (error) {
        console.error("💥 Error in getUser:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      //console.log("🔄 Auth state changed:", event, session?.user?.id)

      if (event === "SIGNED_OUT") {
        setProfessor(null);
        router.push("/");
      } else if (event === "SIGNED_IN" && session?.user) {
        // Recargar datos del profesor si se inicia sesión
        getUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      //console.log("🚪 Cerrando sesión...")
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Error al cerrar sesión:", error);
      } else {
        //console.log("✅ Sesión cerrada exitosamente")
        // La redirección se maneja en el listener de onAuthStateChange
      }
    } catch (error) {
      console.error("💥 Error inesperado al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const sidebarItems = [
    { id: "overview", label: "Resumen General", icon: BarChart3 },
    { id: "documents", label: "Base de Conocimiento", icon: Database },
    { id: "evaluation", label: "Evaluación Automatizada", icon: Brain },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fedebb] to-[#f5d5a8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b4513] mx-auto mb-4"></div>
          <div className="text-[#8b4513]">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fedebb] to-[#f5d5a8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#8b4513] mb-4">Error al cargar el perfil</div>
          <Button
            onClick={() => router.push("/login")}
            className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white"
          >
            Volver al login
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSchoolDisplayName = (school: string) => {
    const schoolMap: { [key: string]: string } = {
      "ingenieria informatica": "Ing. Informática",
      "ingenieria electronica": "Ing. Electrónica",
      "ingenieria mecatronica": "Ing. Mecatrónica",
      "ingenieria de telecomunicaciones": "Ing. Telecomunicaciones",
    };
    return schoolMap[school] || school;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fedebb] to-[#f5d5a8]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-[#fedebb]/30 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <GraduationCap className="h-6 sm:h-8 w-6 sm:w-8 text-[#8b4513] flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold text-[#8b4513] truncate">
                FIEI Evaluación IA
              </h1>
              <p className="text-xs sm:text-sm text-[#8b4513]/70 truncate">
                Panel Docente
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#8b4513] hidden sm:flex"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-[#8b4513] text-white text-xs sm:text-sm">
                {getInitials(professor.first_name, professor.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs sm:text-sm hidden sm:block">
              <div className="font-medium text-[#8b4513]">
                {professor.first_name} {professor.last_name}
              </div>
              <div className="text-[#8b4513]/70">
                {getSchoolDisplayName(professor.school)}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-[#8b4513]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-72 bg-white/80 backdrop-blur-sm border-r border-[#fedebb]/30 min-h-[calc(100vh-73px)]`}
        >
          <div className="p-4 sm:p-6">
            <div className="mb-6 hidden md:block">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src="/placeholder.svg?height=48&width=48" />
                  <AvatarFallback className="bg-[#8b4513] text-white text-xs">
                    {getInitials(professor.first_name, professor.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-[#8b4513]">
                    {professor.first_name} {professor.last_name}
                  </h3>
                  <p className="text-xs text-[#8b4513]/70">
                    {getSchoolDisplayName(professor.school)}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#fedebb]/50 text-[#8b4513] mt-1"
                  >
                    Participante Investigación
                  </Badge>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-start text-xs sm:text-sm ${
                      activeTab === item.id
                        ? "bg-[#8b4513] text-white"
                        : "text-[#8b4513] hover:bg-[#fedebb]/50"
                    }`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-[#fedebb]/50">
              <Button
                variant="ghost"
                className="w-full justify-start text-xs sm:text-sm text-[#8b4513] hover:bg-red-50 hover:text-red-600"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#8b4513]">
                    Bienvenido, {professor.first_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8b4513]/70">
                    Efecto de la IA en el desempeño docente - FIEI UNFV 2025
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab("evaluation")}
                  className="bg-[#8b4513] hover:bg-[#8b4513]/90 text-white w-full sm:w-auto text-xs sm:text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Evaluación
                </Button>
              </div>

              {/* Research Objectives Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
                  <CardHeader className="pb-2 p-4 sm:p-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 sm:h-5 sm:w-5 text-[#8b4513]" />
                      <CardTitle className="text-xs sm:text-sm text-[#8b4513]/70">
                        Eficiencia en Calificación
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-xl sm:text-2xl font-bold text-[#8b4513]">
                      -78%
                    </div>
                    <p className="text-xs text-green-600">
                      Reducción en tiempo
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
                  <CardHeader className="pb-2 p-4 sm:p-6">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-[#8b4513]" />
                      <CardTitle className="text-xs sm:text-sm text-[#8b4513]/70">
                        Calidad Retroalimentación
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-xl sm:text-2xl font-bold text-[#8b4513]">
                      +85%
                    </div>
                    <p className="text-xs text-green-600">Mejora en calidad</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
                  <CardHeader className="pb-2 p-4 sm:p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-[#8b4513]" />
                      <CardTitle className="text-xs sm:text-sm text-[#8b4513]/70">
                        Carga Administrativa
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-xl sm:text-2xl font-bold text-[#8b4513]">
                      -65%
                    </div>
                    <p className="text-xs text-green-600">Reducción de carga</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
                  <CardHeader className="pb-2 p-4 sm:p-6">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-[#8b4513]" />
                      <CardTitle className="text-xs sm:text-sm text-[#8b4513]/70">
                        Adopción Tecnológica
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-xl sm:text-2xl font-bold text-[#8b4513]">
                      92%
                    </div>
                    <p className="text-xs text-green-600">Tasa de adopción</p>
                  </CardContent>
                </Card>
              </div>

              {/* Research Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-sm sm:text-base text-[#8b4513]">
                      Fases de la Investigación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-[#8b4513]">
                        Fase 1: Diagnóstico
                      </span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Completado
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-[#8b4513]">
                        Fase 2: Implementación
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        En Progreso
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-[#8b4513]">Fase 3: Evaluación</span>
                      <Badge className="bg-gray-100 text-gray-800 text-xs">
                        Pendiente
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-[#8b4513]">Fase 4: Análisis</span>
                      <Badge className="bg-gray-100 text-gray-800 text-xs">
                        Pendiente
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-[#fedebb]/50">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-sm sm:text-base text-[#8b4513]">
                      Tecnologías Implementadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-[#8b4513] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#8b4513]">
                          RAG (Retrieval-Augmented Generation)
                        </p>
                        <p className="text-xs text-[#8b4513]/70">
                          Consulta contextual a bases de conocimiento
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-[#8b4513] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#8b4513]">
                          n8n + OpenAI API
                        </p>
                        <p className="text-xs text-[#8b4513]/70">
                          Automatización low-code con IA avanzada
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Database className="h-5 w-5 text-[#8b4513] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#8b4513]">
                          Base de Conocimiento Académico
                        </p>
                        <p className="text-xs text-[#8b4513]/70">
                          Criterios y estándares de evaluación FIEI
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#8b4513]">
                    Base de Conocimiento Vectorial
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8b4513]/70">
                    Carga y gestiona documentos académicos para crear tu base de
                    conocimiento personalizada
                  </p>
                </div>
              </div>
              <DocumentUpload professor={professor} />
            </div>
          )}

          {activeTab === "evaluation" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#8b4513]">
                    Evaluación Automatizada
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8b4513]/70">
                    Procesamiento inteligente de respuestas abiertas y cerradas
                  </p>
                </div>
              </div>
              <AutomatedEvaluation professor={professor} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
