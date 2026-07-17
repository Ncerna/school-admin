import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { teacherAssignmentsService } from "@/services/teacher-assignments.service";
import { ReportTree } from "./ReportTree";
import type { ReportFilters, ReportTeacher, AcademicYearOption, TeacherOption, GradeOption, CourseOption } from "@/types/teacher-assignment";

export function ReportTab() {
  // Use the centralized useOptions hook for all dropdowns
  const { options: academicYearOptions } = useOptions<AcademicYearOption>(
    ENDPOINTS.AcademicYears,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const { options: teacherOptions } = useOptions<TeacherOption>(
    ENDPOINTS.teachers,
    (item) => ({ label: item.fullName, value: String(item.id) }),
    true
  );

  const { options: gradeOptions } = useOptions<GradeOption>(
    ENDPOINTS.grades,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const { options: courseOptions } = useOptions<CourseOption>(
    ENDPOINTS.courses,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    academicYearId: 0,
    teacherId: null,
    gradeId: null,
    courseId: null,
  });
  const [reportData, setReportData] = useState<ReportTeacher[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

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
  );
}