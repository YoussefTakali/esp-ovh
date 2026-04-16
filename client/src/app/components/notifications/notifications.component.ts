import { Component, OnInit } from '@angular/core';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  loading = false;
  unreadOnly = false;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(this.unreadOnly, 200).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load notifications', error);
        this.loading = false;
      }
    });
  }

  toggleUnreadOnly(): void {
    this.unreadOnly = !this.unreadOnly;
    this.loadNotifications();
  }

  markAsSeen(notification: AppNotification, event?: Event): void {
    event?.stopPropagation();

    if (notification.read) {
      return;
    }

    this.notificationService.markAsSeen(notification.id).subscribe({
      next: () => {
        notification.read = true;
      },
      error: (error) => {
        console.error('Failed to mark notification as seen', error);
      }
    });
  }

  markAllAsSeen(): void {
    this.notificationService.markAllAsSeen().subscribe({
      next: () => {
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          read: true
        }));
      },
      error: (error) => {
        console.error('Failed to mark all notifications as seen', error);
      }
    });
  }

  deleteNotification(notification: AppNotification, event?: Event): void {
    event?.stopPropagation();

    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((item) => item.id !== notification.id);
      },
      error: (error) => {
        console.error('Failed to delete notification', error);
      }
    });
  }

  deleteAllNotifications(): void {
    this.notificationService.deleteAllNotifications().subscribe({
      next: () => {
        this.notifications = [];
      },
      error: (error) => {
        console.error('Failed to delete all notifications', error);
      }
    });
  }

  markAsRead(notification: AppNotification): void {
    this.markAsSeen(notification);
  }

  markAllAsRead(): void {
    this.markAllAsSeen();
  }

  getUnreadCount(): number {
    return this.notifications.filter((notification) => !notification.read).length;
  }

  trackByNotificationId(index: number, notification: AppNotification): number {
    return notification.id;
  }

  openNotification(notification: AppNotification): void {
    const targetUrl = this.resolveTargetUrl(notification);
    if (!targetUrl) {
      this.markAsSeen(notification);
      return;
    }

    const navigate = (): void => {
      this.router.navigateByUrl(targetUrl);
    };

    if (notification.read) {
      navigate();
      return;
    }

    this.notificationService.markAsSeen(notification.id).subscribe({
      next: () => {
        notification.read = true;
        navigate();
      },
      error: () => {
        navigate();
      }
    });
  }

  canOpenNotification(notification: AppNotification): boolean {
    return !!this.resolveTargetUrl(notification);
  }

  private resolveTargetUrl(notification: AppNotification): string | null {
    const targetUrl = notification.targetUrl?.trim();
    if (targetUrl) {
      return targetUrl;
    }

    if ((notification.type ?? '').toUpperCase() === 'MESSAGE') {
      return '/messenger';
    }

    return null;
  }
}
