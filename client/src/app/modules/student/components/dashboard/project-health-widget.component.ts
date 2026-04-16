import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-project-health-widget',
  template: `
    <div class="project-health-widget">
      <div class="health-header" [ngClass]="healthColor">
        <div class="health-icon">
          <i [class]="healthIcon"></i>
        </div>
        <div>
          <p class="label">Project Health</p>
          <h3>{{ healthMessage }}</h3>
        </div>
      </div>

      <div class="health-body">
        <div class="metric">
          <div class="metric-label">
            <span>Completion</span>
            <strong>{{ completionRate }}%</strong>
          </div>
          <div class="metric-bar">
            <div class="metric-fill" [style.width.%]="completionRate"></div>
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">
            <span>Participation</span>
            <strong>{{ participation }}%</strong>
          </div>
          <div class="metric-bar">
            <div class="metric-fill" [style.width.%]="participation"></div>
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">
            <span>On-Time Submissions</span>
            <strong>{{ onTime }}%</strong>
          </div>
          <div class="metric-bar">
            <div class="metric-fill" [style.width.%]="onTime"></div>
          </div>
        </div>

        <div class="metric-tags">
          <span class="metric-chip">
            <i class="fas fa-check-circle"></i>
            {{ completionRate >= 80 ? 'On Track' : 'Pending Improvements' }}
          </span>
          <span class="metric-chip">
            <i class="fas fa-users"></i>
            {{ participation >= 60 ? 'Active Team' : 'Boost Collaboration' }}
          </span>
          <span class="metric-chip">
            <i class="fas fa-clock"></i>
            {{ onTime >= 70 ? 'Timely Delivery' : 'Review Deadlines' }}
          </span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./project-health-widget.component.css']
})
export class ProjectHealthWidgetComponent {
  @Input() completionRate = 0;
  @Input() participation = 0;
  @Input() onTime = 0;

  get healthColor(): 'good' | 'warning' | 'bad' {
    if (this.completionRate > 80 && this.participation > 70 && this.onTime > 80) return 'good';
    if (this.completionRate > 50 && this.participation > 40 && this.onTime > 50) return 'warning';
    return 'bad';
  }

  get healthMessage(): string {
    switch (this.healthColor) {
      case 'good':
        return 'Healthy trajectory';
      case 'warning':
        return 'Needs attention';
      default:
        return 'At risk';
    }
  }

  get healthIcon(): string {
    switch (this.healthColor) {
      case 'good':
        return 'fas fa-smile-beam';
      case 'warning':
        return 'fas fa-exclamation-circle';
      default:
        return 'fas fa-heartbeat';
    }
  }
} 