import type { Publication, PublicationPayload } from "@/types/publication";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";

class PublicationService {
  async getAll(params?: { page?: number; search?: string; sortBy?: string; sortDir?: string }) {
    const response = await apiClient.get<{ data: Publication[]; pagination?: { page: number; limit: number; total: number } }>(
      ENDPOINTS.publications,
      { params }
    );
    return response;
  }

  async getById(id: string) {
    const response = await apiClient.get<Publication>(`${ENDPOINTS.publications}/${id}`);
    return response;
  }

  async create(data: PublicationPayload) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("date", data.date);
    formData.append("section", data.section);
    formData.append("targetAudience", data.targetAudience);
    formData.append("status", data.status);
    formData.append("color", data.color);
    formData.append("description", data.description);
    if (data.location) {
      formData.append("location", data.location);
    }
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }
    formData.append("isVirtual", String(data.isVirtual));
    if (data.isVirtual && data.url) {
      formData.append("url", data.url);
    }
    const response = await apiClient.postForm<Publication>(ENDPOINTS.publications, formData);
    return response;
  }

  async update(id: string, data: PublicationPayload) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("date", data.date);
    formData.append("section", data.section);
    formData.append("targetAudience", data.targetAudience);
    formData.append("status", data.status);
    formData.append("color", data.color);
    formData.append("description", data.description);
    if (data.location) {
      formData.append("location", data.location);
    }
    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else if (data.image) {
      formData.append("image", data.image);
    }
    if (data.imgRemove) {
      formData.append("imgRemove", "true");
    }
    formData.append("isVirtual", String(data.isVirtual));
    if (data.isVirtual && data.url) {
      formData.append("url", data.url);
    }
    const response = await apiClient.putForm<Publication>(`${ENDPOINTS.publications}/${id}`, formData);
    return response;
  }

  async remove(id: string) {
    await apiClient.delete(`${ENDPOINTS.publications}/${id}`);
  }

  async approve(id: string) {
    const response = await apiClient.patch<Publication>(`${ENDPOINTS.publications}/${id}/approve`);
    return response;
  }
}

export const publicationService = new PublicationService();