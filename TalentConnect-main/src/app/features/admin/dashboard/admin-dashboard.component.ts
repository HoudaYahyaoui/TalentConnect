import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiHttpService } from '../../../data-access/api/http/api-http.service';
import { GrafanaPanelEmbedComponent } from '../../../shared/components/grafana-panel-embed/grafana-panel-embed.component'; // <-- NOUVEL IMPORT

interface BackendAdminUser {
  id: number;
  email: string;
  roles: string[];
  enabled: boolean;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  hrCount: number;
  employeeCount: number;
  auditEventsToday: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    GrafanaPanelEmbedComponent, // <-- AJOUTER ICI
  ],
  template: `
    <div class="admin-dash">
      <header class="dash-header">
        <div>
          <p class="eyebrow">Administration système</p>
          <h2>Centre d'administration</h2>
          <p class="header-sub">
            Gérez les utilisateurs, les permissions et supervisez l'activité de la plateforme.
          </p>
        </div>
        <div class="header-badge">
          <mat-icon>admin_panel_settings</mat-icon>
        </div>
      </header>

      <!-- Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon users"><mat-icon>people</mat-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ stats().totalUsers }}</span>
            <span class="metric-label">Utilisateurs totaux</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon active"><mat-icon>check_circle</mat-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ stats().activeUsers }}</span>
            <span class="metric-label">Comptes actifs</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon admin"><mat-icon>shield</mat-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ stats().adminCount }}</span>
            <span class="metric-label">Administrateurs</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon audit"><mat-icon>history</mat-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ stats().auditEventsToday }}</span>
            <span class="metric-label">Actions aujourd'hui</span>
          </div>
        </div>
      </div>

      <!-- Distribution des rôles -->
      <section class="panel">
        <h3 class="panel-title"><mat-icon>donut_large</mat-icon> Répartition des rôles</h3>
        <div class="role-bars">
          <div class="role-bar-row">
            <div class="role-info">
              <div class="role-dot" style="background:#3b82f6"></div>
              <span>Collaborateurs</span>
              <strong>{{ stats().employeeCount }}</strong>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                [style.width.%]="pct(stats().employeeCount)"
                style="background:#3b82f6"
              ></div>
            </div>
          </div>
          <div class="role-bar-row">
            <div class="role-info">
              <div class="role-dot" style="background:#8b5cf6"></div>
              <span>RH</span>
              <strong>{{ stats().hrCount }}</strong>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                [style.width.%]="pct(stats().hrCount)"
                style="background:#8b5cf6"
              ></div>
            </div>
          </div>
          <div class="role-bar-row">
            <div class="role-info">
              <div class="role-dot" style="background:#f59e0b"></div>
              <span>Admins</span>
              <strong>{{ stats().adminCount }}</strong>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                [style.width.%]="pct(stats().adminCount)"
                style="background:#f59e0b"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Nouvelle section pour les graphiques Grafana -->
      <section class="panel">
        <h3 class="panel-title"><mat-icon>insights</mat-icon> Surveillance du Backend</h3>
        <p class="panel-sub">Statistiques clés de performance et d'utilisation des services.</p>
        <div class="grafana-dashboard-container">
          <!-- Remplacez 'YOUR_GRAFANA_EMBED_URL_HERE' par l'URL d'intégration de votre panneau Grafana -->
          <app-grafana-panel-embed
            [grafanaUrl]="'YOUR_GRAFANA_EMBED_URL_HERE'"
            height="500px"
          ></app-grafana-panel-embed>
        </div>
      </section>

      <!-- Quick actions -->
      <div class="quick-grid">
        <a routerLink="/app/admin/users" class="action-card">
          <div class="action-icon users">
            <mat-icon>manage_accounts</mat-icon>
          </div>
          <div class="action-body">
            <h4>Gestion des utilisateurs</h4>
            <p>Créer, modifier ou désactiver des comptes.</p>
          </div>
          <mat-icon class="action-arrow">arrow_forward</mat-icon>
        </a>

        <a routerLink="/app/admin/roles" class="action-card">
          <div class="action-icon roles">
            <mat-icon>shield</mat-icon>
          </div>
          <div class="action-body">
            <h4>Rôles &amp; permissions</h4>
            <p>Configurer les droits d'accès par rôle.</p>
          </div>
          <mat-icon class="action-arrow">arrow_forward</mat-icon>
        </a>

        <a routerLink="/app/admin/workflow" class="action-card">
          <div class="action-icon workflow">
            <mat-icon>account_tree</mat-icon>
          </div>
          <div class="action-body">
            <h4>Workflows de recrutement</h4>
            <p>Éditeur d'étapes par département.</p>
          </div>
          <mat-icon class="action-arrow">arrow_forward</mat-icon>
        </a>

        <a routerLink="/app/admin/settings" class="action-card">
          <div class="action-icon settings">
            <mat-icon>settings</mat-icon>
          </div>
          <div class="action-body">
            <h4>Paramètres système</h4>
            <p>Configuration générale, sécurité, notifications.</p>
          </div>
          <mat-icon class="action-arrow">arrow_forward</mat-icon>
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-dash {
        display: grid;
        gap: 16px;
      }

      .dash-header {
        background: linear-gradient(135deg, var(--brand-700), var(--brand-500));
        border-radius: var(--radius-xl);
        padding: 24px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .dash-header h2 {
        font-size: 1.3rem;
        margin: 4px 0 6px;
        color: #fff;
      }
      .header-sub {
        font-size: 0.82rem;
        opacity: 0.85;
        margin: 0;
        max-width: 480px;
      }
      .header-badge mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.6;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      @media (max-width: 900px) {
        .metrics-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .metric-card {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .metric-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .metric-icon.users {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
      }
      .metric-icon.active {
        background: rgba(34, 197, 94, 0.12);
        color: #22c55e;
      }
      .metric-icon.admin {
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
      }
      .metric-icon.audit {
        background: rgba(139, 92, 246, 0.12);
        color: #8b5cf6;
      }
      .metric-body {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .metric-value {
        font-size: 1.5rem;
        font-weight: 800;
        line-height: 1;
      }
      .metric-label {
        font-size: 0.75rem;
        color: var(--text-soft);
      }

      .panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0;
      }
      .panel-title mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--brand-500);
      }

      .role-bars {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .role-bar-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .role-info {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 130px;
        flex-shrink: 0;
        font-size: 0.85rem;
      }
      .role-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .role-info strong {
        margin-left: auto;
        font-weight: 700;
      }
      .bar-track {
        flex: 1;
        height: 8px;
        background: var(--surface-highlight);
        border-radius: 4px;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 600ms ease;
      }

      .quick-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      @media (max-width: 600px) {
        .quick-grid {
          grid-template-columns: 1fr;
        }
      }
      .action-card {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 14px;
        text-decoration: none;
        color: inherit;
        transition:
          border-color 150ms,
          box-shadow 150ms;
        cursor: pointer;
      }
      .action-card:hover {
        border-color: var(--brand-400);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      }
      .action-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .action-icon.users {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
      }
      .action-icon.roles {
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
      }
      .action-icon.workflow {
        background: rgba(34, 197, 94, 0.12);
        color: #22c55e;
      }
      .action-icon.settings {
        background: rgba(139, 92, 246, 0.12);
        color: #8b5cf6;
      }
      .action-body {
        flex: 1;
      }
      .action-body h4 {
        font-size: 0.9rem;
        font-weight: 600;
        margin: 0 0 3px;
      }
      .action-body p {
        font-size: 0.78rem;
        color: var(--text-soft);
        margin: 0;
      }
      .action-arrow {
        color: var(--text-soft);
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
      .grafana-dashboard-container {
        width: 100%;
        height: 500px; /* Ajustez la hauteur selon vos besoins */
        margin-top: 16px;
      }
      .panel-sub {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-top: -8px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class AdminDashboardComponent {
  private readonly api = inject(ApiHttpService);

  protected readonly usersData = toSignal(
    this.api
      .getFrom<BackendAdminUser[]>(this.api.authBase, 'admin/users')
      .pipe(catchError(() => of([] as BackendAdminUser[]))),
    { initialValue: [] },
  );

  protected readonly stats = computed<AdminStats>(() => {
    const users = this.usersData();
    const total = users.length;
    return {
      totalUsers: total,
      activeUsers: users.filter((u) => u.enabled).length,
      adminCount: users.filter((u) => (u.roles ?? []).includes('ADMIN')).length,
      hrCount: users.filter((u) => (u.roles ?? []).includes('RH')).length,
      employeeCount: users.filter((u) => (u.roles ?? []).includes('EMPLOYEE')).length,
      auditEventsToday: 0,
    };
  });

  protected pct(count: number): number {
    const total = this.stats().totalUsers;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }
}
