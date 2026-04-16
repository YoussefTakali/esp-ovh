import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  targetUrl?: string;
  timestamp: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/notifications`;

  constructor(private readonly http: HttpClient) {}

  getNotifications(unreadOnly = false, limit = 100): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.API_URL}?unreadOnly=${unreadOnly}&limit=${limit}`);
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.API_URL}/unread-count`);
  }

  markAsSeen(notificationId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/${notificationId}/seen`, {});
  }

  markAsRead(notificationId: number): Observable<{ message: string }> {
    return this.markAsSeen(notificationId);
  }

  markAllAsSeen(): Observable<{ message: string; updated: number }> {
    return this.http.post<{ message: string; updated: number }>(`${this.API_URL}/seen-all`, {});
  }

  markAllAsRead(): Observable<{ message: string; updated: number }> {
    return this.markAllAsSeen();
  }

  deleteNotification(notificationId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${notificationId}`);
  }

  deleteAllNotifications(): Observable<{ message: string; deleted: number }> {
    return this.http.delete<{ message: string; deleted: number }>(this.API_URL);
  }
}
