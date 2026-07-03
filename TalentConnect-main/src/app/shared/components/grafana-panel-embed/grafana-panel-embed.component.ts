import { ChangeDetectionStrategy, Component, Input, OnChanges, SecurityContext, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-grafana-panel-embed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grafana-embed-container">
      @if (safeUrl) {
        <iframe [src]="safeUrl" frameborder="0" allowfullscreen></iframe>
      } @else {
        <p class="error-message">URL Grafana invalide ou manquante.</p>
      }
    </div>
  `,
  styles: `
    .grafana-embed-container {
      width: 100%;
      height: 100%;
      min-height: 300px; /* Default minimum height */
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--surface-default);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .grafana-embed-container iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .error-message {
      color: var(--text-secondary);
      font-style: italic;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrafanaPanelEmbedComponent implements OnChanges {
  @Input({ required: true }) grafanaUrl!: string;
  @Input() height: string = '400px'; // Optional: to set iframe height

  safeUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grafanaUrl'] && this.grafanaUrl) {
      // Sanitize the URL to prevent XSS attacks
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.grafanaUrl);
    } else if (changes['grafanaUrl'] && !this.grafanaUrl) {
      this.safeUrl = null;
    }
  }
}
