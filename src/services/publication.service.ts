import type { Publication, PublicationPayload } from "@/types/publication";
import { apiClient } from "@/lib/api-client";

class PublicationService {
  async getAll(params?: { page?: number; search?: string; sortBy?: string; sortDir?: string }) {
    const response = await apiClient.get<{ data: Publication[]; pagination?: { page: number; limit: number; total: number } }>(
      "/api/publications",
      { params }
    );
    return response;
  }

  async getById(id: string) {
    const response = await apiClient.get<Publication>(`/api/publications/${id}`);
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
    const response = await apiClient.postForm<Publication>("/api/publications", formData);
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
    const response = await apiClient.putForm<Publication>(`/api/publications/${id}`, formData);
    return response;
  }

  async remove(id: string) {
    await apiClient.delete(`/api/publications/${id}`);
  }

  async approve(id: string) {
    const response = await apiClient.patch<Publication>(`/api/publications/${id}/approve`);
    return response;
  }
}

export const publicationService = new PublicationService();