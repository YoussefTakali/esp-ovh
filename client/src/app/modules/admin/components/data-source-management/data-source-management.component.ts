import { Component } from '@angular/core';

interface SourceItem {
  name: string;
  category: string;
  endpoint: string;
  enabled: boolean;
}

@Component({
  selector: 'app-data-source-management',
  templateUrl: './data-source-management.component.html',
  styleUrls: ['./data-source-management.component.css']
})
export class DataSourceManagementComponent {
  search = '';
  sourceProfile = '';

  sources: SourceItem[] = [
    { name: 'PostgreSQL Primary', category: 'Relational', endpoint: 'db-primary.internal', enabled: true },
    { name: 'MySQL Archive', category: 'Relational', endpoint: 'db-archive.internal', enabled: false },
    { name: 'Mongo Analytics', category: 'Document', endpoint: 'mongo-analytics.internal', enabled: true },
    { name: 'Redis Cache', category: 'Cache', endpoint: 'redis-cache.internal', enabled: false }
  ];

  get filteredSources(): SourceItem[] {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      return this.sources;
    }

    return this.sources.filter(source =>
      source.name.toLowerCase().includes(term)
      || source.category.toLowerCase().includes(term)
      || source.endpoint.toLowerCase().includes(term)
    );
  }

  get enabledCount(): number {
    return this.sources.filter(source => source.enabled).length;
  }
}
