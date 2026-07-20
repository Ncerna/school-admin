import { PageHeader } from "@/components/shared/PageHeader";

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="Perfil" description="Gestión de tu perfil de usuario." />
      
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Esta sección está en desarrollo
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Próximamente podrás ver y editar tu perfil.
          </p>
        </div>
      </div>
    </div>
  );
}