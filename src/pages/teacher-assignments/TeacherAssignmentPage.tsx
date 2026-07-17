import React, { useState, useEffect, useCallback, useRef } from "react";
import { Save, X, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { teacherAssignmentsService } from "@/services/teacher-assignments.service";
import { ApiError } from "@/types/api";
import type { TeacherAssignmentTree, GradeAssignment, ReportFilters, ReportTeacher } from "@/types/teacher-assignment";

// Screen A: Assignment Tree Component
interface AssignmentTreeProps {
  data: TeacherAssignmentTree | null;
  onDataChange: (data: TeacherAssignmentTree) => void;
  hasChanges: boolean;
}

function AssignmentTree({ data, onDataChange, hasChanges }: AssignmentTreeProps) {
  const [localData, setLocalData] = useState<TeacherAssignmentTree | null>(null);
  const [expandedGrades, setExpandedGrades] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Sync with server data
  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle grade checkbox change
  const handleGradeToggle = (gradeId: number) => {
    if (!localData) return;

    const grade = localData.grades.find((g) => g.gradeId === gradeId);
    if (!grade) return;

    // If unchecking and has assigned courses, show confirmation
    const hasAssignedCourses = grade.courses.some((c) => c.assigned);
    if (grade.assigned && hasAssignedCourses) {
      if (!confirm("¿Desea quitar este grado y todos sus cursos asignados?")) {
        return;
      }
    }

    const updatedGrades = localData.grades.map((g) => {
      if (g.gradeId === gradeId) {
        const newAssigned = !g.assigned;
        return {
          ...g,
          assigned: newAssigned,
          courses: g.courses.map((c) => ({
            ...c,
            assigned: newAssigned ? c.assigned : false,
          })),
        };
      }
      return g;
    });

    setLocalData({ ...localData, grades: updatedGrades });
    onDataChange({ ...localData, grades: updatedGrades });

    // Auto-expand when assigning
    if (!grade.assigned) {
      setExpandedGrades((prev) => new Set(prev).add(gradeId));
    }
  };

  // Handle course checkbox change
  const handleCourseToggle = (gradeId: number, gradeCourseId: number) => {
    if (!localData) return;

    const updatedGrades = localData.grades.map((g) => {
      if (g.gradeId === gradeId) {
        return {
          ...g,
          courses: g.courses.map((c) =>
            c.gradeCourseId === gradeCourseId ? { ...c, assigned: !c.assigned } : c
          ),
        };
      }
      return g;
    });

    setLocalData({ ...localData, grades: updatedGrades });
    onDataChange({ ...localData, grades: updatedGrades });
  };

  // Handle select all courses in a grade
  const handleSelectAll = (gradeId: number) => {
    if (!localData) return;

    const updatedGrades = localData.grades.map((g) => {
      if (g.gradeId === gradeId) {
        return {
          ...g,
          courses: g.courses.map((c) => ({ ...c, assigned: true })),
        };
      }
      return g;
    });

    setLocalData({ ...localData, grades: updatedGrades });
    onDataChange({ ...localData, grades: updatedGrades });
  };

  // Handle remove all courses in a grade
  const handleRemoveAll = (gradeId: number) => {
    if (!localData) return;

    const updatedGrades = localData.grades.map((g) => {
      if (g.gradeId === gradeId) {
        return {
          ...g,
          courses: g.courses.map((c) => ({ ...c, assigned: false })),
        };
      }
      return g;
    });

    setLocalData({ ...localData, grades: updatedGrades });
    onDataChange({ ...localData, grades: updatedGrades });
  };

  // Toggle grade expansion
  const toggleGradeExpansion = (gradeId: number) => {
    if (isMobile) {
      // On mobile, only one grade expanded at a time
      setExpandedGrades((prev) => {
        const newSet = new Set<number>();
        if (!prev.has(gradeId)) {
          newSet.add(gradeId);
        }
        return newSet;
      });
    } else {
      setExpandedGrades((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(gradeId)) {
          newSet.delete(gradeId);
        } else {
          newSet.add(gradeId);
        }
        return newSet;
      });
    }
  };

  // Get count of assigned courses
  const getAssignedCount = (grade: GradeAssignment) => {
    const count = grade.courses.filter((c) => c.assigned).length;
    return `${count}/${grade.courses.length} cursos`;
  };

  if (!localData) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">No hay datos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {localData.grades.map((grade) => {
        const isExpanded = expandedGrades.has(grade.gradeId);
        const hasAssignedCourses = grade.courses.some((c) => c.assigned);

        return (
          <div key={grade.gradeId} className="border rounded-md">
            <div className="flex items-center p-3 bg-muted/30">
              <button
                type="button"
                onClick={() => toggleGradeExpansion(grade.gradeId)}
                className="mr-2"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <Checkbox
                checked={grade.assigned}
                onCheckedChange={() => handleGradeToggle(grade.gradeId)}
              />
              <span className="ml-2 font-medium">{grade.gradeName}</span>
              <span className="ml-auto text-sm text-muted-foreground">
                {getAssignedCount(grade)}
              </span>
            </div>

            {isExpanded && (
              <div className="p-3 pl-10 space-y-2 border-t">
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(grade.gradeId)}
                    className="text-xs text-primary hover:underline"
                    disabled={!grade.assigned}
                  >
                    Seleccionar todos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAll(grade.gradeId)}
                    className="text-xs text-primary hover:underline"
                    disabled={!grade.assigned}
                  >
                    Quitar todos
                  </button>
                </div>
                {grade.courses.map((course) => (
                  <label
                    key={course.gradeCourseId}
                    className={`flex items-center gap-2 text-sm ${
                      !grade.assigned ? "opacity-50" : ""
                    }`}
                  >
                    <Checkbox
                      checked={course.assigned}
                      onCheckedChange={() => handleCourseToggle(grade.gradeId, course.gradeCourseId)}
                      disabled={!grade.assigned}
                    />
                    {course.courseName}
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Screen B: Report Component
interface ReportTreeProps {
  data: ReportTeacher[];
  isLoading: boolean;
}

function ReportTree({ data, isLoading }: ReportTreeProps) {
  const [expandedTeachers, setExpandedTeachers] = useState<Set<number>>(new Set());
  const [expandedReportGrades, setExpandedReportGrades] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleTeacherExpansion = (teacherId: number) => {
    if (isMobile) {
      setExpandedTeachers((prev) => {
        const newSet = new Set<number>();
        if (!prev.has(teacherId)) {
          newSet.add(teacherId);
        }
        return newSet;
      });
    } else {
      setExpandedTeachers((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(teacherId)) {
          newSet.delete(teacherId);
        } else {
          newSet.add(teacherId);
        }
        return newSet;
      });
    }
  };

  const toggleReportGradeExpansion = (key: string) => {
    if (isMobile) {
      setExpandedReportGrades((prev) => {
        const newSet = new Set<string>();
        if (!prev.has(key)) {
          newSet.add(key);
        }
        return newSet;
      });
    } else {
      setExpandedReportGrades((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No se encontraron resultados para los filtros seleccionados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((teacher) => {
        const isTeacherExpanded = expandedTeachers.has(teacher.teacherId);

        return (
          <div key={teacher.teacherId} className="border rounded-md">
            <div className="flex items-center p-3 bg-muted/30">
              <button
                type="button"
                onClick={() => toggleTeacherExpansion(teacher.teacherId)}
                className="mr-2"
              >
                {isTeacherExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <span className="font-medium">{teacher.teacherName}</span>
            </div>

            {isTeacherExpanded && (
              <div className="p-3 pl-10 space-y-2 border-t">
                {teacher.grades.map((grade) => {
                  const gradeKey = `${teacher.teacherId}-${grade.gradeId}`;
                  const isGradeExpanded = expandedReportGrades.has(gradeKey);

                  return (
                    <div key={gradeKey} className="border-l-2 pl-4">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => toggleReportGradeExpansion(gradeKey)}
                          className="mr-2"
                        >
                          {isGradeExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                        <span className="text-sm font-medium">{grade.gradeName}</span>
                      </div>

                      {isGradeExpanded && (
                        <ul className="mt-2 ml-6 space-y-1">
                          {grade.courses.map((course) => (
                            <li key={course.courseId} className="text-sm text-muted-foreground">
                              • {course.courseName}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Main Page Component
export default function TeacherAssignmentPage() {
  // Screen A state
  const [academicYearOptions, setAcademicYearOptions] = useState<
    { value: string; label: string; active: boolean }[]
  >([]);
  const [teacherOptions, setTeacherOptions] = useState<{ value: string; label: string; document: string }[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [treeData, setTreeData] = useState<TeacherAssignmentTree | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const originalTreeDataRef = useRef<TeacherAssignmentTree | null>(null);

  // Screen B state
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    academicYearId: 0,
    teacherId: null,
    gradeId: null,
    courseId: null,
  });
  const [reportData, setReportData] = useState<ReportTeacher[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [gradeOptions, setGradeOptions] = useState<{ value: string; label: string }[]>([]);
  const [courseOptions, setCourseOptions] = useState<{ value: string; label: string }[]>([]);

  // Load options on mount
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [years, teachers, grades, courses] = await Promise.all([
        teacherAssignmentsService.getAcademicYears(),
        teacherAssignmentsService.getTeachers(),
        teacherAssignmentsService.getGrades(),
        teacherAssignmentsService.getCourses(),
      ]);

      setAcademicYearOptions(
        years.map((y) => ({ value: String(y.id), label: y.name, active: y.active }))
      );
      setTeacherOptions(
        teachers.map((t) => ({ value: String(t.id), label: t.fullName, document: t.document }))
      );
      setGradeOptions(grades.map((g) => ({ value: String(g.id), label: g.name })));
      setCourseOptions(courses.map((c) => ({ value: String(c.id), label: c.name })));
    } catch (err) {
      console.error("Error loading options:", err);
    }
  };

  // Load tree data when year and teacher are selected
  const loadTree = useCallback(async () => {
    if (!selectedYearId || !selectedTeacherId) {
      setTreeData(null);
      return;
    }

    setIsLoadingTree(true);
    setError(null);
    try {
      const data = await teacherAssignmentsService.getTree(
        Number(selectedYearId),
        Number(selectedTeacherId)
      );
      setTreeData(data);
      originalTreeDataRef.current = data;
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar los datos.");
    } finally {
      setIsLoadingTree(false);
    }
  }, [selectedYearId, selectedTeacherId]);

  // Handle data change in tree
  const handleTreeDataChange = (data: TeacherAssignmentTree) => {
    setHasChanges(true);
  };

  // Handle cancel - restore original data
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("¿Descartar los cambios no guardados?")) {
        if (originalTreeDataRef.current) {
          setTreeData(originalTreeDataRef.current);
          setHasChanges(false);
        }
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!treeData) return;

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        academicYearId: treeData.academicYearId,
        teacherId: treeData.teacher.id,
        grades: treeData.grades.map((g) => ({
          gradeId: g.gradeId,
          assigned: g.assigned,
          courses: g.courses.map((c) => ({
            gradeCourseId: c.gradeCourseId,
            assigned: c.assigned,
          })),
        })),
      };

      await teacherAssignmentsService.save(payload);
      // Refresh tree after save
      await loadTree();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle year/teacher change with unsaved changes check
  const handleYearChange = (value: string) => {
    if (hasChanges && !confirm("¿Descartar los cambios no guardados?")) {
      return;
    }
    setSelectedYearId(value);
    setSelectedTeacherId("");
    setTreeData(null);
    setHasChanges(false);
  };

  const handleTeacherChange = (value: string) => {
    if (hasChanges && !confirm("¿Descartar los cambios no guardados?")) {
      return;
    }
    setSelectedTeacherId(value);
  };

  // Load tree when both selections are made
  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Screen B: Search report
  const handleSearchReport = async () => {
    if (!reportFilters.academicYearId) return;

    setIsLoadingReport(true);
    try {
      const data = await teacherAssignmentsService.searchReport(reportFilters);
      setReportData(data.teachers);
    } catch (err) {
      console.error("Error loading report:", err);
      setReportData([]);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Handle report filter changes
  const handleReportYearChange = (value: string) => {
    setReportFilters((prev) => ({
      ...prev,
      academicYearId: Number(value),
      teacherId: null,
      gradeId: null,
      courseId: null,
    }));
  };

  const handleReportTeacherChange = (value: string) => {
    setReportFilters((prev) => ({
      ...prev,
      teacherId: value ? Number(value) : null,
    }));
  };

  const handleReportGradeChange = (value: string) => {
    setReportFilters((prev) => ({
      ...prev,
      gradeId: value ? Number(value) : null,
    }));
  };

  const handleReportCourseChange = (value: string) => {
    setReportFilters((prev) => ({
      ...prev,
      courseId: value ? Number(value) : null,
    }));
  };

  return (
    <div>
      <PageHeader
        title="Asignación de Grados y Cursos a Docentes"
        description="Asigna grados y cursos a docentes, y consulta el reporte de asignaciones."
      />

      <Tabs defaultValue="assignment" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="assignment">Asignación docente</TabsTrigger>
          <TabsTrigger value="report">Reporte de asignaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="assignment">
          <div className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Año Académico:</span>
                <Select value={selectedYearId} onValueChange={handleYearChange}>
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
                <span className="text-sm font-medium">Docente:</span>
                <Select value={selectedTeacherId} onValueChange={handleTeacherChange} disabled={!selectedYearId}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Seleccionar docente" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!selectedYearId || !selectedTeacherId ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  Seleccione un año académico y un docente para ver las asignaciones.
                </p>
              </div>
            ) : isLoadingTree ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Cargando árbol de asignaciones...</p>
                </div>
              </div>
            ) : (
              <AssignmentTree
                data={treeData}
                onDataChange={handleTreeDataChange}
                hasChanges={hasChanges}
              />
            )}

            {selectedYearId && selectedTeacherId && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving || !hasChanges}>
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <LoadingButton
                  isLoading={isSaving}
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </LoadingButton>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="report">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Año Académico:</span>
                <Select
                  value={reportFilters.academicYearId ? String(reportFilters.academicYearId) : ""}
                  onValueChange={handleReportYearChange}
                >
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
                <span className="text-sm font-medium">Docente (opcional):</span>
                <Select
                  value={reportFilters.teacherId ? String(reportFilters.teacherId) : ""}
                  onValueChange={handleReportTeacherChange}
                  disabled={!reportFilters.academicYearId}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {teacherOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Grado (opcional):</span>
                <Select
                  value={reportFilters.gradeId ? String(reportFilters.gradeId) : ""}
                  onValueChange={handleReportGradeChange}
                  disabled={!reportFilters.academicYearId}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {gradeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Curso (opcional):</span>
                <Select
                  value={reportFilters.courseId ? String(reportFilters.courseId) : ""}
                  onValueChange={handleReportCourseChange}
                  disabled={!reportFilters.academicYearId}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {courseOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearchReport} disabled={!reportFilters.academicYearId}>
                Buscar
              </Button>
            </div>

            <hr className="border-border" />

            <ReportTree data={reportData} isLoading={isLoadingReport} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}