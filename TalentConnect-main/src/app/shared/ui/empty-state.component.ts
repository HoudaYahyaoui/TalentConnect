import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <section class="empty-state">
      <div class="empty-illustration">
        <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </section>
  `,
  styles: [
    `
      .empty-state {
        padding: 36px 24px;
        border-radius: 16px;
        text-align: center;
        background: var(--surface-muted);
        border: 1px dashed var(--border-strong);
      }
      .empty-illustration { margin-bottom: 12px; }
      .empty-icon {
        font-size: 40px; width: 40px; height: 40px;
        color: var(--text-soft); opacity: 0.45;
      }
      h3 { margin-bottom: 6px; font-size: 0.95rem; }
      p { margin: 0; color: var(--text-muted); font-size: 0.82rem; line-height: 1.6; max-width: 340px; margin: 0 auto; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Aucune donnée';
  @Input() description = 'Aucun contenu disponible pour le moment.';
}
