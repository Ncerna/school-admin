import React from "react";
import { GraduationCap, MapPin } from "lucide-react";
import type { SchoolInfo } from "@/types/portal";

const FooterSection = React.memo(function FooterSection({ schoolInfo }: { schoolInfo: SchoolInfo | null }) {
  return (
    <footer style={{ backgroundColor: "#0B1428" }}>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <div className="mb-3 flex items-center justify-center gap-3 md:justify-start">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2" style={{ borderColor: "#E3A73A" }}>
                {schoolInfo?.logo ? (
                  <img src={schoolInfo.logo} alt="Logo" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <GraduationCap className="h-5 w-5 text-white" />
                )}
              </div>
              <span className="text-base font-extrabold text-white">{schoolInfo?.name || "Institución Educativa"}</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {schoolInfo?.mission?.slice(0, 120) || "Formando ciudadanos íntegros y comprometidos con el desarrollo de nuestra comunidad."}
            </p>
          </div>
          <div className="text-left">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#E3A73A" }}>Contacto</p>
            {schoolInfo?.address && (
              <p className="mb-2 flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
                <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: "#E3A73A" }} />
                {schoolInfo.address}
              </p>
            )}
            {schoolInfo?.phone && (
              <p className="mb-2 flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
                <span className="h-4 w-4 flex-shrink-0" style={{ color: "#E3A73A" }}>📞</span>
                {schoolInfo.phone}
              </p>
            )}
            {schoolInfo?.email && (
              <p className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
                <span className="h-4 w-4 flex-shrink-0" style={{ color: "#E3A73A" }}>✉️</span>
                {schoolInfo.email}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="border-t py-5" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>
          <span>© {new Date().getFullYear()} {schoolInfo?.name || "Institución Educativa"}. Todos los derechos reservados.</span>
          <span>{schoolInfo?.ugel || "UGEL"}</span>
        </div>
      </div>
    </footer>
  );
});

export default FooterSection;