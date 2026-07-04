// Generic shapes returned by the backend, matching the API Response Wrapper
// contract (success / message / data / errors). Centralizing these types
// means every service and component consumes the API in the same way.

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
}

export interface PaginationMeta {
  currentPage: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Common query params accepted by every listable resource. */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

/** Thrown by the API client so callers can branch on status / backend errors. */
export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]> | null;

  constructor(message: string, status: number, errors: Record<string, string[]> | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}
