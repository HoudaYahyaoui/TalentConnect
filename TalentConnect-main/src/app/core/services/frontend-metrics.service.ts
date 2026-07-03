import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Metric {
  name: string;
  help: string;
  value: number;
  labels?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class FrontendMetricsService {
  private metrics = new Map<string, Metric>();

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.incrementCounter('page_views_total', 'Total number of page views', { path: event.urlAfterRedirects });
    });
  }

  /**
   * Increments a counter metric.
   * @param name The name of the metric (e.g., 'login_attempts_total').
   * @param help A description of the metric.
   * @param labels Optional labels for the metric (e.g., { status: 'success' }).
   */
  incrementCounter(name: string, help: string, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const currentMetric = this.metrics.get(key);

    if (currentMetric) {
      currentMetric.value++;
    } else {
      this.metrics.set(key, { name, help, value: 1, labels });
    }
  }

  /**
   * Sets a gauge metric to a specific value.
   * @param name The name of the metric (e.g., 'active_users').
   * @param help A description of the metric.
   * @param value The value to set the gauge to.
   * @param labels Optional labels for the metric.
   */
  setGauge(name: string, help: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    this.metrics.set(key, { name, help, value, labels });
  }

  /**
   * Generates metrics in Prometheus text format.
   */
  getMetricsText(): string {
    let output = '';
    this.metrics.forEach((metric) => {
      const labels = metric.labels
        ? `{${Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
        : '';
      output += `# HELP ${metric.name} ${metric.help}\n`;
      output += `# TYPE ${metric.name} counter\n`; // Assuming all are counters for now, can be extended
      output += `${metric.name}${labels} ${metric.value}\n`;
    });
    return output;
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    return labels ? `${name}_${JSON.stringify(labels)}` : name;
  }
}
