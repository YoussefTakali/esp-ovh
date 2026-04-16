import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CalendarAvailability,
  CalendarCreateEventRequest,
  CalendarEvent,
  CalendarService,
  CalendarUserOption
} from '../../shared/services/calendar.service';
import { PopupService } from '../../shared/services/popup.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy {
  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  currentMonth = new Date();
  selectedDate = new Date();
  calendarDays: CalendarDay[] = [];

  events: CalendarEvent[] = [];
  loadingEvents = false;
  eventsError: string | null = null;

  showCreatePanel = false;
  creatingEvent = false;
  createError: string | null = null;

  userSearchQuery = '';
  userSearchLoading = false;
  userSuggestions: CalendarUserOption[] = [];
  selectedInvitees: CalendarUserOption[] = [];
  availability: CalendarAvailability[] = [];

  createForm: {
    title: string;
    description: string;
    eventType: 'MEETING' | 'CLASS' | 'REVIEW' | 'CUSTOM';
    location: string;
    startAt: string;
    endAt: string;
  } = {
    title: '',
    description: '',
    eventType: 'MEETING',
    location: '',
    startAt: '',
    endAt: ''
  };

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly calendarService: CalendarService,
    private readonly popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.refreshCalendar();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  refreshCalendar(): void {
    this.buildCalendarDays();
    this.loadEventsForVisibleGrid();
  }

  goToToday(): void {
    this.currentMonth = new Date();
    this.selectedDate = new Date();
    this.refreshCalendar();
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.refreshCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.refreshCalendar();
  }

  openCreatePanel(): void {
    this.showCreatePanel = true;
    this.createError = null;
    this.selectedInvitees = [];
    this.availability = [];
    this.userSuggestions = [];
    this.userSearchQuery = '';
    this.seedDateTimeFields();
  }

  closeCreatePanel(): void {
    this.showCreatePanel = false;
    this.createError = null;
  }

  selectDate(day: CalendarDay): void {
    this.selectedDate = new Date(day.date);
  }

  eventsForDay(day: Date): CalendarEvent[] {
    return this.events.filter(event => this.isSameDay(new Date(event.startAt), day));
  }

  selectedDayEvents(): CalendarEvent[] {
    return this.eventsForDay(this.selectedDate).sort((a, b) =>
      new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
  }

  onUserQueryChanged(): void {
    const query = this.userSearchQuery.trim();

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    if (query.length < 2) {
      this.userSuggestions = [];
      return;
    }

    this.searchTimer = setTimeout(() => {
      this.userSearchLoading = true;
      this.calendarService.searchUsers(query).subscribe({
        next: users => {
          this.userSuggestions = users.filter(user =>
            !this.selectedInvitees.some(invitee => invitee.id === user.id)
          );
          this.userSearchLoading = false;
        },
        error: () => {
          this.userSuggestions = [];
          this.userSearchLoading = false;
        }
      });
    }, 250);
  }

  addInvitee(user: CalendarUserOption): void {
    if (this.selectedInvitees.some(invitee => invitee.id === user.id)) {
      return;
    }

    this.selectedInvitees = [...this.selectedInvitees, user];
    this.userSuggestions = this.userSuggestions.filter(item => item.id !== user.id);
    this.userSearchQuery = '';
    this.refreshAvailability();
  }

  removeInvitee(userId: string): void {
    this.selectedInvitees = this.selectedInvitees.filter(invitee => invitee.id !== userId);
    this.refreshAvailability();
  }

  refreshAvailability(): void {
    if (!this.createForm.startAt || !this.createForm.endAt || this.selectedInvitees.length === 0) {
      this.availability = [];
      return;
    }

    this.calendarService
      .getAvailability(this.toIsoLocalDateTime(this.createForm.startAt), this.toIsoLocalDateTime(this.createForm.endAt), this.selectedInvitees.map(user => user.id))
      .subscribe({
        next: availability => {
          this.availability = availability;
        },
        error: () => {
          this.availability = [];
        }
      });
  }

  saveEvent(): void {
    this.createError = null;

    if (!this.createForm.title.trim()) {
      this.createError = 'Title is required.';
      return;
    }

    if (!this.createForm.startAt || !this.createForm.endAt) {
      this.createError = 'Start and end time are required.';
      return;
    }

    if (new Date(this.createForm.endAt).getTime() <= new Date(this.createForm.startAt).getTime()) {
      this.createError = 'End time must be after start time.';
      return;
    }

    const payload: CalendarCreateEventRequest = {
      title: this.createForm.title.trim(),
      description: this.createForm.description.trim() || undefined,
      eventType: this.createForm.eventType,
      location: this.createForm.location.trim() || undefined,
      startAt: this.toIsoLocalDateTime(this.createForm.startAt),
      endAt: this.toIsoLocalDateTime(this.createForm.endAt),
      attendeeIds: this.selectedInvitees.map(user => user.id)
    };

    this.creatingEvent = true;
    this.calendarService.createEvent(payload).subscribe({
      next: () => {
        this.creatingEvent = false;
        this.closeCreatePanel();
        this.refreshCalendar();
      },
      error: error => {
        this.creatingEvent = false;
        this.createError = error?.error?.message || 'Unable to create the event. Please try again.';
      }
    });
  }

  async deleteEvent(event: CalendarEvent): Promise<void> {
    if (!event.editable || event.source !== 'CUSTOM') {
      return;
    }

    const confirmed = await this.popupService.confirm({
      title: 'Delete Event',
      message: `Delete event "${event.title}"?`,
      confirmText: 'Delete',
      danger: true
    });
    if (!confirmed) {
      return;
    }

    this.calendarService.deleteEvent(event.id).subscribe({
      next: () => this.refreshCalendar(),
      error: () => {
        this.eventsError = 'Failed to delete event.';
      }
    });
  }

  formatTimeLabel(dateInput: string): string {
    const date = new Date(dateInput);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  monthLabel(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  dayNumber(day: CalendarDay): number {
    return day.date.getDate();
  }

  eventBadgeClass(event: CalendarEvent): string {
    return `type-${event.eventType.toLowerCase()}`;
  }

  availabilityClass(entry: CalendarAvailability): string {
    return entry.availabilityStatus === 'FREE' ? 'availability-free' : 'availability-busy';
  }

  private buildCalendarDays(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const mondayOffset = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - mondayOffset);

    const totalCells = 42;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.calendarDays = Array.from({ length: totalCells }, (_, index) => {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + index);
      cellDate.setHours(0, 0, 0, 0);

      return {
        date: cellDate,
        isCurrentMonth: cellDate.getMonth() === month,
        isToday: cellDate.getTime() === today.getTime()
      };
    });

    if (this.selectedDate.getMonth() !== month || this.selectedDate.getFullYear() !== year) {
      this.selectedDate = new Date(monthStart);
    }

    if (monthEnd < monthStart) {
      this.calendarDays = [];
    }
  }

  private loadEventsForVisibleGrid(): void {
    if (this.calendarDays.length === 0) {
      this.events = [];
      return;
    }

    const gridStart = new Date(this.calendarDays[0].date);
    gridStart.setHours(0, 0, 0, 0);

    const gridEnd = new Date(this.calendarDays[this.calendarDays.length - 1].date);
    gridEnd.setHours(23, 59, 59, 999);

    this.loadingEvents = true;
    this.eventsError = null;

    this.calendarService.getEvents(this.toIsoLocalDateTime(gridStart), this.toIsoLocalDateTime(gridEnd)).subscribe({
      next: events => {
        this.events = events;
        this.loadingEvents = false;
      },
      error: () => {
        this.events = [];
        this.loadingEvents = false;
        this.eventsError = 'Failed to load calendar events.';
      }
    });
  }

  private seedDateTimeFields(): void {
    const base = new Date(this.selectedDate);
    base.setHours(10, 0, 0, 0);

    const end = new Date(base);
    end.setHours(end.getHours() + 1);

    this.createForm = {
      title: '',
      description: '',
      eventType: 'MEETING',
      location: '',
      startAt: this.toDateTimeLocalValue(base),
      endAt: this.toDateTimeLocalValue(end)
    };
  }

  private toDateTimeLocalValue(date: Date): string {
    const pad = (value: number): string => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private toIsoLocalDateTime(input: string | Date): string {
    const date = input instanceof Date ? input : new Date(input);
    const pad = (value: number): string => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private isSameDay(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear()
      && first.getMonth() === second.getMonth()
      && first.getDate() === second.getDate();
  }
}
