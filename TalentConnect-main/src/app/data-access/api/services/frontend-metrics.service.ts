import { Injectable, inject } from '@angular/core';
import { ApiHttpService } from '../http/api-http.service';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../../core/services/auth.facade';

export interface FrontendMetric {
  eventName: string;
  timestamp: string;
  userId?: string;
  path?: string;
  component?: string;
  // Add any other relevant data you want to collect
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class FrontendMetricsService {
  private readonly api = inject(ApiHttpService);
  private readonly authFacade = inject(AuthFacade);
  private readonly metricsEndpoint = 'metrics/frontend'; // Endpoint on your backend

  /**
   * Records a frontend usage metric by sending it to the backend.
   * @param metric The metric object to record.
   * @returns An Observable that completes when the metric is sent.
   */
  recordMetric(metric: FrontendMetric): Observable<any> {
    const userId = this.authFacade.user()?.id;
    const metricWithContext: FrontendMetric = {
      ...metric,
      timestamp: new Date().toISOString(),
      userId: userId,
    };
    // Assuming your backend has a dedicated endpoint for frontend metrics
    // This endpoint should be configured to receive and process these metrics
    // and potentially expose them for Prometheus scraping.
    return this.api.postTo(this.api.baseApiUrl, this.metricsEndpoint, metricWithContext);
  }
}
