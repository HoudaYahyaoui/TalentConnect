import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { AdminFacade } from '../admin.facade';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditComponent {
  private readonly adminFacade = inject(AdminFacade);
  protected readonly logs = computed(() => this.adminFacade.auditLogs());
}
