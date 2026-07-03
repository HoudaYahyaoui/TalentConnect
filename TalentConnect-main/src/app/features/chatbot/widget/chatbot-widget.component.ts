import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatbotAdapter } from '../../../data-access/api/adapters/chatbot.adapter';
import { ChatMessage, ChatResponse } from '../../../data-access/models/chatbot.models';
import { AuthFacade } from '../../../core/services/auth.facade';
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
  ],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private readonly chatbotAdapter = inject(ChatbotAdapter);
  private readonly authFacade = inject(AuthFacade);
  private readonly toast = inject(ToastService);

  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly messageControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  protected readonly isLoading = signal(false);
  protected readonly userId = signal<string | null>(null);

  ngOnInit(): void {
    this.userId.set(this.authFacade.user()?.id ?? null);
    if (this.userId()) {
      this.loadChatHistory();
    } else {
      this.toast.open('Impossible de charger le chatbot: utilisateur non identifié.', 'OK', { duration: 5000 });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      // Handle error if scrollContainer is not available
    }
  }

  loadChatHistory(): void {
    const currentUserId = this.userId();
    if (!currentUserId) return;

    this.isLoading.set(true);
    this.chatbotAdapter.getHistory(currentUserId).subscribe({
      next: (historyPage) => {
        this.messages.set(historyPage.content.reverse()); // Display in chronological order
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
      id: `temp-${Date.now()}`, // Temporary ID
      userId: currentUserId,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toISOString(),
    };

    this.messages.update((msgs) => [...msgs, userMessage]);
    this.messageControl.disable();
    this.isLoading.set(true);

    this.chatbotAdapter.ask(userMessageText).subscribe({
      next: (response: ChatResponse) => {
        const botMessage: ChatMessage = {
          id: response.chatMessage?.id || `bot-${Date.now()}`,
          userId: currentUserId,
          sender: 'bot',
          text: response.answer,
          timestamp: new Date().toISOString(),
          intent: response.intent,
          sources: response.sources,
        };
        this.messages.update((msgs) => [...msgs, botMessage]);
        this.messageControl.setValue('');
        this.messageControl.enable();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to send message to chatbot', err);
        this.toast.open('Erreur lors de l\'envoi du message au chatbot.', 'OK', { duration: 3000 });
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
