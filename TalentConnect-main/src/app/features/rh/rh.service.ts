import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockApiService } from '../../core/services/mock-api.service';
import { Candidate, Application } from '../../api/models/api-models';

@Injectable({ providedIn: 'root' })
export class RhService {
  constructor(private readonly mockApi: MockApiService) {}

  getCandidates(): Observable<Candidate[]> {
    return this.mockApi.get<Candidate[]>('candidates.json');
  }

  getApplications(): Observable<Application[]> {
    return this.mockApi.get<Application[]>('applications.json');
  }
}
