import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPageComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'app',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./core/layout/portal-shell.component').then((m) => m.PortalShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/auth/post-login-redirect.page').then(
            (m) => m.PostLoginRedirectPageComponent,
          ),
      },
      {
        path: 'employee',
        canMatch: [roleGuard],
        data: { roles: ['EMPLOYEE'] },
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/employee/dashboard/employee-dashboard.page').then(
                (m) => m.EmployeeDashboardPageComponent,
              ),
          },
          {
            path: 'jobs',
            loadComponent: () =>
              import('./features/employee/jobs/employee-jobs.page').then(
                (m) => m.EmployeeJobsPageComponent,
              ),
          },
          {
            path: 'jobs/:id',
            loadComponent: () =>
              import('./features/employee/jobs/employee-job-detail.page').then(
                (m) => m.EmployeeJobDetailPageComponent,
              ),
          },
          {
            path: 'jobs/:id/apply',
            loadComponent: () =>
              import('./features/employee/apply-internal/apply-internal.component').then(
                (m) => m.ApplyInternalComponent,
              ),
          },
          {
            path: 'applications',
            loadComponent: () =>
              import('./features/employee/applications/employee-applications.page').then(
                (m) => m.EmployeeApplicationsPageComponent,
              ),
          },
          {
            path: 'my-applications',
            loadComponent: () =>
              import('./features/employee/my-applications/my-applications.component').then(
                (m) => m.MyApplicationsComponent,
              ),
          },
          {
            path: 'referrals',
            loadComponent: () =>
              import('./features/employee/referrals/employee-referrals.page').then(
                (m) => m.EmployeeReferralsPageComponent,
              ),
          },
          {
            path: 'recommend',
            loadComponent: () =>
              import('./features/employee/recommend-external/recommend-external.component').then(
                (m) => m.RecommendExternalComponent,
              ),
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('./features/employee/profile/employee-profile.page').then(
                (m) => m.EmployeeProfilePageComponent,
              ),
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('./features/employee/notifications/employee-notifications.page').then(
                (m) => m.EmployeeNotificationsPageComponent,
              ),
          },
          {
            path: 'saved-searches',
            loadComponent: () =>
              import('./features/employee/saved-searches/employee-saved-searches.page').then(
                (m) => m.EmployeeSavedSearchesPageComponent,
              ),
          },
        ],
      },
      {
        path: 'hr',
        canMatch: [roleGuard],
        data: { roles: ['HR'] },
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/hr/dashboard/hr-dashboard.page').then(
                (m) => m.HrDashboardPageComponent,
              ),
          },
          {
            path: 'jobs',
            loadComponent: () =>
              import('./features/hr/jobs/hr-jobs.page').then((m) => m.HrJobsPageComponent),
          },
          {
            path: 'candidates',
            loadComponent: () =>
              import('./features/hr/candidates/hr-candidates.page').then(
                (m) => m.HrCandidatesPageComponent,
              ),
          },
          {
            path: 'kanban',
            loadComponent: () =>
              import('./features/hr/kanban/hr-kanban.page').then((m) => m.HrKanbanPageComponent),
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./features/hr/reports/hr-reports.page').then((m) => m.HrReportsPageComponent),
          },
          {
            path: 'referrals',
            loadComponent: () =>
              import('./features/hr/referrals/hr-referrals.page').then(
                (m) => m.HrReferralsPageComponent,
              ),
          },
        ],
      },
      {
        path: 'admin',
        canMatch: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/dashboard/admin-dashboard.component').then(
                (m) => m.AdminDashboardComponent,
              ),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/users/admin-users.page').then(
                (m) => m.AdminUsersPageComponent,
              ),
          },
          {
            path: 'roles',
            loadComponent: () =>
              import('./features/admin/roles/roles.component').then((m) => m.RolesComponent),
          },
          {
            path: 'workflow',
            loadComponent: () =>
              import('./features/admin/workflow/workflow.component').then(
                (m) => m.WorkflowComponent,
              ),
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/admin/settings/admin-settings.page').then(
                (m) => m.AdminSettingsPageComponent,
              ),
          },
           {
             path: 'grafana',
             loadComponent: () =>
               import('./features/admin/grafana-dashboard/grafana-dashboard.component').then(
                 (m) => m.GrafanaDashboardComponent,
               ),
             data: {
               // URL Grafana (externe). Utilisez l'URL publique fournie. Pour Grafana Cloud la meilleure option
               // reste d'ouvrir le tableau de bord dans un nouvel onglet (CSP peut bloquer l'iframe).
               grafanaEmbedUrl: 'https://greenmockingbird2932.grafana.net/public-dashboards/18683b2494c941cc8d766b2a82b8e12a'
             }
           },
        ],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/employee/profile/employee-profile.page').then(
            (m) => m.EmployeeProfilePageComponent,
          ),
      },
    ],
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./features/system/forbidden/forbidden.page').then((m) => m.ForbiddenPageComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/system/not-found/not-found.page').then((m) => m.NotFoundPageComponent),
  },
];
