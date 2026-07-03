import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <section class="empty-state" role="status" [attr.aria-label]="title()">
      <div class="empty-illustration">
        <div class="empty-ring outer"></div>
        <div class="empty-ring inner"></div>
        <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      </div>
      <h3 class="empty-title">{{ title() }}</h3>
      <p class="empty-msg">{{ message() }}</p>
      @if (actionLabel()) {
        <button mat-flat-button type="button" class="empty-cta" (click)="action.emit()">
          <mat-icon>add_circle</mat-icon>
          {{ actionLabel() }}
        </button>
      }
    </section>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 64px 32px;
      gap: 0;
    }
    .empty-illustration {
      position: relative;
      width: 96px;
      height: 96px;
      display: grid;
      place-items: center;
      margin-bottom: 24px;
    }
    .empty-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px dashed var(--border-base);
      animation: spin 30s linear infinite;
    }
    .empty-ring.outer { width: 96px; height: 96px; }
    .empty-ring.inner { width: 68px; height: 68px; animation-direction: reverse; animation-duration: 18s; }
    .empty-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--text-soft);
      z-index: 1;
    }
    .empty-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .empty-msg {
      color: var(--text-muted);
      font-size: 0.875rem;
      max-width: 380px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .empty-cta {
      background: var(--brand-500) !important;
      color: #fff !important;
      border-radius: 10px !important;
      padding: 0 20px !important;
      height: 40px !important;
      font-size: 0.875rem !important;
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .empty-ring { animation: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Aucune donn\u00e9e disponible');
  readonly message = input('Aucun r\u00e9sultat ne correspond aux crit\u00e8res actuels.');
  readonly actionLabel = input<string | undefined>(undefined);
  readonly action = output<void>();
}