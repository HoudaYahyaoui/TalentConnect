import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserDto } from '../../../core/api/models/backend-api-models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: UserDto | null = null;

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user?.role === 'EMPLOYEE') {
      this.router.navigate(['/app/employee/dashboard']);
    } else if (this.user?.role === 'HR') {
      this.router.navigate(['/app/hr/dashboard']);
    } else if (this.user?.role === 'ADMIN') {
      this.router.navigate(['/app/admin/dashboard']);
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
