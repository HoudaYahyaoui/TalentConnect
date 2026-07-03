import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateFacade } from '../candidate.facade';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly candidateFacade = inject(CandidateFacade);
  protected readonly profile = computed(() => this.candidateFacade.profile());

  protected getInitials(): string {
    const name = this.profile()?.displayName || '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0]?.[0] || '?').toUpperCase();
  }

  protected getRoleLabel(): string {
    const raw = localStorage.getItem('tc_user');
    const user = raw ? JSON.parse(raw) : null;
    const role = user?.role ?? 'EMPLOYEE';
    const labels: Record<string, string> = {
      EMPLOYEE: 'Collaborateur',
      HR: 'RH',
      ADMIN: 'Administrateur',
      EMPLOYE: 'Collaborateur',
      RH: 'RH',
    };
    return labels[role] || role;
  }

  protected getLanguages(): string[] {
    return (this.profile() as unknown as { languages?: string[] })?.languages ?? [];
  }

  protected getEmail(): string {
    const raw = localStorage.getItem('tc_user');
    const user = raw ? JSON.parse(raw) : null;
    return user?.email ?? '—';
  }
}
