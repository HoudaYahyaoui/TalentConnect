import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ChatbotAdapter } from '../../../data-access/api/adapters/chatbot.adapter';
import { ChatMessage, ConversationResponse, ChatResponse } from '../../../data-access/models/chatbot.models';
import { SessionStore } from '../../../core/state/session.store';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private readonly chatbotAdapter = inject(ChatbotAdapter);
  private readonly sessionStore = inject(SessionStore);
  private readonly toast = inject(ToastService);

  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly messageControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  protected readonly isLoading = signal(false);
  protected readonly userId = signal<string | null>(null);

  // État d'ouverture/fermeture du panneau de chat
  protected readonly isOpen = signal(false);

  // Suggestions rapides affichées sous forme de chips
  protected readonly suggestions = signal<string[]>([
    'Voir les offres disponibles',
    'Statut de ma candidature',
    'Comment fonctionne la cooptation ?',
  ]);

  ngOnInit(): void {
    const currentUserId = this.sessionStore.user()?.id;
    if (currentUserId) {
      this.userId.set(currentUserId);
      this.loadChatHistory(currentUserId);
    } else {
      this.toast.open('Impossible de charger le chatbot: utilisateur non identifié.', 'OK', { duration: 5000 });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // Handle error if scrollContainer is not available
      console.warn('Scroll container not available for chatbot widget:', err);
    }
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  loadChatHistory(userId: string): void {
    this.isLoading.set(true);
    this.chatbotAdapter.getHistory(userId).subscribe({
      next: (historyPage) => {
        const mappedMessages: ChatMessage[] = [];
        historyPage.content.forEach(item => {
          // User message
          mappedMessages.push({
            id: `user-hist-${item.timestamp}-${Math.random().toString(36).substring(7)}`,
            userId: item.userId,
            sender: 'user',
            text: item.userMessage,
            timestamp: item.timestamp,
          });
          // Bot response
          mappedMessages.push({
            id: `bot-hist-${item.timestamp}-${Math.random().toString(36).substring(7)}`,
            userId: item.userId,
            sender: 'bot',
            text: item.chatbotResponse,
            timestamp: item.timestamp,
          });
        });
        this.messages.set(mappedMessages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load chat history', err);
        this.toast.open('Erreur lors du chargement de l\'historique du chat.', 'OK', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  sendMessage(): void {
    const userMessageText = this.messageControl.value.trim();
    if (!userMessageText || this.isLoading()) {
      return;
    }

    const currentUserId = this.userId();
    if (!currentUserId) {
      this.toast.open('Utilisateur non identifié. Veuillez vous reconnecter.', 'OK', { duration: 5000 });
      return;
    }

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      userId: currentUserId,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toISOString(),
    };

    this.messages.update((msgs) => [...msgs, userMessage]);
    this.messageControl.disable();
    this.isLoading.set(true);



    this.chatbotAdapter.ask(currentUserId, userMessageText).subscribe({
      next: (response: ChatResponse) => {
        console.log('Chatbot response received by component:', response);
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          userId: currentUserId,
          sender: 'bot',
          text: response.answer,
          timestamp: new Date().toISOString(),
          intent: response.intent,
          sources: response.sources,
        };
        this.messages.update((msgs) => [...msgs, botMessage]);
        console.log('Messages signal after bot message:', this.messages()); // Add this line
        this.messageControl.setValue('');
        this.messageControl.enable();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to send message to chatbot', err);
        this.toast.open("Erreur lors de l'envoi du message au chatbot.", 'OK', { duration: 3000 });
        this.messageControl.enable();
        this.isLoading.set(false);
      },
    });
  }

  sendSuggestion(suggestion: string): void {
    this.messageControl.setValue(suggestion);
    this.sendMessage();
  }
}
