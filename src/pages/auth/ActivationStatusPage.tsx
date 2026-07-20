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
import { activationStatusService } from "@/services/activation-status.service";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/types/api";
import type { AccountActivationStatus } from "@/types/auth";
import type { ColumnDef } from "@/types";
import { RefreshCw, UserCheck } from "lucide-react";

function isCodeExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

const columns: ColumnDef<AccountActivationStatus>[] = [
  {
    header: "Nombre completo",
    accessor: "nombres",
    render: (item) => `${item.nombres} ${item.apellidos}`,
    sortable: true,
  },
  { header: "Usuario", accessor: "usuario", sortable: true },
  { header: "Rol", accessor: "rol", sortable: true },
  {
    header: "Estado",
    accessor: "estadoActivacion",
    render: (item) => {
      const variant =
        item.estadoActivacion === "ACTIVE"
          ? "success"
          : item.estadoActivacion === "INACTIVE"
          ? "destructive"
          : "secondary";
      const label =
        item.estadoActivacion === "ACTIVE"
          ? "Activo"
          : item.estadoActivacion === "INACTIVE"
          ? "Inactivo"
          : "Pendiente";
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    header: "Código vencido",
    accessor: "verificationCodeExpiresAt",
    render: (item) => {
      if (item.estadoActivacion !== "PENDING_ACTIVATION") return "—";
      return isCodeExpired(item.verificationCodeExpiresAt) ? (
        <Badge variant="destructive">Vencido</Badge>
      ) : (
        <Badge variant="outline">Válido</Badge>
      );
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
    <div className="mb-4 flex items-center gap-2">
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-md"
      />
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
  const [selectedUser, setSelectedUser] = useState<AccountActivationStatus | null>(null);
  const [actionType, setActionType] = useState<"resend" | "manual" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  function getAvailableActions(item: AccountActivationStatus) {
    if (item.estadoActivacion !== "PENDING_ACTIVATION") return null;

    const expired = isCodeExpired(item.verificationCodeExpiresAt);

    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedUser(item);
            setActionType("resend");
          }}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reenviar credenciales
        </Button>
        {expired && (
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              setSelectedUser(item);
              setActionType("manual");
            }}
          >
          <UserCheck className="h-3 w-3 mr-1" />
          Activar manualmente
        </Button>
        )}
      </div>
    );
  }

  async function handleAction() {
    if (!selectedUser || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === "resend") {
        await authService.resendCredentials(selectedUser.id);
      } else {
        await authService.manualActivate(selectedUser.id);
      }
      // Refresh the list
      window.location.reload();
    } catch (err) {
      // Handle ALREADY_ACTIVE gracefully
      if (err instanceof ApiError && err.message.includes("ALREADY_ACTIVE")) {
        window.location.reload();
      }
      // For USER_NOT_FOUND, refresh the list
      if (err instanceof ApiError && err.message.includes("USER_NOT_FOUND")) {
        window.location.reload();
      }
    } finally {
      setIsProcessing(false);
      setSelectedUser(null);
      setActionType(null);
    }
  }

  return (
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
    />
  );
}
