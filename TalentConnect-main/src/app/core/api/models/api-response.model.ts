/**
 * API Response Model - Format de réponse standard de l'API Gateway
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  status: number;
  code: string; // Identifiant d'erreur (AUTH_001, JOB_NOT_FOUND, etc.)
  message: string;
  details?: Record<string, any>;
  validationErrors?: Record<string, string[]>;
}

/**
 * Pagination Response
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * HTTP Error Response
 */
export interface HttpErrorResponse {
  status: number;
  statusText: string;
  error?: ApiError;
}
