import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <article class="metric-card">
      <div class="metric-top">
        <span class="metric-label">{{ label }}</span>
        @if (icon) { <mat-icon class="metric-icon">{{ icon }}</mat-icon> }
      </div>
      <strong class="metric-value">{{ value }}</strong>
      @if (hint) { <span class="metric-hint">{{ hint }}</span> }
    </article>
  `,
  styles: [`
    .metric-card {
      display: grid;
      gap: 4px;
      padding: 16px 18px;
      border-radius: 14px;
      background: var(--surface-raised);
      border: 1px solid var(--border-subtle);
    }
    .metric-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2px;
    }
    .metric-label { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }
    .metric-icon { font-size: 18px; width: 18px; height: 18px; color: var(--brand-500); opacity: 0.7; }
    .metric-value { font-size: 1.75rem; font-weight: 800; line-height: 1; color: var(--text-primary); }
    .metric-hint { font-size: 0.72rem; color: var(--text-soft); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() hint = '';
  @Input() icon = '';
}
