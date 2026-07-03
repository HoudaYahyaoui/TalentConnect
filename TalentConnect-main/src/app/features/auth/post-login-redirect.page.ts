import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '../../core/services/auth.facade';

@Component({
  selector: 'app-post-login-redirect-page',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostLoginRedirectPageComponent {
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);

  constructor() {
    this.router.navigateByUrl(this.authFacade.landingRoute, { replaceUrl: true });
  }
}
