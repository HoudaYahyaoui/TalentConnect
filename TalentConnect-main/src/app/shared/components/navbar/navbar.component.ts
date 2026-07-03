import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly authFacade = inject(AuthFacade);

  protected readonly user = this.authFacade.user;
  protected readonly userDisplayName = computed(() => {
    const user = this.authFacade.user();
    if (!user) return '';
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return fullName || user.email;
  });
  protected readonly userInitial = computed(() => this.userDisplayName().charAt(0) || '?');

  logout(): void {
    this.authFacade.logout();
  }
}
