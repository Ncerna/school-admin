import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import type { ReportTeacher } from "@/types/teacher-assignment";

interface ReportTreeProps {
  data: ReportTeacher[];
  isLoading: boolean;
}

export function ReportTree({ data, isLoading }: ReportTreeProps) {
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