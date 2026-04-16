import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  MessengerConversation,
  MessengerMessage,
  MessengerParticipant,
  MessengerService
} from '../../shared/services/messenger.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {
  currentUserId: string | null = null;

  conversations: MessengerConversation[] = [];
  allowedContacts: MessengerParticipant[] = [];
  selectedConversation: MessengerConversation | null = null;
  messages: MessengerMessage[] = [];

  loadingConversations = false;
  loadingContacts = false;
  loadingMessages = false;
  sendingMessage = false;

  errorMessage: string | null = null;

  conversationSearch = '';
  contactSearch = '';
  messageDraft = '';

  creatingConversationId: string | null = null;

  private pollSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;
  private routeSubscription: Subscription | null = null;
  private pendingConversationId: string | null = null;

  constructor(
    private readonly messengerService: MessengerService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id ?? null;

    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id ?? null;
    });

    this.routeSubscription = this.route.queryParamMap.subscribe(params => {
      this.pendingConversationId = params.get('conversationId');
      if (this.pendingConversationId && this.conversations.length > 0) {
        this.selectPendingConversation(this.conversations);
      }
    });

    this.loadConversations(true);
    this.loadAllowedContacts();

    this.pollSubscription = interval(7000).subscribe(() => {
      this.loadConversations(false);
      if (this.selectedConversation?.id) {
        this.loadMessages(this.selectedConversation.id, false);
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  filteredConversations(): MessengerConversation[] {
    const query = this.conversationSearch.trim().toLowerCase();
    if (!query) {
      return this.conversations;
    }

    return this.conversations.filter(conversation => {
      const title = this.getConversationTitle(conversation).toLowerCase();
      const preview = (conversation.lastMessagePreview ?? '').toLowerCase();
      return title.includes(query) || preview.includes(query);
    });
  }

  filteredContacts(): MessengerParticipant[] {
    const query = this.contactSearch.trim().toLowerCase();

    return this.allowedContacts
      .filter(contact => !this.currentUserId || contact.id !== this.currentUserId)
      .filter(contact => {
        if (!query) {
          return true;
        }

        return contact.fullName.toLowerCase().includes(query)
          || contact.email.toLowerCase().includes(query)
          || contact.role.toLowerCase().includes(query);
      });
  }

  loadConversations(selectFirstConversation: boolean): void {
    this.loadingConversations = this.conversations.length === 0;

    this.messengerService.getConversations().subscribe({
      next: conversations => {
        this.conversations = conversations;
        this.loadingConversations = false;

        if (conversations.length === 0) {
          this.selectedConversation = null;
          this.messages = [];
          return;
        }

        if (this.selectPendingConversation(conversations)) {
          return;
        }

        if (this.selectedConversation?.id) {
          const stillAvailable = conversations.find(item => item.id === this.selectedConversation?.id);
          if (stillAvailable) {
            this.selectedConversation = stillAvailable;
            return;
          }
        }

        if (selectFirstConversation || !this.selectedConversation) {
          this.openConversation(conversations[0]);
        }
      },
      error: () => {
        this.loadingConversations = false;
        this.errorMessage = 'Unable to load conversations.';
      }
    });
  }

  loadAllowedContacts(): void {
    this.loadingContacts = true;

    this.messengerService.getAllowedContacts().subscribe({
      next: contacts => {
        this.allowedContacts = contacts;
        this.loadingContacts = false;
      },
      error: () => {
        this.loadingContacts = false;
        this.errorMessage = 'Unable to load allowed contacts.';
      }
    });
  }

  openConversation(conversation: MessengerConversation): void {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id, true);
  }

  startDirectConversation(contact: MessengerParticipant): void {
    this.creatingConversationId = contact.id;
    this.errorMessage = null;

    this.messengerService.startDirectConversation(contact.id).subscribe({
      next: conversation => {
        this.creatingConversationId = null;
        this.selectedConversation = conversation;
        this.contactSearch = '';
        this.loadConversations(false);
        this.loadMessages(conversation.id, true);
      },
      error: error => {
        this.creatingConversationId = null;
        this.errorMessage = error?.error?.message ?? 'Unable to start conversation.';
      }
    });
  }

  loadMessages(conversationId: string, showLoader: boolean): void {
    if (showLoader) {
      this.loadingMessages = true;
    }

    this.messengerService.getMessages(conversationId).subscribe({
      next: messages => {
        this.messages = messages;
        if (showLoader) {
          this.loadingMessages = false;
        }
      },
      error: () => {
        if (showLoader) {
          this.loadingMessages = false;
        }
        this.errorMessage = 'Unable to load messages.';
      }
    });
  }

  sendMessage(): void {
    if (!this.selectedConversation?.id) {
      return;
    }

    const content = this.messageDraft.trim();
    if (!content) {
      return;
    }

    this.sendingMessage = true;
    this.errorMessage = null;

    this.messengerService.sendMessage(this.selectedConversation.id, content).subscribe({
      next: message => {
        this.sendingMessage = false;
        this.messageDraft = '';
        this.messages = [...this.messages, message];
        this.updateConversationPreview(this.selectedConversation?.id ?? '', message.content, message.sentAt);
        this.loadConversations(false);
      },
      error: error => {
        this.sendingMessage = false;
        this.errorMessage = error?.error?.message ?? 'Unable to send message.';
      }
    });
  }

  onComposerEnter(event: Event): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    if (event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.sendMessage();
  }

  isOwnMessage(message: MessengerMessage): boolean {
    return !!this.currentUserId && message.senderId === this.currentUserId;
  }

  getConversationTitle(conversation: MessengerConversation): string {
    if (conversation.type !== 'DIRECT') {
      return conversation.title;
    }

    if (!this.currentUserId) {
      return conversation.title;
    }

    const otherParticipant = conversation.participants.find(participant => participant.id !== this.currentUserId);
    return otherParticipant?.fullName ?? conversation.title;
  }

  getConversationHint(conversation: MessengerConversation): string {
    if (conversation.lastMessagePreview && conversation.lastMessagePreview.trim().length > 0) {
      return conversation.lastMessagePreview;
    }

    if (conversation.type === 'GROUP') {
      return `${conversation.participants.length} participants`;
    }

    return 'Start the conversation';
  }

  getSelectedConversationMembers(): string {
    if (!this.selectedConversation) {
      return '';
    }

    if (this.selectedConversation.type === 'DIRECT') {
      return 'Direct conversation';
    }

    return this.selectedConversation.participants
      .map(participant => participant.fullName)
      .join(', ');
  }

  trackConversation(_index: number, conversation: MessengerConversation): string {
    return conversation.id;
  }

  trackMessage(_index: number, message: MessengerMessage): string {
    return message.id;
  }

  trackContact(_index: number, contact: MessengerParticipant): string {
    return contact.id;
  }

  private updateConversationPreview(conversationId: string, content: string, sentAt: string): void {
    this.conversations = this.conversations.map(conversation => {
      if (conversation.id !== conversationId) {
        return conversation;
      }

      return {
        ...conversation,
        lastMessagePreview: content,
        lastMessageAt: sentAt
      };
    });

    if (this.selectedConversation?.id === conversationId) {
      this.selectedConversation = {
        ...this.selectedConversation,
        lastMessagePreview: content,
        lastMessageAt: sentAt
      };
    }
  }

  private selectPendingConversation(conversations: MessengerConversation[]): boolean {
    if (!this.pendingConversationId) {
      return false;
    }

    const pendingConversation = conversations.find(conversation => conversation.id === this.pendingConversationId);
    if (!pendingConversation) {
      return false;
    }

    this.pendingConversationId = null;
    this.openConversation(pendingConversation);
    return true;
  }
}
