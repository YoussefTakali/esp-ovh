import { Component } from '@angular/core';

interface MonitoringMetric {
  label: string;
  used: number;
  total: number;
  unit: string;
}

interface DatabaseOption {
  id: string;
  label: string;
  engine: string;
  checked: boolean;
}

@Component({
  selector: 'app-system-monitoring',
  templateUrl: './system-monitoring.component.html',
  styleUrls: ['./system-monitoring.component.css']
})
export class SystemMonitoringComponent {
  readonly metrics: MonitoringMetric[] = [
    { label: 'RAM', used: 5.6, total: 8, unit: 'GB' },
    { label: 'Storage', used: 39, total: 70, unit: 'GB' }
  ];

  aiEnabled = true;
  autoDeploymentEnabled = false;
  githubSyncEnabled = true;

  loadProfile = '';
  dbOptions: DatabaseOption[] = [
    { id: 'postgres', label: 'PostgreSQL', engine: 'OLTP', checked: true },
    { id: 'mysql', label: 'MySQL', engine: 'Relational', checked: false },
    { id: 'mongodb', label: 'MongoDB', engine: 'Document', checked: false },
    { id: 'redis', label: 'Redis', engine: 'Cache', checked: false }
  ];

  getUsagePercentage(metric: MonitoringMetric): number {
    if (metric.total === 0) {
      return 0;
    }

    return Math.round((metric.used / metric.total) * 100);
  }

  selectedSources(): string {
    const selected = this.dbOptions.filter(option => option.checked).map(option => option.label);
    return selected.length > 0 ? selected.join(', ') : 'No data source selected';
  }
}
