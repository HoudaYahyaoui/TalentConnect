import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { SessionStore } from '../../../core/state/session.store';

interface Command {
  label: string;
  description: string;
  icon: string;
  path: string;
  roles?: string[];
}

const ALL_COMMANDS: Command[] = [
  {
    label: 'Tableau de bord',
    description: 'Accueil employé',
    icon: 'home',
    path: '/app/employee/dashboard',
    roles: ['EMPLOYEE'],
  },
  {
    label: 'Explorer les offres',
    description: 'Opportunités internes',
    icon: 'travel_explore',
    path: '/app/employee/jobs',
    roles: ['EMPLOYEE'],
  },
  {
    label: 'Mes candidatures',
    description: 'Suivi de mes dossiers',
    icon: 'list_alt',
    path: '/app/employee/applications',
    roles: ['EMPLOYEE'],
  },
  {
    label: 'Recommander un profil',
    description: 'Cooptation externe',
    icon: 'recommend',
    path: '/app/employee/referrals',
    roles: ['EMPLOYEE'],
  },
  {
    label: 'Mon profil',
    description: 'Compétences et documents',
    icon: 'person',
    path: '/app/employee/profile',
    roles: ['EMPLOYEE'],
  },
  {
    label: 'Dashboard RH',
    description: 'KPIs et funnel',
    icon: 'analytics',
    path: '/app/hr/dashboard',
    roles: ['HR'],
  },
  {
    label: 'Piloter les offres',
    description: 'CRUD offres',
    icon: 'work',
    path: '/app/hr/jobs',
    roles: ['HR'],
  },
  {
    label: 'Gestion candidats',
    description: 'Liste et actions',
    icon: 'groups',
    path: '/app/hr/candidates',
    roles: ['HR'],
  },
  {
    label: 'Tableau recrutement',
    description: 'Vue pipeline',
    icon: 'view_kanban',
    path: '/app/hr/kanban',
    roles: ['HR'],
  },
  {
    label: 'Rapports analytiques',
    description: 'Export et métriques',
    icon: 'insights',
    path: '/app/hr/reports',
    roles: ['HR'],
  },
  {
    label: 'Alertes & notifications',
    description: 'Mes alertes emploi',
    icon: 'notifications',
    path: '/app/employee/saved-searches',
    roles: ['EMPLOYEE'],
  },
  {
    label: 'Centre de notifications',
    description: 'Tous les messages',
    icon: 'inbox',
    path: '/app/employee/notifications',
    roles: ['EMPLOYEE'],
  },
  {
    label: 'Dashboard Admin',
    description: "Vue d'ensemble plateforme",
    icon: 'dashboard',
    path: '/app/admin/dashboard',
    roles: ['ADMIN'],
  },
  {
    label: 'Utilisateurs',
    description: 'Gouvernance IAM',
    icon: 'manage_accounts',
    path: '/app/admin/users',
    roles: ['ADMIN'],
  },
  {
    label: 'Rôles & permissions',
    description: 'RBAC granulaire',
    icon: 'shield',
    path: '/app/admin/roles',
    roles: ['ADMIN'],
  },
  {
    label: 'Paramètres plateforme',
    description: 'Configuration globale',
    icon: 'settings',
    path: '/app/admin/settings',
    roles: ['ADMIN'],
  },
];

@Component({
  selector: 'app-command-palette-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatListModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  template: `
    <div class="palette-wrap" (keydown.escape)="close()">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="palette-field">
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          [formControl]="searchCtrl"
          placeholder="Rechercher une page ou une action…"
          autofocus
          autocomplete="off"
        />
        <span matSuffix class="kbd-hint">ESC</span>
      </mat-form-field>

      <mat-nav-list class="result-list">
        @for (cmd of filtered(); track cmd.path) {
          <a mat-list-item (click)="navigate(cmd)" (keydown.enter)="navigate(cmd)">
            <mat-icon matListItemIcon>{{ cmd.icon }}</mat-icon>
            <span matListItemTitle>{{ cmd.label }}</span>
            <span matListItemLine>{{ cmd.description }}</span>
          </a>
        } @empty {
          <p class="empty-hint">Aucun résultat pour « {{ searchCtrl.value }} »</p>
        }
      </mat-nav-list>
    </div>
  `,
  styles: [
    `
      .palette-wrap {
        width: min(600px, 96vw);
        background: var(--surface-raised);
        border-radius: 1.25rem;
        overflow: hidden;
      }
      .palette-field {
        width: 100%;
        padding: 12px;
      }
      .result-list {
        max-height: 360px;
        overflow-y: auto;
      }
      .kbd-hint {
        font-size: 0.72rem;
        opacity: 0.5;
        font-family: monospace;
        padding: 2px 6px;
        border: 1px solid currentColor;
        border-radius: 4px;
      }
      .empty-hint {
        text-align: center;
        padding: 24px;
        color: var(--text-soft);
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteDialogComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly sessionStore = inject(SessionStore);

  protected readonly searchCtrl = new FormControl('', { nonNullable: true });
  protected readonly filtered = signal<Command[]>([]);

  private get currentRole(): string {
    return this.sessionStore.role() ?? '';
  }

  ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(startWith(''), debounceTime(150), distinctUntilChanged())
      .subscribe((q) => {
        const query = q.toLowerCase();
        this.filtered.set(
          ALL_COMMANDS.filter((cmd) => {
            const matchesRole = !cmd.roles || cmd.roles.includes(this.currentRole);
            const matchesQuery =
              !query ||
              cmd.label.toLowerCase().includes(query) ||
              cmd.description.toLowerCase().includes(query);
            return matchesRole && matchesQuery;
          }),
        );
      });
  }

  protected navigate(cmd: Command): void {
    this.router.navigateByUrl(cmd.path);
    this.close();
  }

  protected close(): void {
    this.dialog.closeAll();
  }
}
