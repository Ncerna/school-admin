import { PageHeader } from "@/components/shared/PageHeader";

export default function PreferencesPage() {
  return (
    <div>
      <PageHeader title="Preferencias" description="Configuración de preferencias del sistema." />
      
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Esta sección está en desarrollo
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Próximamente podrás configurar las preferencias del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}