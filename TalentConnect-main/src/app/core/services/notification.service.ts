import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationDto, ApiResponse } from '../api/models/backend-api-models';

/**
 * Notification locale (pour toasts, snackbars, etc.)
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  // Notifications sont servies par le candidatures-service (port 8084)
  private readonly apiUrl = environment.services.candidatures;

  // Local notifications (toasts/snackbars)
  private notifications = signal<Notification[]>([]);

  /**
   * Affiche une notification locale
   */
  show(notification: Omit<Notification, 'id'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    this.notifications.update((notifs) => [...notifs, newNotification]);

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        this.remove(newNotification.id);
      }, notification.duration || 5000);
    }
  }

  /**
   * Supprime une notification locale
   */
  remove(id: string): void {
    this.notifications.update((notifs) => notifs.filter((n) => n.id !== id));
  }

  /**
   * Récupère les notifications locales
   */
  getNotifications() {
    return this.notifications.asReadonly();
  }

  // ========================================================================
  // NOTIFICATIONS BACKEND API
  // ========================================================================

  /**
   * Récupère toutes les notifications de l'utilisateur connecté
   * GET /api/notifications
   */
  getBackendNotifications(): Observable<NotificationDto[]> {
    return this.http
      .get<ApiResponse<NotificationDto[]>>(`${this.apiUrl}/notifications`)
      .pipe(map((response) => response.data));
  }

  /**
   * Récupère le nombre de notifications non lues
   * GET /api/notifications/unread-count
   */
  getUnreadCount(): Observable<number> {
    return this.http
      .get<ApiResponse<{ count: number }>>(`${this.apiUrl}/notifications/unread-count`)
      .pipe(map((response) => response.data?.count ?? 0));
  }

  /**
   * Marque une notification comme lue
   * PATCH /api/notifications/{id}/read
   */
  markAsRead(id: number): Observable<NotificationDto> {
    return this.http
      .patch<ApiResponse<NotificationDto>>(`${this.apiUrl}/notifications/${id}/read`, {})
      .pipe(map((response) => response.data));
  }

  /**
   * Marque toutes les notifications comme lues
   * PATCH /api/notifications/read-all
   */
  markAllAsRead(): Observable<void> {
    return this.http
      .patch<ApiResponse<null>>(`${this.apiUrl}/notifications/read-all`, {})
      .pipe(map(() => undefined));
  }

  /**
   * Supprime une notification
   * DELETE /api/notifications/{id}
   */
  deleteBackendNotification(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/notifications/${id}`)
      .pipe(map(() => undefined));
  }
}
