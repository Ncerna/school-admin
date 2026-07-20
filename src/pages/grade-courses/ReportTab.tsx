import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { gradeCoursesService, type GradeCourseTreeItem } from "@/services/grade-courses.service";
import type { AcademicYearOption, GradeOption } from "@/types/grade-course";

// Tree item component
interface TreeItemProps {
  label: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  courseCount?: number;
}

function TreeItem({ label, icon, children, defaultExpanded = true, courseCount }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-l border-border/50 ml-2">
      <div className="flex items-center gap-2 py-2 px-3 hover:bg-muted/30 rounded-md">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {icon}
        <span className="font-medium text-sm">{label}</span>
        {courseCount !== undefined && (
          <span className="text-xs text-muted-foreground ml-2">
            {courseCount === 0 ? "Sin cursos asignados" : `${courseCount} ${courseCount === 1 ? "curso" : "cursos"}`}
          </span>
        )}
      </div>
      {isExpanded && children && (
        <div className="ml-4">{children}</div>
      )}
    </div>
  );
}

// Course item component
function CourseItem({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 py-1 px-3 text-sm text-muted-foreground">
      <span className="w-1 h-1 bg-primary rounded-full"></span>
      <span>{name}</span>
    </div>
  );
}

export function ReportTab() {
  // Use the centralized useOptions hook for academic years
  const { options: academicYearOptions, isLoading: isLoadingYears } = useOptions<AcademicYearOption>(
    ENDPOINTS.AcademicYears,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  // Use the centralized useOptions hook for grades
  const { options: gradeOptions, isLoading: isLoadingGrades } = useOptions<GradeOption>(
    ENDPOINTS.grades,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [treeData, setTreeData] = useState<GradeCourseTreeItem[]>([]);
  const [gradeCatalog, setGradeCatalog] = useState<GradeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tree data when year is selected
  useEffect(() => {
    if (!selectedYearId) {
      setTreeData([]);
      setGradeCatalog([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [tree, grades] = await Promise.all([
          gradeCoursesService.getTree(Number(selectedYearId)),
          gradeCoursesService.getGrades(),
        ]);
        // API returns { items: [...] } inside data, or direct array
        const treeItems = Array.isArray(tree)
          ? tree
          : Array.isArray(tree?.items)
            ? tree.items
            : [];
        setTreeData(treeItems);
        setGradeCatalog(grades);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los datos");
        setTreeData([]);
        setGradeCatalog([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYearId]);

  // Build hierarchical data structure - only 2 levels: Grade -> Courses
  const hierarchicalData = useMemo(() => {
    // Group courses by grade using gradeId as key
    const gradesMap: Record<number, { id: number; name: string; levelName: string; courses: string[] }> = {};

    // Initialize with all grades from catalog
    gradeCatalog.forEach(grade => {
      gradesMap[grade.id] = {
        id: grade.id,
        name: grade.name,
        levelName: grade.levelName || "",
        courses: [],
      };
    });

    // Add courses from tree data - match by gradeId
    // Also add grades that are in treeData but not in gradeCatalog
    treeData.forEach(item => {
      if (!gradesMap[item.gradeId]) {
        // Grade not in catalog, add it from treeData
        gradesMap[item.gradeId] = {
          id: item.gradeId,
          name: item.gradeName,
          levelName: item.levelName || "",
          courses: [],
        };
      }
      
      gradesMap[item.gradeId].courses.push(item.courseName);
    });

    return gradesMap;
  }, [gradeCatalog, treeData]);

  // Filter grades by selected grade (if any)
  const filteredGrades = useMemo(() => {
    if (!selectedGradeId) return hierarchicalData;
    
    const filtered: typeof hierarchicalData = {};
    const gradeId = Number(selectedGradeId);
    if (hierarchicalData[gradeId]) {
      filtered[gradeId] = hierarchicalData[gradeId];
    }
    return filtered;
  }, [hierarchicalData, selectedGradeId]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Año Académico:</span>
          <Select value={selectedYearId} onValueChange={setSelectedYearId} disabled={isLoadingYears}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              {academicYearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Grado:</span>
          <Select 
            value={selectedGradeId} 
            onValueChange={setSelectedGradeId} 
            disabled={!selectedYearId || isLoadingGrades}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos los grados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los grados</SelectItem>
              {Object.entries(hierarchicalData).map(([gradeId, gradeInfo]) => (
                <SelectItem key={gradeId} value={gradeId}>
                  {gradeInfo.levelName ? `${gradeInfo.name} (${gradeInfo.levelName})` : gradeInfo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedYearId ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Seleccione un año académico para ver el reporte de cursos.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando reporte...</p>
          </div>
        </div>
      ) : Object.keys(filteredGrades).length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No hay grados registrados para este año académico.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          {Object.entries(filteredGrades).map(([gradeKey, gradeInfo]) => {
            // Build display name: "gradeName (levelName)"
            const displayName = gradeInfo.levelName
              ? `${gradeInfo.name} (${gradeInfo.levelName})`
              : gradeInfo.name;

            return (
              <TreeItem
                key={gradeKey}
                label={displayName}
                icon={<BookMarked className="h-4 w-4" />}
                courseCount={gradeInfo.courses.length}
              >
                {gradeInfo.courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-6 py-2">Sin cursos asignados</p>
                ) : (
                  gradeInfo.courses.map((course) => (
                    <CourseItem key={course} name={course} />
                  ))
                )}
              </TreeItem>
            );
          })}
        </div>
      )}
    </div>
  );
}