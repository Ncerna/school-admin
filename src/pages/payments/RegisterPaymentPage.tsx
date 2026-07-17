import { useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChargesPaymentPanel } from "@/components/payments/ChargesPaymentPanel";
import { ENDPOINTS } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";

// Charge type labels mapping
const chargeTypeLabels: Record<string, string> = {
  ENROLLMENT: "Matrícula",
  TUITION: "Pensión",
  SUPPLIES: "Útiles",
};

// Get the correct endpoint based on charge type
function getSubmitEndpoint(chargeType: string | undefined, enrollmentId: number): string {
  if (chargeType === "ENROLLMENT") return ENDPOINTS.payEnrollment(enrollmentId);
  if (chargeType === "TUITION") return ENDPOINTS.payTuition(enrollmentId);
  if (chargeType === "SUPPLIES") return ENDPOINTS.paySupplies(enrollmentId);
  return ENDPOINTS.payments;
}

export default function RegisterPaymentPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const [searchParams] = useSearchParams();
  const id = Number(enrollmentId);
  
  // Get chargeType from URL query parameter
  const chargeTypeFilter = searchParams.get("chargeType") || undefined;
  const pageTitle = chargeTypeFilter 
    ? `Pagar ${chargeTypeLabels[chargeTypeFilter] || "cobro"}` 
    : "Registrar pago";

  // Fetch enrollment to get student name
  const [studentName, setStudentName] = useState<string>("");
  useEffect(() => {
    apiClient.get<{ studentName: string }>(`${ENDPOINTS.enrollments}/${enrollmentId}`)
      .then(data => setStudentName(data.studentName))
      .catch(() => setStudentName(""));
  }, [enrollmentId]);

  return (
    <div>
      <PageHeader
        title={pageTitle}
        description={`Matrícula #${enrollmentId} - ${studentName}`}
      />
      
      <ChargesPaymentPanel
        payableId={id}
        chargeTypeFilter={chargeTypeFilter}
        submitEndpoint={getSubmitEndpoint(chargeTypeFilter, id)}
        studentName={studentName}
      />
    </div>
  );
}