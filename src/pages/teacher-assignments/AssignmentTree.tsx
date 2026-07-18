import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { TeacherAssignmentTree, GradeAssignment } from "@/types/teacher-assignment";

interface AssignmentTreeProps {
  data: TeacherAssignmentTree | null;
  onDataChange: (data: TeacherAssignmentTree) => void;
  hasChanges: boolean;
}

export function AssignmentTree({ data, onDataChange, hasChanges }: AssignmentTreeProps) {
  const [localData, setLocalData] = useState<TeacherAssignmentTree | null>(null);
  const [expandedGrades, setExpandedGrades] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [gradeToUnassign, setGradeToUnassign] = useState<GradeAssignment | null>(null);

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

    // If unchecking and has assigned courses, show confirmation dialog
    const hasAssignedCourses = grade.courses.some((c) => c.assigned);
    if (grade.assigned && hasAssignedCourses) {
      setGradeToUnassign(grade);
      return;
    }

    // If no assigned courses or checking, proceed directly
    performGradeToggle(gradeId);
  };

  // Perform the actual grade toggle
  const performGradeToggle = (gradeId: number) => {
    if (!localData) return;

    const grade = localData.grades.find((g) => g.gradeId === gradeId);
    if (!grade) return;

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

      <ConfirmDialog
        open={!!gradeToUnassign}
        onOpenChange={(open) => !open && setGradeToUnassign(null)}
        title="¿Quitar grado?"
        description={
          gradeToUnassign
            ? `¿Está seguro que desea quitar el grado "${gradeToUnassign.gradeName}"? Este grado tiene ${gradeToUnassign.courses.filter((c) => c.assigned).length} cursos asignados.`
            : ""
        }
        onConfirm={() => {
          if (gradeToUnassign) {
            performGradeToggle(gradeToUnassign.gradeId);
            setGradeToUnassign(null);
          }
        }}
        confirmLabel="Quitar"
      />
    </div>
  );
}