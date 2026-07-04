import { Link } from "react-router-dom";
import { GraduationCap, LogIn, ClipboardList, Newspaper, CalendarDays, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { id: "inicio", label: "Inicio" },
  { id: "noticias", label: "Noticias" },
  { id: "eventos", label: "Eventos" },
  { id: "logros", label: "Logros" },
];

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Colegio San Martín</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="hover:text-foreground">
                {section.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="#inscripciones">
                <ClipboardList className="h-4 w-4" />
                Inscripciones
              </a>
            </Button>
            <Button size="sm" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Ingresar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section id="inicio" className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bienvenidos al Colegio San Martín</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Formando estudiantes con excelencia académica y valores para el futuro. Conoce nuestras noticias,
            eventos y logros institucionales.
          </p>
        </section>

        <section id="noticias" className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Noticias</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base">Noticia de ejemplo {i}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Contenido de ejemplo. Esta sección se definirá en una historia de usuario independiente.
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="eventos" className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Eventos</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base">Evento de ejemplo {i}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Fecha y ubicación de marcador de posición.</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="logros" className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Logros</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base">Logro de ejemplo {i}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Reconocimiento de marcador de posición.</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="inscripciones" className="mx-auto max-w-6xl px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Inscripciones</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              El módulo de inscripciones se habilitará próximamente. Esta sección queda reservada para esa
              funcionalidad.
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Colegio San Martín. Todos los derechos reservados.
      </footer>
    </div>
  );
}
