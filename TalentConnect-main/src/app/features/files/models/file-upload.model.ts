/**
 * File Upload Model
 */

export interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  expiresAt?: Date;
}

export interface FileUploadRequest {
  file: File;
  fileType: string; // 'CV', 'DOCUMENT', etc.
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface FileMetadata {
  fileId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: Date;
  uploadedBy: string;
}
