import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { activationStatusService } from "@/services/activation-status.service";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/types/api";
import { useToast } from "@/components/ui/toast";
import type { AccountActivationStatus } from "@/types/auth";
import type { ColumnDef } from "@/types";
import { RefreshCw, UserCheck, Search } from "lucide-react";

function isCodeExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

const columns: ColumnDef<AccountActivationStatus>[] = [
  {
    header: "Usuario",
    accessor: "username",
    sortable: true,
  },
  { header: "Correo", accessor: "email", sortable: true },
  { header: "Rol", accessor: "role", sortable: true },
  {
    header: "Estado",
    accessor: "status",
    render: (item) => {
      const variant =
        item.status === "ACTIVE"
          ? "success"
          : item.status === "INACTIVE"
          ? "destructive"
          : "secondary";
      const label =
        item.status === "ACTIVE"
          ? "Activo"
          : item.status === "INACTIVE"
          ? "Inactivo"
          : "Pendiente";
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
];

// Filter component for role and status selects
function ActivationFilters({
  setExtraParams,
  search,
  setSearch,
  refetch,
  searchPlaceholder,
  setPage,
}: {
  setExtraParams: (params: Record<string, unknown>) => void;
  search: string;
  setSearch: (value: string) => void;
  refetch: () => void;
  searchPlaceholder: string;
  setPage: (page: number) => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-end gap-2">
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-md"
      />
      <Button variant="outline" size="icon" aria-label="Buscar" onClick={refetch}>
        <Search className="h-4 w-4" />
      </Button>
      <Select
        value="all"
        onValueChange={(value) => setExtraParams({ rol: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Todos los roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los roles</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="secretaria">Secretaría</SelectItem>
          <SelectItem value="docente">Docente</SelectItem>
          <SelectItem value="apoderado">Apoderado</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value="all"
        onValueChange={(value) => setExtraParams({ estado: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="PENDING_ACTIVATION">Pendiente</SelectItem>
          <SelectItem value="ACTIVE">Activo</SelectItem>
          <SelectItem value="INACTIVE">Inactivo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default function ActivationStatusPage() {
  const { showToast } = useToast();
  const [selectedUser, setSelectedUser] = useState<AccountActivationStatus | null>(null);
  const [actionType, setActionType] = useState<"resend" | "manual" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  function getAvailableActions(item: AccountActivationStatus) {
    if (item.status !== "PENDING_ACTIVATION") return null;

    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedUser(item);
            setActionType("resend");
          }}
          disabled={isProcessing}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reenviar credenciales
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            setSelectedUser(item);
            setActionType("manual");
          }}
          disabled={isProcessing}
        >
          <UserCheck className="h-3 w-3 mr-1" />
          Activar manualmente
        </Button>
      </div>
    );
  }

  async function handleAction() {
    if (!selectedUser || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === "resend") {
        await authService.resendCredentials(selectedUser.id);
        showToast("Credenciales reenviadas correctamente", "success");
      } else {
        await authService.manualActivate(selectedUser.id);
        showToast("Cuenta activada correctamente", "success");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, "error");
      }
    } finally {
      setIsProcessing(false);
      setSelectedUser(null);
      setActionType(null);
    }
  }

  return (
    <>
      <ApiCrudPage<AccountActivationStatus>
        title="Estado de activación de cuentas"
        description="Revisa qué cuentas ya fueron activadas por los usuarios."
        columns={columns}
        fields={[]}
        api={{
          list: activationStatusService.list,
          create: async () => { throw new Error("not supported"); },
          update: async () => { throw new Error("not supported"); },
          remove: async () => { throw new Error("not supported"); },
        }}
        emptyItem={{} as AccountActivationStatus}
        searchPlaceholder="Buscar usuario..."
        readOnly={true}
        filterComponent={ActivationFilters}
        renderActions={getAvailableActions}
        onCustomDelete={handleAction}
        realtimeSearch={false}
      />

      <ConfirmDialog
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
            setActionType(null);
          }
        }}
        title={actionType === "resend" ? "¿Reenviar credenciales?" : "¿Activar cuenta manualmente?"}
        description={
          actionType === "resend"
            ? "Se reenviarán las credenciales al usuario."
            : "La cuenta será activada sin necesidad de código de verificación."
        }
        onConfirm={handleAction}
        confirmLabel="Confirmar"
        variant="default"
        isLoading={isProcessing}
      />
    </>
  );
}
