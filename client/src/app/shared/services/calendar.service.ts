import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CalendarAttendee {
  userId: string;
  fullName: string;
  email: string;
  role: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location?: string;
  eventType: 'MEETING' | 'CLASS' | 'REVIEW' | 'CUSTOM' | 'DEADLINE';
  source: 'CUSTOM' | 'TASK_DEADLINE';
  creatorId?: string;
  creatorName?: string;
  editable: boolean;
  taskId?: string;
  attendees: CalendarAttendee[];
}

export interface CalendarCreateEventRequest {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  location?: string;
  eventType?: 'MEETING' | 'CLASS' | 'REVIEW' | 'CUSTOM';
  attendeeIds?: string[];
}

export interface CalendarAvailability {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  availabilityStatus: 'FREE' | 'BUSY';
  conflictCount: number;
  conflicts: string[];
}

export interface CalendarUserOption {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/calendar`;

  constructor(private readonly http: HttpClient) {}

  getEvents(start: string, end: string): Observable<CalendarEvent[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/events`, { params });
  }

  createEvent(payload: CalendarCreateEventRequest): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.apiUrl}/events`, payload);
  }

  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${eventId}`);
  }

  getAvailability(start: string, end: string, attendeeIds: string[]): Observable<CalendarAvailability[]> {
    let params = new HttpParams().set('start', start).set('end', end);
    for (const attendeeId of attendeeIds) {
      params = params.append('attendeeIds', attendeeId);
    }
    return this.http.get<CalendarAvailability[]>(`${this.apiUrl}/availability`, { params });
  }

  searchUsers(query: string): Observable<CalendarUserOption[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<CalendarUserOption[]>(`${this.apiUrl}/users/search`, { params });
  }
}
