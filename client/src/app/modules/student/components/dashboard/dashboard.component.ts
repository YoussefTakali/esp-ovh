import { Component, OnInit } from '@angular/core';
import { StudentService, StudentDashboard } from '../../services/student.service';
import { ProjectHealthWidgetComponent } from './project-health-widget.component';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  dashboard: StudentDashboard | null = null;
  loading = true;
  error: string | null = null;

  constructor(private readonly studentService: StudentService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    
    this.studentService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.error = 'Failed to load dashboard. Please try again.';
        this.loading = false;
      }
    });
  }

  markNotificationAsRead(notificationId: string): void {
    if (!this.dashboard) {
      return;
    }

    const notification = this.dashboard.recentNotifications.find(n => n.id === notificationId);
    if (!notification || notification.isRead) {
      return;
    }

    this.studentService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        notification.isRead = true;
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return '#a71617';
      case 'medium': return '#fd7e14';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }

  getNotificationIcon(type: 'info' | 'warning' | 'success' | 'error'): string {
    switch (type) {
      case 'info': return 'fas fa-info-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      default: return 'fas fa-bell';
    }
  }

  getNotificationColor(type: 'info' | 'warning' | 'success' | 'error'): string {
    switch (type) {
      case 'info': return '#17a2b8';
      case 'warning': return '#ffc107';
      case 'success': return '#28a745';
      case 'error': return '#a71617';
      default: return '#6c757d';
    }
  }

  getDaysUntilDeadline(dueDate: Date | string): number {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) {
      return '';
    }

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get completionRate(): number {
    return this.dashboard?.completionRate ?? 0;
  }

  get participationRate(): number {
    if (!this.dashboard || !this.dashboard.totalGroups) {
      return 0;
    }
    return Math.round((this.dashboard.activeGroups / this.dashboard.totalGroups) * 100);
  }

  get onTimeSubmissionRate(): number {
    if (!this.dashboard || !this.dashboard.totalTasks) {
      return 0;
    }
    const overdue = this.dashboard.overdueTasks ?? 0;
    const completed = this.dashboard.completedTasks ?? 0;
    const onTime = Math.max(completed - overdue, 0);
    return Math.round((onTime / this.dashboard.totalTasks) * 100);
  }

  refresh(): void {
    this.loadDashboard();
  }
}
