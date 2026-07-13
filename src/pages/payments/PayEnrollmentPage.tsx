import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChargesPaymentPanel } from "@/components/payments/ChargesPaymentPanel";
import { ENDPOINTS } from "@/lib/endpoints";

export default function PayEnrollmentPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const id = Number(enrollmentId);

  return (
    <div>
      <PageHeader
        title="Completar pago de matrícula"
        description={`Matrícula #${enrollmentId}`}
      />
      
      <ChargesPaymentPanel
        payableId={id}
        chargeTypeFilter="ENROLLMENT"
        submitEndpoint={ENDPOINTS.payEnrollment(id)}
      />
    </div>
  );
}