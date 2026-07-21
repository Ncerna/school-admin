import type { Publication, PublicationPayload } from "@/types/publication";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { PaginatedData, ListParams } from "@/types/api";

// Mapeo de datos de la API (snake_case) al formato del frontend (camelCase)
interface ApiPublication {
  id: number;
  title: string;
  event_date: string;
  location?: string;
  background_color: string;
  description: string;
  target_audience: string;
  section: string;
  image?: string;
  is_virtual: boolean;
  event_url?: string;
  status: string;
}

function mapApiToPublication(apiPub: ApiPublication): Publication {
  return {
    id: String(apiPub.id),
    title: apiPub.title,
    date: apiPub.event_date,
    location: apiPub.location,
    color: apiPub.background_color,
    description: apiPub.description,
    targetAudience: apiPub.target_audience,
    section: apiPub.section as Publication["section"],
    image: apiPub.image,
    isVirtual: apiPub.is_virtual,
    url: apiPub.event_url,
    status: apiPub.status === "PENDING" ? "Pendiente" : 
           apiPub.status === "APPROVED" ? "Aprobado" : "Archivado",
    createdAt: "", // No viene en la respuesta, se puede agregar si es necesario
  };
}

class PublicationService {
  async list(params?: ListParams) {
    const response = await apiClient.get<{ items: ApiPublication[]; pagination: { current_page: number; limit: number; total: number } }>(
      ENDPOINTS.publications,
      params
    );
    return {
      items: response.items.map(mapApiToPublication),
      pagination: {
        currentPage: response.pagination.current_page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPage: Math.ceil(response.pagination.total / response.pagination.limit),
      },
    };
  }

  async getById(id: string) {
    const response = await apiClient.get<ApiPublication>(`${ENDPOINTS.publications}/${id}`);
    return mapApiToPublication(response);
  }

  async create(data: PublicationPayload) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("event_date", data.date);
    formData.append("section", data.section);
    formData.append("target_audience", data.targetAudience);
    formData.append("status", data.status === "Pendiente" ? "PENDING" : 
                                               data.status === "Aprobado" ? "APPROVED" : "ARCHIVED");
    formData.append("background_color", data.color);
    formData.append("description", data.description);
    if (data.location) {
      formData.append("location", data.location);
    }
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }
    formData.append("is_virtual", String(data.isVirtual));
    if (data.isVirtual && data.url) {
      formData.append("event_url", data.url);
    }
    const response = await apiClient.postForm<ApiPublication>(ENDPOINTS.publications, formData);
    return mapApiToPublication(response);
  }

  async update(id: string, data: PublicationPayload) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("event_date", data.date);
    formData.append("section", data.section);
    formData.append("target_audience", data.targetAudience);
    formData.append("status", data.status === "Pendiente" ? "PENDING" : 
                                               data.status === "Aprobado" ? "APPROVED" : "ARCHIVED");
    formData.append("background_color", data.color);
    formData.append("description", data.description);
    if (data.location) {
      formData.append("location", data.location);
    }
    // Solo enviar image si es un File (nueva imagen)
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }
    if (data.imgRemove) {
      formData.append("imgRemove", "true");
    }
    formData.append("is_virtual", String(data.isVirtual));
    if (data.isVirtual && data.url) {
      formData.append("event_url", data.url);
    }
    const response = await apiClient.putForm<ApiPublication>(`${ENDPOINTS.publications}/${id}`, formData);
    return mapApiToPublication(response);
  }

  async remove(id: string): Promise<null> {
    await apiClient.delete(`${ENDPOINTS.publications}/${id}`);
    return null;
  }

  async approve(id: string) {
    const response = await apiClient.patch<ApiPublication>(`${ENDPOINTS.publications}/${id}/approve`);
    return mapApiToPublication(response);
  }
}

export const publicationService = new PublicationService();