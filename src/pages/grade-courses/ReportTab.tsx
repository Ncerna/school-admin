import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight, BookOpen, BookMarked, Edit } from "lucide-react";
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
  onEdit?: () => void;
}

function TreeItem({ label, icon, children, defaultExpanded = true, courseCount, onEdit }: TreeItemProps) {
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
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={onEdit}
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
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

const [selectedYearId, setSelectedYearId] = useState<string>("");
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
        console.log('Tree response:', tree);
        const treeItems = Array.isArray(tree) 
          ? tree 
          : Array.isArray(tree?.items) 
            ? tree.items 
            : [];
        setTreeData(treeItems);
        setGradeCatalog(grades);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : "Error al cargar los datos");
        setTreeData([]);
        setGradeCatalog([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYearId]);

// Build hierarchical data structure
  const hierarchicalData = useMemo(() => {
    if (!gradeCatalog.length) return {};

    // Group grades by level
    const levelsMap: Record<string, { grades: Record<string, { id: number; name: string; courses: string[] }> }> = {};

    // Initialize with all grades from catalog
    gradeCatalog.forEach(grade => {
      const levelName = grade.levelName || "Sin nivel";
      if (!levelsMap[levelName]) {
        levelsMap[levelName] = { grades: {} };
      }
      levelsMap[levelName].grades[grade.name] = {
        id: grade.id,
        name: grade.name,
        courses: [],
      };
    });

    // Add courses from tree data
    treeData.forEach(item => {
      if (levelsMap[item.levelName]?.grades[item.gradeName]) {
        levelsMap[item.levelName].grades[item.gradeName].courses.push(item.courseName);
      }
    });

    return levelsMap;
  }, [gradeCatalog, treeData]);

  // Handle edit click - navigate to edit modal
  const handleEdit = (yearId: number, gradeId: number) => {
    // Navigate to the edit modal in AssignmentTab
    // This would need to be implemented with router navigation
    console.log(`Edit grade ${gradeId} for year ${yearId}`);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

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
      ) : Object.keys(hierarchicalData).length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No hay grados registrados para este año académico.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          {Object.entries(hierarchicalData).map(([levelName, levelData]) => (
            <TreeItem key={levelName} label={levelName} icon={<BookOpen className="h-4 w-4" />}>
              {Object.entries(levelData.grades).map(([gradeName, gradeInfo]) => (
                <TreeItem
                  key={gradeName}
                  label={gradeName}
                  icon={<BookMarked className="h-4 w-4" />}
                  courseCount={gradeInfo.courses.length}
                  onEdit={() => handleEdit(Number(selectedYearId), gradeInfo.id)}
                >
                  {gradeInfo.courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-6 py-2">Sin cursos asignados</p>
                  ) : (
                    gradeInfo.courses.map((course) => (
                      <CourseItem key={course} name={course} />
                    ))
                  )}
                </TreeItem>
              ))}
            </TreeItem>
          ))}
        </div>
      )}
    </div>
  );
}