import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

const MOCK_BASE = '/mock/portal';

@Injectable({ providedIn: 'root' })
export class PortalMockApiService {
  private readonly http = inject(HttpClient);

  get<T>(fileName: string): Observable<T> {
    return this.http.get<T>(`${MOCK_BASE}/${fileName}`).pipe(delay(220));
  }
}
