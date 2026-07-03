import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-auth-redirect',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="redirect-shell">Redirection en cours...</div>',
})
export class AuthRedirectComponent implements OnInit {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  ngOnInit() {
    const route = this.authFacade.landingRoute;
    this.router.navigate(route);
  }
}
