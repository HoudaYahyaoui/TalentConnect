import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';

type GrafanaEnvironment = 'cloud' | 'local' | 'unknown';

@Component({
  selector: 'app-grafana-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './grafana-dashboard.component.html',
  styleUrl: './grafana-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrafanaDashboardComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly activatedRoute = inject(ActivatedRoute);

  @Input()
  grafanaEmbedUrl: string = '';

  safeGrafanaUrl: SafeResourceUrl | undefined;
  grafanaEnvironment: GrafanaEnvironment = 'unknown';
  isLocalEnvironment = false;

  ngOnInit(): void {
    // Lire l'URL soit depuis @Input soit depuis ActivatedRoute.data
    if (!this.grafanaEmbedUrl) {
      this.grafanaEmbedUrl =
        this.activatedRoute.snapshot.data['grafanaEmbedUrl'] || '';
    }

    if (this.grafanaEmbedUrl) {
      this.checkGrafanaEnvironment();
      this.initializeGrafana();
    } else {
      console.warn('Grafana embed URL is not provided for GrafanaDashboardComponent.');
    }
  }

  private checkGrafanaEnvironment(): void {
    const urlLower = this.grafanaEmbedUrl.toLowerCase();

    if (
      urlLower.includes('localhost:3000') ||
      urlLower.includes('127.0.0.1:3000') ||
      urlLower.includes('192.168.')
    ) {
      this.grafanaEnvironment = 'local';
      this.isLocalEnvironment = true;
    } else if (
      urlLower.includes('grafana.org') ||
      urlLower.includes('grafana.com') ||
      urlLower.includes('grafana.net') ||
      urlLower.includes('play.grafana.org')
    ) {
      this.grafanaEnvironment = 'cloud';
    } else {
      this.grafanaEnvironment = 'unknown';
    }
  }

  private initializeGrafana(): void {
    if (this.isLocalEnvironment) {
      this.safeGrafanaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.grafanaEmbedUrl);
    }
  }

  openGrafanaInNewTab(): void {
    if (this.grafanaEmbedUrl) {
      window.open(this.grafanaEmbedUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
