import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SummaryTab } from "./SummaryTab";
import { DetailTab } from "./DetailTab";

// Main Page Component
export default function EvaluationCriteriaPage() {
  return (
    <div>
      <PageHeader
        title="Criterios de Evaluación"
        description="Configura los criterios de evaluación para cada curso en cada período académico."
      />

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="detail">Configurar criterios</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <SummaryTab />
        </TabsContent>

        <TabsContent value="detail">
          <DetailTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}