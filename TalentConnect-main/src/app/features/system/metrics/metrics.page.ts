import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontendMetricsService } from '../../../core/services/frontend-metrics.service';

@Component({
  selector: 'app-metrics-page',
  standalone: true,
  imports: [CommonModule],
  template: `<pre>{{ metricsText }}</pre>`,
  styles: [`
    :host {
      display: block;
      white-space: pre;
      font-family: monospace;
      background-color: #f0f0f0;
      padding: 10px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsPageComponent implements OnInit {
  private readonly metricsService = inject(FrontendMetricsService);
  metricsText: string = '';

  ngOnInit(): void {
    this.metricsText = this.metricsService.getMetricsText();
  }
}
