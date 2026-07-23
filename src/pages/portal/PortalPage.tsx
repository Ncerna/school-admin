import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, LogIn, ClipboardList, Newspaper, CalendarDays, Trophy,
  MapPin, Calendar, Loader2, Globe, Users, School, Home, Target, Eye,
  Heart, ChevronDown, GraduationCap as GradCap,
  BookOpen, Crosshair, Sparkles, Menu, X, Baby, BookA,
  ShieldCheck, Goal, Compass, ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { portalService } from "@/services/portal.service";
import type { SchoolInfo, PortalPublication } from "@/types/portal";

// Coordenadas del colegio (modificar aquí para cambiar ubicación en el mapa)
const MAP_LAT = -12.0206;
const MAP_LNG = -77.1180;
const MAP_ZOOM = 16;

// ─── Sub-componentes memoizados ───────────────────────────────────────────────

const NavLinks = React.memo(function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const linkClass = "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 hover:text-white";
  const dropdownItemClass = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-100 md:text-[#15181F]";

  return (
    <>
      <a href="#inicio" onClick={onLinkClick} className={linkClass}>
        <Home className="h-4 w-4" />
        Inicio
      </a>

      <div className="group relative">
        <button className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 hover:text-white md:w-auto">
          <Target className="h-4 w-4" />
          Nosotros
          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-hover:rotate-180 md:ml-0" />
        </button>
        <div className="static mt-1 space-y-1 pl-6 md:invisible md:absolute md:left-0 md:top-full md:mt-2 md:w-64 md:rounded-2xl md:bg-white md:p-2.5 md:opacity-0 md:shadow-2xl md:transition-all md:group-hover:visible md:group-hover:opacity-70 lg:group-hover:opacity-100">
          <a href="#nosotros" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white"><Crosshair className="h-4 w-4" /></span>
            Objetivo
          </a>
          <a href="#nosotros" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-800 text-white"><Eye className="h-4 w-4" /></span>
            Visión
          </a>
          <a href="#nosotros" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-700 text-white"><ScrollText className="h-4 w-4" /></span>
            Misión
          </a>
          <a href="#nosotros" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-white"><Heart className="h-4 w-4" /></span>
            Valores
          </a>
        </div>
      </div>

      <div className="group relative">
        <button className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 hover:text-white md:w-auto">
          <School className="h-4 w-4" />
          Grados
          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-hover:rotate-180 md:ml-0" />
        </button>
        <div className="static mt-1 space-y-1 pl-6 md:invisible md:absolute md:left-0 md:top-full md:mt-2 md:w-64 md:rounded-2xl md:bg-white md:p-2.5 md:opacity-0 md:shadow-2xl md:transition-all md:group-hover:visible md:group-hover:opacity-70 lg:group-hover:opacity-100">
          <a href="#grados" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white"><Baby className="h-4 w-4" /></span>
            Inicial
          </a>
          <a href="#grados" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-800 text-white"><BookA className="h-4 w-4" /></span>
            Primaria
          </a>
          <a href="#grados" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-700 text-white"><GradCap className="h-4 w-4" /></span>
            Secundaria
          </a>
        </div>
      </div>

      <div className="group relative">
        <button className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 hover:text-white md:w-auto">
          <Sparkles className="h-4 w-4" />
          Novedades
          <ChevronDown className="ml-auto h-3 w-3 transition-transform group-hover:rotate-180 md:ml-0" />
        </button>
        <div className="static mt-1 space-y-1 pl-6 md:invisible md:absolute md:left-0 md:top-full md:mt-2 md:w-64 md:rounded-2xl md:bg-white md:p-2.5 md:opacity-0 md:shadow-2xl md:transition-all md:group-hover:visible md:group-hover:opacity-70 lg:group-hover:opacity-100">
          <a href="#noticias" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white"><Newspaper className="h-4 w-4" /></span>
            Noticias
          </a>
          <a href="#eventos" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-800 text-white"><CalendarDays className="h-4 w-4" /></span>
            Eventos
          </a>
          <a href="#logros" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-700 text-white"><Trophy className="h-4 w-4" /></span>
            Logros
          </a>
          <a href="#inscripciones" onClick={onLinkClick} className={dropdownItemClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-white"><ClipboardList className="h-4 w-4" /></span>
            Inscripciones
          </a>
        </div>
      </div>
    </>
  );
});

// ─── Secciones del portal ─────────────────────────────────────────────────────

const Navbar = React.memo(function Navbar({
  schoolInfo,
  mobileMenuOpen,
  onToggleMobile,
  onMobileLinkClick,
}: {
  schoolInfo: SchoolInfo | null;
  mobileMenuOpen: boolean;
  onToggleMobile: () => void;
  onMobileLinkClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30" style={{ backgroundColor: "#101B36" }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2" style={{ borderColor: "#E3A73A" }}>
            {schoolInfo?.logo ? (
              <img src={schoolInfo.logo} alt="Logo" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <GraduationCap className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-extrabold text-white">{schoolInfo?.name || "Institución Educativa"}</span>
            <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
              {schoolInfo?.ugel || "Institución Educativa Particular"}
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 text-sm font-semibold md:flex" style={{ color: "rgba(255,255,255,0.82)" }}>
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button size="sm" className="rounded-full font-bold text-white" style={{ backgroundColor: "#0B42C1" }} asChild>
            <Link to="/login">
              <LogIn className="h-4 w-4" />
              Ingresar
            </Link>
          </Button>
        </div>

        <button
          className="flex items-center justify-center rounded-lg p-2 text-white md:hidden"
          onClick={onToggleMobile}
          aria-label="Menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t md:hidden" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            <NavLinks onLinkClick={onMobileLinkClick} />
            <div className="mt-4 flex flex-col gap-2 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <Button size="sm" className="w-full rounded-full font-bold text-white" style={{ backgroundColor: "#DC2626" }} asChild>
                <a href="#inscripciones" onClick={onMobileLinkClick}>
                  <ClipboardList className="h-4 w-4" />
                  Inscripciones
                </a>
              </Button>
              <Button size="sm" className="w-full rounded-full font-bold text-white" style={{ backgroundColor: "#0B42C1" }} asChild>
                <Link to="/login" onClick={onMobileLinkClick}>
                  <LogIn className="h-4 w-4" />
                  Ingresar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

const HeroSection = React.memo(function HeroSection({ schoolInfo }: { schoolInfo: SchoolInfo | null }) {
  return (
    <section id="inicio" className="relative flex min-h-[600px] items-center overflow-hidden" style={{ padding: 0 }}>
      {schoolInfo?.banner && (
        <div className="absolute inset-0">
          <img src={schoolInfo.banner} alt="Banner institucional" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(115deg, rgba(196,80,45,0.55) 0%, rgba(16,27,54,0.55) 42%, rgba(11,20,40,0.92) 100%)",
          }} />
        </div>
      )}
      <div className="relative w-full px-4 py-24 md:py-32" style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold" style={{
          borderColor: "rgba(227,167,58,0.55)", backgroundColor: "rgba(227,167,58,0.16)", color: "#E3A73A",
        }}>
          <Globe className="h-3.5 w-3.5" />
          {schoolInfo?.ugel || "Institución Educativa"} · 2026
        </div>

        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Formando el <span style={{ color: "#E3A73A" }}>futuro educativo</span> de nuestra comunidad.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
          {schoolInfo?.mission || "Brindamos una educación integral de calidad, promoviendo el desarrollo académico, ético y social de nuestros estudiantes."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" className="rounded-full font-bold shadow-lg" style={{ backgroundColor: "#E3A73A", color: "#0B1428" }}>
            <ClipboardList className="h-4 w-4" />
            Inscripción Online 2027
          </Button>
          <Button variant="outline" size="lg" className="rounded-full font-bold" style={{
            borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.06)", color: "white",
          }}>
            Ver novedades
          </Button>
        </div>
      </div>
    </section>
  );
});

const FloatingBar = React.memo(function FloatingBar() {
  return (
    <div className="relative -mt-10 z-10 mx-auto px-4" style={{ maxWidth: "1240px" }}>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
          <div>
            <p className="text-sm font-bold" style={{ color: "#15181F" }}>Matrícula 2027 abierta</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>Inicia el proceso de admisión sin acercarte al plantel.</p>
          </div>
        </div>
        <Button size="sm" className="rounded-full font-bold text-white" style={{ backgroundColor: "#DC2626" }}>
          Inscribirme ahora
        </Button>
      </div>
    </div>
  );
});

const StatsSection = React.memo(function StatsSection() {
  return (
    <div className="py-10" style={{ backgroundColor: "#101B36", marginTop: "48px" }}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
        <div className="text-center">
          <p className="text-3xl font-extrabold" style={{ color: "#E3A73A" }}>612</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
            <Users className="h-4 w-4" /> Estudiantes
          </p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-extrabold" style={{ color: "#E3A73A" }}>38</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
            <GraduationCap className="h-4 w-4" /> Docentes
          </p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-extrabold" style={{ color: "#E3A73A" }}>3</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
            <School className="h-4 w-4" /> Niveles
          </p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-extrabold" style={{ color: "#E3A73A" }}>14</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
            <Users className="h-4 w-4" /> Personal Adm.
          </p>
        </div>
      </div>
    </div>
  );
});

const AboutSection = React.memo(function AboutSection({ schoolInfo }: { schoolInfo: SchoolInfo | null }) {
  const values = useMemo(() => {
    if (schoolInfo?.values) {
      return schoolInfo.values.split("\r\n").filter(Boolean);
    }
    return ["Respeto", "Responsabilidad", "Honestidad", "Solidaridad", "Empatía", "Compromiso", "Excelencia"];
  }, [schoolInfo?.values]);

  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#DC2626" }}>
          <Target className="h-3.5 w-3.5" /> Quiénes somos
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "#101B36" }}>Una comunidad educativa con propósito claro.</h2>
        <p className="mt-3 text-sm" style={{ color: "#6B7280" }}>Conoce los principios que guían nuestro trabajo día a día dentro y fuera del aula.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-7" style={{ borderColor: "rgba(15,20,35,0.10)" }}>
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
            <Goal className="h-6 w-6" />
          </span>
          <h3 className="text-lg font-bold" style={{ color: "#101B36" }}>Objetivo</h3>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#6B7280" }}>
            {schoolInfo?.objectives || "Fortalecer las competencias académicas, fomentar la investigación, promover el uso de tecnologías educativas y desarrollar valores para una convivencia democrática."}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-7" style={{ borderColor: "rgba(15,20,35,0.10)" }}>
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-800 text-white">
            <Compass className="h-6 w-6" />
          </span>
          <h3 className="text-lg font-bold" style={{ color: "#101B36" }}>Visión</h3>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#6B7280" }}>
            {schoolInfo?.vision || "Ser una institución educativa líder en la región, reconocida por la excelencia académica, la innovación pedagógica y la formación de ciudadanos comprometidos."}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-7" style={{ borderColor: "rgba(15,20,35,0.10)" }}>
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-700 text-white">
            <ScrollText className="h-6 w-6" />
          </span>
          <h3 className="text-lg font-bold" style={{ color: "#101B36" }}>Misión</h3>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#6B7280" }}>
            {schoolInfo?.mission || "Brindar una educación integral de calidad, promoviendo el desarrollo académico, ético y social de nuestros estudiantes mediante metodologías innovadoras e inclusivas."}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-7" style={{ borderColor: "rgba(15,20,35,0.10)" }}>
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h3 className="text-lg font-bold" style={{ color: "#101B36" }}>Valores</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {values.map((v) => (
              <span key={v} className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: "rgba(22,101,52,0.1)", color: "#166534" }}>
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

const GradesSection = React.memo(function GradesSection() {
  return (
    <section id="grados" className="border-y bg-white py-16" style={{ borderColor: "rgba(15,20,35,0.10)" }}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: "rgba(11,66,193,0.1)", color: "#0B42C1" }}>
            <BookOpen className="h-3.5 w-3.5" /> Oferta educativa
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "#101B36" }}>Grados y niveles</h2>
          <p className="mt-3 text-sm" style={{ color: "#6B7280" }}>Contamos con los tres niveles de educación básica regular, cada uno con una propuesta pedagógica adaptada a la edad del estudiante.</p>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white"><Baby className="h-4 w-4" /></span>
            <span className="text-sm font-bold" style={{ color: "#101B36" }}>Nivel Inicial</span>
            <span className="flex-1 h-px" style={{ backgroundColor: "rgba(15,20,35,0.10)" }}></span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {["3 años", "4 años", "5 años"].map((g) => (
              <span key={g} className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#101B36] hover:text-white" style={{ backgroundColor: "#F5F1E9", color: "#15181F", border: "1px solid rgba(15,20,35,0.10)" }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-800 text-white"><BookA className="h-4 w-4" /></span>
            <span className="text-sm font-bold" style={{ color: "#101B36" }}>Nivel Primaria</span>
            <span className="flex-1 h-px" style={{ backgroundColor: "rgba(15,20,35,0.10)" }}></span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {["1° Primaria", "2° Primaria", "3° Primaria", "4° Primaria", "5° Primaria", "6° Primaria"].map((g) => (
              <span key={g} className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#101B36] hover:text-white" style={{ backgroundColor: "#F5F1E9", color: "#15181F", border: "1px solid rgba(15,20,35,0.10)" }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-700 text-white"><GradCap className="h-4 w-4" /></span>
            <span className="text-sm font-bold" style={{ color: "#101B36" }}>Nivel Secundaria</span>
            <span className="flex-1 h-px" style={{ backgroundColor: "rgba(15,20,35,0.10)" }}></span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {["1° Secundaria", "2° Secundaria", "3° Secundaria", "4° Secundaria", "5° Secundaria"].map((g) => (
              <span key={g} className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#101B36] hover:text-white" style={{ backgroundColor: "#F5F1E9", color: "#15181F", border: "1px solid rgba(15,20,35,0.10)" }}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

const PublicationCard = React.memo(function PublicationCard({
  item,
  variant,
}: {
  item: PortalPublication;
  variant: "news" | "event" | "achievement";
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm" style={variant === "event" ? { borderTop: `3px solid ${item.background_color || "#101B36"}` } : undefined}>
      {item.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform hover:scale-105" loading="lazy" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-base" style={{ color: "#101B36" }}>{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm" style={{ color: "#6B7280" }}>
        <p className={variant === "achievement" ? "line-clamp-4" : "line-clamp-3"}>{item.description}</p>
        {variant === "news" && item.event_date && (
          <p className="mt-2 flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            {new Date(item.event_date).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}
        {variant === "event" && (
          <>
            <div className="mt-3 space-y-1 text-xs">
              {item.event_date && (
                <p className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.event_date).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
              {item.location && (
                <p className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </p>
              )}
              {item.is_virtual && item.event_url && (
                <a href={item.event_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-bold hover:underline" style={{ color: "#DC2626" }}>
                  <Globe className="h-3 w-3" />
                  Evento virtual
                </a>
              )}
            </div>
            {item.target_audience && (
              <p className="mt-2 text-xs italic" style={{ color: "rgba(107,114,128,0.7)" }}>Dirigido a: {item.target_audience}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

const NewsSection = React.memo(function NewsSection({ publications }: { publications: PortalPublication[] }) {
  const news = useMemo(
    () => publications.filter((p) => p.section === "Noticias" && p.status !== "ARCHIVED"),
    [publications]
  );

  return (
    <section id="noticias" className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center gap-2">
        <Newspaper className="h-5 w-5" style={{ color: "#101B36" }} />
        <h2 className="text-xl font-semibold" style={{ color: "#101B36" }}>Noticias</h2>
      </div>
      {news.length === 0 ? (
        <p className="text-sm" style={{ color: "#6B7280" }}>No hay noticias disponibles.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <PublicationCard key={item.id} item={item} variant="news" />
          ))}
        </div>
      )}
    </section>
  );
});

const EventsSection = React.memo(function EventsSection({ publications }: { publications: PortalPublication[] }) {
  const events = useMemo(
    () => publications.filter((p) => p.section === "Eventos" && p.status !== "ARCHIVED"),
    [publications]
  );

  return (
    <section id="eventos" className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center gap-2">
        <CalendarDays className="h-5 w-5" style={{ color: "#101B36" }} />
        <h2 className="text-xl font-semibold" style={{ color: "#101B36" }}>Eventos</h2>
      </div>
      {events.length === 0 ? (
        <p className="text-sm" style={{ color: "#6B7280" }}>No hay eventos disponibles.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((item) => (
            <PublicationCard key={item.id} item={item} variant="event" />
          ))}
        </div>
      )}
    </section>
  );
});

const AchievementsSection = React.memo(function AchievementsSection({ publications }: { publications: PortalPublication[] }) {
  const achievements = useMemo(
    () => publications.filter((p) => p.section === "Logros" && p.status !== "ARCHIVED"),
    [publications]
  );

  return (
    <section id="logros" className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="h-5 w-5" style={{ color: "#E3A73A" }} />
        <h2 className="text-xl font-semibold" style={{ color: "#101B36" }}>Logros</h2>
      </div>
      {achievements.length === 0 ? (
        <p className="text-sm" style={{ color: "#6B7280" }}>No hay logros disponibles.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((item) => (
            <PublicationCard key={item.id} item={item} variant="achievement" />
          ))}
        </div>
      )}
    </section>
  );
});

const InscriptionsSection = React.memo(function InscriptionsSection() {
  return (
    <section id="inscripciones" className="mx-auto max-w-6xl px-4 py-12">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle style={{ color: "#101B36" }}>Inscripciones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm" style={{ color: "#6B7280" }}>
          El módulo de inscripciones se habilitará próximamente. Esta sección queda reservada para esa funcionalidad.
        </CardContent>
      </Card>
    </section>
  );
});

// Lazy load sections that are below the fold
const MapSection = lazy(() => import("./sections/MapSection"));
const FooterSection = lazy(() => import("./sections/FooterSection"));

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PortalPage() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [publications, setPublications] = useState<PortalPublication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [info, pubs] = await Promise.all([
          portalService.getSchoolInfo(),
          portalService.getPublications({ limit: 50 }),
        ]);
        if (!cancelled) {
          setSchoolInfo(info);
          setPublications(pubs ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading portal data:", err);
          setError("No se pudo cargar la información del portal.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const handleToggleMobile = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMobileLinkClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E9" }}>
      <Navbar
        schoolInfo={schoolInfo}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobile={handleToggleMobile}
        onMobileLinkClick={handleMobileLinkClick}
      />

      <main>
        <HeroSection schoolInfo={schoolInfo} />
        <FloatingBar />
        <StatsSection />
        <AboutSection schoolInfo={schoolInfo} />
        <GradesSection />
        <NewsSection publications={publications} />
        <EventsSection publications={publications} />
        <AchievementsSection publications={publications} />
        <InscriptionsSection />

        <Suspense fallback={<div className="h-96" />}>
          <MapSection schoolInfo={schoolInfo} />
        </Suspense>

        <Suspense fallback={<div className="h-64" />}>
          <FooterSection schoolInfo={schoolInfo} />
        </Suspense>
      </main>
    </div>
  );
}