export type PublicationStatus = "Pendiente" | "Aprobado" | "Archivado";

export type PublicationSection = "Noticias" | "Eventos" | "Logros" | "Trabajos" | "Avisos";

export interface Publication {
  id: string;
  title: string;
  date: string;
  section: PublicationSection;
  targetAudience: string;
  status: PublicationStatus;
  createdAt: string;
  location?: string;
  color: string;
  description: string;
  image?: File | string;
  isVirtual: boolean;
  url?: string;
  imgRemove?: boolean;
}

export type PublicationPayload = Omit<Publication, "id" | "createdAt"> & {
  imgRemove?: boolean;
};