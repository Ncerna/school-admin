import React from "react";
import { MapPin } from "lucide-react";
import type { SchoolInfo } from "@/types/portal";

const MAP_LAT = -12.0206;
const MAP_LNG = -77.1180;
const MAP_ZOOM = 16;

const MapSection = React.memo(function MapSection({ schoolInfo }: { schoolInfo: SchoolInfo | null }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12">
      <div className="mb-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#DC2626" }}>
          <MapPin className="h-3.5 w-3.5" /> Cómo llegar
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "#101B36" }}>Ubicación del colegio</h2>
        <p className="mt-3 text-sm" style={{ color: "#6B7280" }}>
          {schoolInfo?.address || "Conoce nuestra ubicación y ven a visitarnos."}
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border shadow-sm" style={{ borderColor: "rgba(15,20,35,0.10)" }}>
        <iframe
          title="Ubicación del colegio en Google Maps"
          width="100%"
          height="380"
          style={{ border: 0, display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}&z=${MAP_ZOOM}&output=embed`}
        />
      </div>
      <p className="mt-3 text-center text-xs" style={{ color: "#9CA3AF" }}>
        Lat: {MAP_LAT} · Lng: {MAP_LNG} · Puedes modificar MAP_LAT y MAP_LNG al inicio del componente
      </p>
    </section>
  );
});

export default MapSection;