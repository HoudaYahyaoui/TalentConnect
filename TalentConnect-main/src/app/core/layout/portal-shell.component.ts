import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, filter, shareReplay } from 'rxjs/operators';
import { SessionStore } from '../state/session.store';
import { AuthFacade } from '../services/auth.facade';
import { AlertsService } from '../services/alerts.service';
import { ChatbotWidgetComponent } from '../../features/chatbot/widget';
import { NotificationCenterComponent } from '../../shared/components/notification-center/notification-center.component';
import { CommandPaletteDirective } from '../../shared/components/command-palette/command-palette.directive';
import { CommandPaletteDialogComponent } from '../../shared/components/command-palette/command-palette-dialog.component';
import { ToastModule } from 'primeng/toast';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    ChatbotWidgetComponent,
    NotificationCenterComponent,
    CommandPaletteDirective,
    MatDialogModule,
    ToastModule,
  ],
  templateUrl: './portal-shell.component.html',
  styleUrls: ['./portal-shell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalShellComponent {
  @ViewChild('drawer') drawer!: MatSidenav;
  @ViewChild('notifCenter') notifCenter!: NotificationCenterComponent;

  protected readonly sidenavCollapsed = signal(false);

  private readonly sessionStore = inject(SessionStore);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly alertsService = inject(AlertsService);

  protected readonly user = this.sessionStore.user;
  protected readonly theme = this.sessionStore.theme;
  protected readonly role = this.sessionStore.role;
  protected readonly fullName = this.sessionStore.fullName;

  protected readonly initials = computed(() => {
    const currentUser = this.user();
    const first = currentUser?.firstName?.trim()?.charAt(0) ?? '';
    const last = currentUser?.lastName?.trim()?.charAt(0) ?? '';
    const byNames = `${first}${last}`.toUpperCase();
    if (byNames) return byNames;

    const email = currentUser?.email ?? '';
    const localPart = email.split('@')[0] ?? '';
    const parts = localPart.split(/[._-]+/).filter(Boolean);
    const fallback = parts
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join('')
      .toUpperCase();
    return fallback || 'U';
  });

  protected readonly roleLabel = computed(() => {
    const map: Record<string, string> = { EMPLOYEE: 'Collaborateur', HR: 'RH', ADMIN: 'Admin' };
    return map[this.role() ?? ''] ?? this.role() ?? '';
  });

  protected readonly profilePath = computed(() => {
    switch (this.role()) {
      case 'HR':
        return '/app/hr/dashboard';
      case 'ADMIN':
        return '/app/admin/settings';
      default:
        return '/app/employee/profile';
    }
  });

  protected readonly unreadCount = this.alertsService.unreadCount;

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(
      map((state) => state.matches),
      shareReplay({ bufferSize: 1, refCount: true }),
    ),
    { initialValue: false },
  );

  protected readonly navItems = computed<NavItem[]>(() => {
    switch (this.role()) {
      case 'HR':
        return [
          { label: 'Tableau de bord', path: '/app/hr/dashboard', icon: 'analytics' },
          { label: 'Offres', path: '/app/hr/jobs', icon: 'work' },
          { label: 'Candidats', path: '/app/hr/candidates', icon: 'groups' },
          { label: 'Cooptations', path: '/app/hr/referrals', icon: 'recommend' },
          { label: 'Tableau', path: '/app/hr/kanban', icon: 'view_kanban' },
          { label: 'Rapports', path: '/app/hr/reports', icon: 'insights' },
        ];
      case 'ADMIN':
        return [
          { label: 'Tableau de bord', path: '/app/admin/dashboard', icon: 'dashboard' },
          { label: 'Utilisateurs', path: '/app/admin/users', icon: 'manage_accounts' },
          { label: 'Rôles & Accès', path: '/app/admin/roles', icon: 'shield' },
          { label: 'Workflows', path: '/app/admin/workflow', icon: 'account_tree' },
          { label: 'Paramètres', path: '/app/admin/settings', icon: 'settings' },
          { label: 'Grafana', path: '/app/admin/grafana', icon: 'insights' }, // NOUVEL ÉLÉMENT
        ];
      default:
        return [
          { label: 'Accueil', path: '/app/employee/dashboard', icon: 'home' },
          { label: 'Offres', path: '/app/employee/jobs', icon: 'travel_explore' },
          { label: 'Candidatures', path: '/app/employee/applications', icon: 'list_alt' },
          { label: 'Cooptation', path: '/app/employee/recommend', icon: 'recommend' },
          { label: 'Alertes', path: '/app/employee/saved-searches', icon: 'notifications_active' },
          { label: 'Profil', path: '/app/employee/profile', icon: 'person' },
        ];
    }
  });

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      if (this.isMobile() && this.drawer?.opened) {
        this.drawer.close();
      }
    });
  }

  protected openPalette(): void {
    if (this.dialog.openDialogs.length === 0) {
      this.dialog.open(CommandPaletteDialogComponent, {
        panelClass: 'palette-dialog',
        backdropClass: 'palette-backdrop',
        position: { top: '10vh' },
        maxWidth: '100vw',
      });
    }
  }

  protected navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  protected toggleTheme(): void {
    this.sessionStore.setTheme(this.theme() === 'light' ? 'dark' : 'light');
    document.body.dataset['theme'] = this.sessionStore.theme();
  }

  protected toggleCollapse(): void {
    this.sidenavCollapsed.update((v) => !v);
  }

  protected logout(): void {
    this.authFacade.logout();
  }
}
