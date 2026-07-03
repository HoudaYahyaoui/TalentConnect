import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" role="status" aria-label="Chargement en cours...">
      <div class="skeleton-row" *ngFor="let row of rows; let i = index" [style.animation-delay]="(i * 80) + 'ms'">
        <div class="skeleton-avatar" [style.animation-delay]="(i * 80) + 'ms'"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line long"  [style.animation-delay]="(i * 80 + 40) + 'ms'"></div>
          <div class="skeleton-line short" [style.animation-delay]="(i * 80 + 80) + 'ms'"></div>
        </div>
        <div class="skeleton-chip" [style.animation-delay]="(i * 80 + 60) + 'ms'"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      display: grid;
      gap: 8px;
    }
    .skeleton-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      border-radius: 12px;
      background: var(--surface-raised);
      border: 1px solid var(--border-subtle);
      animation: fade-in 400ms ease forwards;
      opacity: 0;
    }
    .skeleton-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--border-base);
      flex-shrink: 0;
    }
    .skeleton-lines {
      flex: 1;
      display: grid;
      gap: 8px;
    }
    .skeleton-line {
      height: 11px;
      border-radius: 999px;
      background: var(--border-subtle);
    }
    .skeleton-line.long { width: 65%; }
    .skeleton-line.short { width: 38%; }
    .skeleton-chip {
      width: 64px;
      height: 22px;
      border-radius: 999px;
      background: var(--border-subtle);
      flex-shrink: 0;
    }
    .skeleton-avatar,
    .skeleton-line,
    .skeleton-chip {
      animation: shimmer 1.6s ease-in-out infinite;
      background-size: 200% 100%;
      background-image: linear-gradient(
        90deg,
        var(--border-subtle) 0%,
        color-mix(in srgb, var(--border-base) 40%, var(--surface-base)) 50%,
        var(--border-subtle) 100%
      );
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes fade-in {
      to { opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .skeleton-row, .skeleton-avatar, .skeleton-line, .skeleton-chip {
        animation: none; opacity: 1;
        background: var(--border-subtle);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonListComponent {
  readonly count = input(5);
  get rows(): number[] { return Array.from({ length: this.count() }); }
}