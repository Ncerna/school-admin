import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PublicationFormDialog } from "./PublicationFormPage";
import { publicationService } from "@/services/publication.service";
import type { ColumnDef, FieldDef, Publication, PublicationPayload } from "@/types";

const columns: ColumnDef<Publication>[] = [
  { header: "Título", accessor: "title", sortable: true },
  { header: "Fecha", accessor: "date", sortable: true },
  { header: "Sección", accessor: "section" },
  { header: "Público objetivo", accessor: "targetAudience" },
  { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
  { header: "Fecha de creación", accessor: "createdAt", sortable: true },
];

const fields: FieldDef<Publication>[] = [
  { name: "title", label: "Título", type: "text", placeholder: "Título de la publicación", required: true },
  { name: "date", label: "Fecha del evento", type: "text", placeholder: "Fecha", required: true },
  { name: "section", label: "Sección", type: "select", required: true, options: [
    { label: "Noticias", value: "Noticias" },
    { label: "Eventos", value: "Eventos" },
    { label: "Logros", value: "Logros" },
    { label: "Trabajos", value: "Trabajos" },
    { label: "Avisos", value: "Avisos" },
  ]},
  { name: "targetAudience", label: "Público objetivo", type: "text", placeholder: "Público objetivo", required: true },
  { name: "status", label: "Estado", type: "select", required: true, options: [
    { label: "Pendiente", value: "Pendiente" },
    { label: "Aprobado", value: "Aprobado" },
    { label: "Archivado", value: "Archivado" },
  ]},
  { name: "color", label: "Color", type: "text", placeholder: "#ffffff", required: true },
  { name: "description", label: "Descripción", type: "textarea", placeholder: "Descripción de la publicación", required: true },
  { name: "location", label: "Ubicación", type: "text", placeholder: "Ubicación del evento" },
  { name: "isVirtual", label: "Evento virtual", type: "text", placeholder: "true o false" },
  { name: "url", label: "URL", type: "text", placeholder: "https://" },
];

const emptyPublication: PublicationPayload = {
  title: "",
  date: "",
  section: "Noticias",
  targetAudience: "",
  status: "Pendiente",
  color: "",
  description: "",
  isVirtual: false,
  image: "",
  location: "",
  url: "",
};

export default function PublicationPage() {
  return (
    <ApiCrudPage<Publication, PublicationPayload>
      title="Publicaciones"
      description="Administra eventos y publicaciones del sistema."
      columns={columns}
      fields={fields}
      api={publicationService}
      emptyItem={emptyPublication}
      searchPlaceholder="Buscar publicación..."
      newLabel="Nueva publicación"
      renderFormDialog={(props) => <PublicationFormDialog {...props} />}
    />
  );
}
