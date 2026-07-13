import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChargesPaymentPanel } from "@/components/payments/ChargesPaymentPanel";
import { ENDPOINTS } from "@/lib/endpoints";

export default function PayTuitionPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const id = Number(enrollmentId);

  return (
    <div>
      <PageHeader
        title="Pagar pensiones"
        description={`Matrícula #${enrollmentId}`}
      />
      
      <ChargesPaymentPanel
        payableId={id}
        chargeTypeFilter="TUITION"
        submitEndpoint={ENDPOINTS.payTuition(id)}
      />
    </div>
  );
}