import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthFacade } from '../../../core/services/auth.facade';
import { getUserFriendlyHttpError } from '../../../core/utils/http-error-message';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly errorMsg = signal('');
  protected readonly currentYear = new Date().getFullYear();

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.authFacade
      .login(this.form.getRawValue().email, this.form.getRawValue().password)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl(this.authFacade.landingRoute);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          localStorage.removeItem('tc_token');
          localStorage.removeItem('tc_user');
          const msg = getUserFriendlyHttpError(error, '/auth/login');
          this.errorMsg.set(msg);
          this.toast.open(msg, 'Fermer', { duration: 4000 });
          this.form.controls.password.reset();
        },
      });
  }
}
