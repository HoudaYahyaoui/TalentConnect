import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';

interface ShellMenuItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    SidebarComponent,
    NavbarComponent,
    ChatbotComponent,
    ToastNotificationComponent,
  ],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {
  private readonly authFacade = inject(AuthFacade);

  protected readonly userRole = computed(() => this.authFacade.user()?.role ?? 'EMPLOYEE');

  protected readonly menuItems = computed<ShellMenuItem[]>(() => {
    if (this.userRole() === 'HR') {
        return [
        { label: 'Tableau de bord', icon: 'dashboard', path: 'hr/dashboard' },
        { label: 'Tableau', icon: 'view_kanban', path: 'hr/kanban' },
        { label: 'Candidats', icon: 'groups', path: 'hr/candidates' },
      ];
    }

    if (this.userRole() === 'ADMIN') {
      return [
        { label: 'Tableau de bord', icon: 'dashboard_customize', path: 'admin/dashboard' },
        { label: 'Rôles', icon: 'security', path: 'admin/roles' },
        { label: 'Workflow', icon: 'share', path: 'admin/workflow' },
        { label: 'Audit', icon: 'history', path: 'admin/audit' },
      ];
    }

    return [
      { label: 'Mon dashboard', icon: 'home', path: 'employee/dashboard' },
      { label: 'Offres', icon: 'work_outline', path: 'employee/jobs' },
      { label: 'Mes candidatures', icon: 'list_alt', path: 'employee/applications' },
      { label: 'Mon profil', icon: 'person', path: 'employee/profile' },
    ];
  });

  protected readonly userName = computed(() => {
    const user = this.authFacade.user();
    if (!user) return 'TalentConnect';
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return fullName || user.email || 'TalentConnect';
  });
}
