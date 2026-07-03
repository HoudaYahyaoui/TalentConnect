import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <section class="error-state" role="alert" aria-live="assertive">
      <div class="error-icon-wrap">
        <div class="error-pulse"></div>
        <mat-icon class="error-icon">error_outline</mat-icon>
      </div>
      <h3 class="error-title">{{ title() }}</h3>
      <p class="error-msg">{{ message() }}</p>
      <div class="error-actions">
        <button mat-flat-button type="button" class="retry-btn" (click)="retry.emit()">
          <mat-icon>refresh</mat-icon> {{ retryLabel() }}
        </button>
        <button mat-stroked-button type="button" class="back-btn" (click)="goBack()">Retour</button>
      </div>
      <p class="error-hint">Si le problème persiste, contactez le support technique.</p>
    </section>
  `,
  styles: [`
    .error-state { display:flex; flex-direction:column; align-items:center; text-align:center; padding:64px 32px; gap:0; max-width:480px; margin:0 auto; }
    .error-icon-wrap { position:relative; width:72px; height:72px; display:grid; place-items:center; margin-bottom:20px; }
    .error-pulse { position:absolute; inset:0; border-radius:50%; background:var(--surface-danger,rgba(239,68,68,.08)); animation:pulse-ring 2.5s ease-in-out infinite; }
    .error-icon { font-size:36px; width:36px; height:36px; color:var(--danger-500); z-index:1; }
    .error-title { font-size:1.1rem; font-weight:700; color:var(--text-secondary); margin-bottom:8px; }
    .error-msg { color:var(--text-muted); font-size:.875rem; line-height:1.6; margin-bottom:24px; }
    .error-actions { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-bottom:16px; }
    .retry-btn { background:var(--danger-500) !important; color:#fff !important; border-radius:10px !important; }
    .back-btn { border-radius:10px !important; color:var(--text-muted) !important; }
    .error-hint { font-size:.78rem; color:var(--text-soft); }
    @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.15);opacity:.3} }
    @media (prefers-reduced-motion:reduce) { .error-pulse { animation:none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  readonly title = input('Impossible de charger les données');
  readonly message = input('Une erreur est survenue. Vérifiez votre connexion et réessayez.');
  readonly retryLabel = input('Réessayer');
  readonly retry = output<void>();
  protected goBack(): void { history.back(); }
}
