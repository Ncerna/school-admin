import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChargesPaymentPanel } from "@/components/payments/ChargesPaymentPanel";
import { ENDPOINTS } from "@/lib/endpoints";

export default function RegisterPaymentPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const id = Number(enrollmentId);

  return (
    <div>
      <PageHeader
        title="Registrar pago"
        description={`Matrícula #${enrollmentId}`}
      />
      
      <ChargesPaymentPanel
        payableId={id}
        submitEndpoint={ENDPOINTS.payments}
      />
    </div>
  );
}