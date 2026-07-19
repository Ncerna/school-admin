import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AssignmentTab } from "./AssignmentTab";
import { ReportTab } from "./ReportTab";

// Main Page Component
export default function GradeCoursesPage() {
  return (
    <div>
      <PageHeader
        title="Asignación de Cursos a Grados"
        description="Asigna cursos a grados y consulta el reporte de asignaciones."
      />

      <Tabs defaultValue="assignment" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="assignment">Asignación de cursos</TabsTrigger>
          <TabsTrigger value="report">Reporte de asignaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="assignment">
          <AssignmentTab />
        </TabsContent>

        <TabsContent value="report">
          <ReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}