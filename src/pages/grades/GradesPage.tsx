import { PageHeader } from "@/components/shared/PageHeader";

export default function GradesPage() {
  return (
    <div>
      <PageHeader title="Notas y Calificaciones" description="Gestión de calificaciones de estudiantes." />
      
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Esta sección está en desarrollo
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Próximamente podrás registrar y consultar notas de los estudiantes.
          </p>
        </div>
      </div>
    </div>
  );
}