import { computed, Injectable, signal } from '@angular/core';
import { AdminService } from './admin.service';
import { AuditLogEntry } from '../../api/models/api-models';

@Injectable({ providedIn: 'root' })
export class AdminFacade {
  readonly auditLogs = signal<AuditLogEntry[]>([]);

  constructor(private readonly service: AdminService) {
    this.loadAuditLogs();
  }

  get auditEntries() {
    return this.auditLogs;
  }

  private loadAuditLogs(): void {
    this.service.getAuditLogs().subscribe((logs) => this.auditLogs.set(logs));
  }
}
