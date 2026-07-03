import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

const MOCK_ASSET_BASE_PATH = '/mock';

@Injectable({
  providedIn: 'root',
})
export class MockApiService {
  constructor(private readonly http: HttpClient) {}

  get<T>(filename: string): Observable<T> {
    return this.http.get<T>(`${MOCK_ASSET_BASE_PATH}/${filename}`).pipe(delay(560));
  }
}
