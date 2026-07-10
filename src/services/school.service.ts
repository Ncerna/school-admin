import type { School, SchoolPayload } from "@/types/school";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";

class SchoolService {
  async get() {
    const response = await apiClient.get<School>(ENDPOINTS.school);
    return response;
  }

  async create(data: SchoolPayload) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("address", data.address);
    formData.append("phone", data.phone);
    formData.append("ugel", data.ugel);
    formData.append("email", data.email);
    formData.append("mission", data.mission);
    formData.append("vision", data.vision);
    formData.append("objectives", data.objectives);
    formData.append("values", data.values);
    if (data.logo instanceof File) {
      formData.append("logo", data.logo);
    }
    if (data.banner instanceof File) {
      formData.append("banner", data.banner);
    }
    const response = await apiClient.postForm<School>(ENDPOINTS.school, formData);
    return response;
  }

  async update(data: SchoolPayload) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("address", data.address);
    formData.append("phone", data.phone);
    formData.append("ugel", data.ugel);
    formData.append("email", data.email);
    formData.append("mission", data.mission);
    formData.append("vision", data.vision);
    formData.append("objectives", data.objectives);
    formData.append("values", data.values);
    if (data.logo instanceof File) {
      formData.append("logo", data.logo);
    } else if (data.logo) {
      formData.append("logo", data.logo);
    }
    if (data.banner instanceof File) {
      formData.append("banner", data.banner);
    } else if (data.banner) {
      formData.append("banner", data.banner);
    }
    if (data.logoRemove) {
      formData.append("logoRemove", "true");
    }
    if (data.bannerRemove) {
      formData.append("bannerRemove", "true");
    }
    const response = await apiClient.putForm<School>(ENDPOINTS.school, formData);
    return response;
  }
}

export const schoolService = new SchoolService();