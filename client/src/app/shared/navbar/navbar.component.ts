import { Component, EventEmitter, Output, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SidebarService } from 'src/app/services/sidebar.service';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  recentNotifications: AppNotification[] = [];
  notificationPanelOpen = false;
  loadingRecentNotifications = false;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly sidebarService: SidebarService,
    private readonly notificationService: NotificationService,
    private readonly elementRef: ElementRef
  ) {}

  isSidebarVisible = false;
  currentUser: User | null = null;
  dropdownOpen = false;
  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.notificationPanelOpen = false;
    }
  }

  @Output() sidebarToggled = new EventEmitter<boolean>();

  ngOnInit(): void {
    // Subscribe to current user changes
    this.subscriptions.add(this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    }));

    this.subscriptions.add(
      timer(0, 30000).pipe(
        switchMap(() => this.notificationService.getUnreadCount())
      ).subscribe({
        next: (response) => {
          this.unreadCount = response.unreadCount ?? 0;
        },
        error: () => {
          this.unreadCount = 0;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
      this.notificationPanelOpen = false;
    }
  }

  onHamburgerClick(event: Event): void {
    // Stop event propagation to prevent multiple triggers
    event.preventDefault();
    event.stopPropagation();
    
    // Toggle the state
    this.isSidebarVisible = !this.isSidebarVisible;
    
    console.log('NavbarComponent: Emitting toggle request', this.isSidebarVisible);
    this.sidebarToggled.emit(this.isSidebarVisible);
    
    // Also update the service
    this.sidebarService.toggleSidebar(this.isSidebarVisible);
  }

  logout(): void {
    this.authService.logout();
  }

  editProfile(): void {
    // Navigate to a profile edit page or show a modal
    // Replace this with your actual profile editing logic
    this.router.navigate(['/profile']);
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'User';
  }

  getUserRole(): string {
    return this.currentUser?.role ?? '';
  }

  openNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  openMessenger(event?: Event): void {
    event?.stopPropagation();
    this.notificationPanelOpen = false;
    this.dropdownOpen = false;
    this.router.navigate(['/messenger']);
  }

  toggleNotificationsPanel(event: Event): void {
    event.stopPropagation();
    this.notificationPanelOpen = !this.notificationPanelOpen;

    if (this.notificationPanelOpen) {
      this.dropdownOpen = false;
      this.loadRecentNotifications();
    }
  }

  loadRecentNotifications(): void {
    this.loadingRecentNotifications = true;
    this.notificationService.getNotifications(false, 7).subscribe({
      next: (notifications) => {
        this.recentNotifications = notifications;
        this.loadingRecentNotifications = false;
      },
      error: () => {
        this.recentNotifications = [];
        this.loadingRecentNotifications = false;
      }
    });
  }

  openAllNotifications(event?: Event): void {
    event?.stopPropagation();
    this.notificationPanelOpen = false;
    this.openNotifications();
  }

  markRecentAsRead(notification: AppNotification, event: Event): void {
    event.stopPropagation();

    const targetUrl = this.resolveNotificationTarget(notification);
    const navigateToTarget = (): void => {
        if (targetUrl) {
          this.notificationPanelOpen = false;
          this.router.navigateByUrl(targetUrl);
        }
    };

    if (notification.read) {
      navigateToTarget();
      return;
    }

    this.notificationService.markAsSeen(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        navigateToTarget();
      },
      error: () => {
        navigateToTarget();
      }
    });
  }

  private resolveNotificationTarget(notification: AppNotification): string | null {
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
