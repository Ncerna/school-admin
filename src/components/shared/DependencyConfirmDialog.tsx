import { AlertTriangle, X, FileX, Users, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import type { AffectedCourse } from "@/types/grade-course";

interface DependencyConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affectedCourses: AffectedCourse[];
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DependencyConfirmDialog({
  open,
  onOpenChange,
  affectedCourses,
  onConfirm,
  isLoading = false,
}: DependencyConfirmDialogProps) {
  const formatCourseText = (course: AffectedCourse): string => {
    const { courseName, criteriaCount, teacherAssignmentsCount } = course;
    
    if (criteriaCount > 0 && teacherAssignmentsCount > 0) {
      const teacherText = teacherAssignmentsCount === 1 
        ? "1 docente asignado" 
        : `${teacherAssignmentsCount} docentes asignados`;
      return `${courseName} — ${criteriaCount} criterios de evaluación, ${teacherText}`;
    }
    
    if (criteriaCount > 0) {
      return `${courseName} — ${criteriaCount} criterios de evaluación`;
    }
    
    if (teacherAssignmentsCount > 0) {
      const teacherText = teacherAssignmentsCount === 1 
        ? "1 docente asignado" 
        : `${teacherAssignmentsCount} docentes asignados`;
      return `${courseName} — ${teacherText}`;
    }
    
    return courseName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Advertencia: Se eliminará información asociada</DialogTitle>
          </div>
          <DialogDescription className="mt-2">
            Al quitar los siguientes cursos, se eliminarán permanentemente sus datos asociados:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 py-2 max-h-40 overflow-y-auto">
          {affectedCourses.map((course) => (
            <div key={course.courseId} className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
              <span>{formatCourseText(course)}</span>
            </div>
          ))}
        </div>

        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md space-y-2">
          <div className="flex items-center gap-2">
            <FileX className="h-4 w-4 flex-shrink-0" />
            <span>Criterios de evaluación configurados se eliminarán</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>Docentes asignados se desasignarán</span>
          </div>
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 flex-shrink-0" />
            <span>Acción irreversible</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <LoadingButton isLoading={isLoading} onClick={onConfirm}>
            Sí, eliminar cursos
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}