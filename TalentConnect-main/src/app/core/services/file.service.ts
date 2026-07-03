import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  FileUploadResponse,
  FileMetadata,
  FileServiceHealthResponse,
} from '../api/models/backend-api-models';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly http = inject(HttpClient);
  private readonly fileServiceUrl = environment.services.files;

  /**
   * Upload un fichier
   * POST /api/files/upload
   * Headers: X-User-Id, X-Role
   */
  upload(file: File, userId: number, role: string): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.fileServiceUrl}/files/upload`, formData, {
      headers: {
        'X-User-Id': userId.toString(),
        'X-Role': role,
      },
    });
  }

  /**
   * Récupère les métadonnées d'un fichier
   * GET /api/files/{fileId}/metadata
   */
  getMetadata(fileId: string): Observable<FileMetadata> {
    return this.http.get<FileMetadata>(`${this.fileServiceUrl}/files/${fileId}/metadata`);
  }

  /**
   * Télécharge un fichier
   * GET /api/files/{fileId}/download
   * Retourne un Blob
   */
  download(fileId: string): Observable<Blob> {
    return this.http.get(`${this.fileServiceUrl}/files/${fileId}/download`, {
      responseType: 'blob',
    });
  }

  /**
   * Supprime un fichier
   * DELETE /api/files/{fileId}
   * Headers: X-User-Id
   */
  delete(fileId: string, userId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.fileServiceUrl}/files/${fileId}`, {
        headers: {
          'X-User-Id': userId.toString(),
        },
      })
      .pipe(map(() => undefined));
  }

  /**
   * Vérifie la santé du service
   * GET /api/files/health
   */
  health(): Observable<FileServiceHealthResponse> {
    return this.http.get<FileServiceHealthResponse>(`${this.fileServiceUrl}/files/health`);
  }

  /**
   * Construit l'URL de téléchargement pour un fichier
   * Utile pour les aperçus ou liens directs
   */
  getDownloadUrl(fileId: string): string {
    return `${this.fileServiceUrl}/files/${fileId}/download`;
  }

  /**
   * Stub: simulate file download (for backward compatibility)
   */
  downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  /**
   * Stub: simulate file upload (for backward compatibility)
   */
  uploadFile(file: File): Observable<{ url: string }> {
    const raw = localStorage.getItem('tc_user');
    const user = raw ? (JSON.parse(raw) as { id?: string | number; role?: string }) : null;
    const userId = Number(user?.id ?? 0);
    const role = user?.role ?? 'EMPLOYEE';
    return this.upload(file, userId, role).pipe(
      map((response) => ({ url: this.getDownloadUrl(response.fileId) })),
    );
  }
}
