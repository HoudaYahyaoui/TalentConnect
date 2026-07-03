/**
 * API GATEWAY SERVICE
 *
 * Service proxy unique qui gère la communication HTTP avec l'API Gateway
 * Centralize:
 * - HTTP Client calls
 * - Request intercepteurs
 * - Response handling
 * - Error management
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedApiResponse } from './models/api-response.model';

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
}

@Injectable({
  providedIn: 'root',
})
export class ApiGatewayService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiGateway.baseUrl;

  get<T>(endpoint: string, options?: RequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    return this.http.get<ApiResponse<T>>(url, httpOptions);
  }

  getPaginated<T>(endpoint: string, options?: RequestOptions): Observable<PaginatedApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    return this.http.get<PaginatedApiResponse<T>>(url, httpOptions);
  }

  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    return this.http.post<ApiResponse<T>>(url, body, httpOptions);
  }

  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    return this.http.put<ApiResponse<T>>(url, body, httpOptions);
  }

  patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    return this.http.patch<ApiResponse<T>>(url, body, httpOptions);
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    return this.http.delete<ApiResponse<T>>(url, httpOptions);
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.apiUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  private buildHttpOptions(options?: RequestOptions): {
    headers?: HttpHeaders;
    params?: HttpParams;
  } {
    const httpOptions: { headers?: HttpHeaders; params?: HttpParams } = {};

    if (options?.headers) {
      httpOptions.headers = new HttpHeaders(options.headers);
    }

    if (options?.params) {
      let params = new HttpParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== null && value !== undefined) {
          params = params.set(key, String(value));
        }
      }
      httpOptions.params = params;
    }

    return httpOptions;
  }
}
