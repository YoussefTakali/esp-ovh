import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MessengerParticipant {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface MessengerConversation {
  id: string;
  title: string;
  type: 'DIRECT' | 'GROUP';
  projectId?: string;
  groupId?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  participants: MessengerParticipant[];
}

export interface MessengerMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  sentAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessengerService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/messenger`;

  constructor(private readonly http: HttpClient) {}

  getConversations(): Observable<MessengerConversation[]> {
    return this.http.get<MessengerConversation[]>(`${this.apiUrl}/conversations`);
  }

  getMessages(conversationId: string): Observable<MessengerMessage[]> {
    return this.http.get<MessengerMessage[]>(`${this.apiUrl}/conversations/${conversationId}/messages`);
  }

  getAllowedContacts(): Observable<MessengerParticipant[]> {
    return this.http.get<MessengerParticipant[]>(`${this.apiUrl}/contacts/allowed`);
  }

  startDirectConversation(targetUserId: string): Observable<MessengerConversation> {
    return this.http.post<MessengerConversation>(`${this.apiUrl}/conversations/direct`, { targetUserId });
  }

  sendMessage(conversationId: string, content: string): Observable<MessengerMessage> {
    return this.http.post<MessengerMessage>(`${this.apiUrl}/conversations/${conversationId}/messages`, { content });
  }
}
