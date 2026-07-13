import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import { Badge } from "@/components/ui/badge";
import type { EnrollmentListItem } from "@/types";

interface PaymentSearchPageProps {
  targetRoute?: string;
}

// Helper to check if enrollment is active (handles both "Activo" and "Active")
function isActiveStatus(status: string): boolean {
  return status === "Activo" || status === "Active";
}

export default function PaymentSearchPage({ targetRoute = "/pagos/matricula" }: PaymentSearchPageProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<EnrollmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!search.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ items: EnrollmentListItem[] }>(ENDPOINTS.enrollments, { search });
      setResults(response.items);
    } catch (err) {
      setError("Error al buscar estudiantes.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelect(enrollment: EnrollmentListItem) {
    if (isActiveStatus(enrollment.status)) {
      navigate(`${targetRoute}/${enrollment.id}`);
    } else {
      setError("Este estudiante no tiene una matrícula activa.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Buscar estudiante"
        description="Busque un estudiante para registrar su pago de matrícula."
      />

      <div className="mb-4 flex gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o DNI..."
        />
        <Button onClick={handleSearch} disabled={isLoading || !search.trim()}>
          <Search className="h-4 w-4" />
          Buscar
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-sm font-medium">Estudiante</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Grado</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Año</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {results.map((enrollment) => (
                <tr key={enrollment.id} className="border-b">
                  <td className="px-4 py-2 text-sm">{enrollment.studentName}</td>
                  <td className="px-4 py-2 text-sm">{enrollment.gradeName}</td>
                  <td className="px-4 py-2 text-sm">{enrollment.yearName}</td>
                  <td className="px-4 py-2 text-sm">
                    <Badge variant={isActiveStatus(enrollment.status) ? "success" : "secondary"}>
                      {enrollment.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      size="sm"
                      onClick={() => handleSelect(enrollment)}
                    >
                      Seleccionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {search && results.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">No se encontraron resultados.</p>
      )}
    </div>
  );
}