import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockApiService } from '../../core/services/mock-api.service';
import { AuditLogEntry } from '../../api/models/api-models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly mockApi: MockApiService) {}

  getAuditLogs(): Observable<AuditLogEntry[]> {
    return this.mockApi.get<AuditLogEntry[]>('audit-log.json');
  }
}
