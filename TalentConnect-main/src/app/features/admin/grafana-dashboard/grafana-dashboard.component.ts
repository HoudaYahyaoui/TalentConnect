import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-grafana-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafana-dashboard.component.html',
  styleUrl: './grafana-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrafanaDashboardComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  @Input()
  grafanaEmbedUrl: string = ''; // This will be the URL copied from Grafana's share/embed option

  safeGrafanaUrl: SafeResourceUrl | undefined;

  ngOnInit(): void {
    if (this.grafanaEmbedUrl) {
      this.safeGrafanaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.grafanaEmbedUrl);
    } else {
      console.warn('Grafana embed URL is not provided for GrafanaDashboardComponent.');
    }
  }
}
