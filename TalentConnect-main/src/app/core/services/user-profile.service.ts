import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiHttpService } from '../../data-access/api/http/api-http.service';
import { SessionStore } from '../state/session.store';
import { UserProfile } from '../../data-access/models/portal.models';

export interface ExtendedProfile extends UserProfile {
  phone?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
}

interface BackendUserProfile {
  id: number;
  employeeId?: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  department?: string;
  location?: string;
  title?: string;
  experienceYears?: number;
  avatarUrl?: string;
  languages?: string[];
  skills?: string[];
}

interface BackendUserProfileUpdate {
  firstName?: string;
  lastName?: string;
  department?: string;
  location?: string;
  title?: string;
  experienceYears?: number;
  avatarUrl?: string | null;
  languages?: string[];
  skills?: string[];
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly api = inject(ApiHttpService);
  private readonly session = inject(SessionStore);

  loadProfile(): Observable<ExtendedProfile> {
    return this.api.getFrom<BackendUserProfile>(this.api.authBase, 'users/profile').pipe(
      map((profile) => this.toExtendedProfile(profile)),
      tap((profile) => this.updateSession(profile)),
    );
  }

  save(updates: Partial<ExtendedProfile>): Observable<ExtendedProfile> {
    const payload: BackendUserProfileUpdate = {
      firstName: updates.firstName,
      lastName: updates.lastName,
      department: updates.department,
      location: updates.location,
      title: updates.title,
      experienceYears: updates.experienceYears,
      avatarUrl: updates.avatarUrl ?? null,
      languages: updates.languages,
      skills: updates.skills,
    };

    return this.api.putTo<BackendUserProfile>(this.api.authBase, 'users/profile', payload).pipe(
      map((profile) => this.toExtendedProfile(profile)),
      tap((profile) => this.updateSession(profile)),
    );
  }

  private toExtendedProfile(profile: BackendUserProfile): ExtendedProfile {
    const role = profile.roles?.[0] === 'RH' ? 'HR' : (profile.roles?.[0] ?? 'EMPLOYEE');

    // Ensure all fields have valid values (handle null/undefined from backend)
    const skills = Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills : [];
    const languages = Array.isArray(profile.languages) && profile.languages.length > 0 ? profile.languages : [];
    const experienceYears = typeof profile.experienceYears === 'number' ? profile.experienceYears : 0;

    return {
      id: String(profile.id),
      employeeId: profile.employeeId ?? String(profile.id),
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email,
      role: role === 'ADMIN' ? 'ADMIN' : role === 'HR' ? 'HR' : 'EMPLOYEE',
      department: profile.department ?? '',
      location: profile.location ?? '',
      title: profile.title ?? '',
      skills,
      experienceYears,
      avatarUrl: profile.avatarUrl,
      languages,
    };
  }

  private updateSession(profile: ExtendedProfile): void {
    const token = this.session.getToken();
    if (token) {
      this.session.setSession(token, profile);
    }
  }
}
