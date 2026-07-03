import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ChatbotService } from '../../../core/services/chatbot.service';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatChipSet,
    MatChip,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent {
  private readonly chatbotService = inject(ChatbotService);
  private messageIdCounter = 0;

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([
    {
      id: this.messageIdCounter++,
      text: "Bonjour ! Je suis là pour vous aider avec les offres d'emploi. Comment puis-je vous assister ?",
      isUser: false,
    },
  ]);
  userInput = '';
  protected readonly suggestions = [
    'Comment postuler ?',
    'Voir les offres',
    'Demander un entretien',
  ];

  toggleChat(): void {
    this.isOpen.update((open) => !open);
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text) return;

    this.messages.update((msgs) => [...msgs, { id: this.messageIdCounter++, text, isUser: true }]);
    this.userInput = '';

    this.chatbotService.ask(text).subscribe((response: string) => {
      this.messages.update((msgs) => [
        ...msgs,
        { id: this.messageIdCounter++, text: response, isUser: false },
      ]);
    });
  }

  protected useSuggestion(suggestion: string): void {
    this.userInput = suggestion;
    this.sendMessage();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  protected trackByMessageId(_index: number, message: ChatMessage): number {
    return message.id;
  }
}
