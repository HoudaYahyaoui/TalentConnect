import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { ChatbotAdapter } from '../../../data-access/api/adapters/chatbot.adapter';
import { SessionStore } from '../../../core/state/session.store';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  sources?: string[];
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
  ],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotWidgetComponent {
  private readonly chatbotAdapter = inject(ChatbotAdapter);
  private readonly sessionStore = inject(SessionStore);

  protected readonly isOpen = signal(false);
  protected readonly question = signal('');
  protected readonly sending = signal(false);
  protected readonly suggestions = signal([
    'Montre-moi les offres Angular',
    'Comment recommander un profil ?',
    'Comprendre les statuts',
  ]);
  protected readonly messages = signal<ChatMessage[]>([
    {
      role: 'bot',
      text: 'Bonjour, je suis l’assistant TalentConnect. Je peux vous aider sur les postes, la mobilité interne, la cooptation et le suivi des candidatures.',
      sources: ['Assistant TalentConnect'],
    },
  ]);

  constructor() {
    this.loadHistory();
  }

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }

  protected sendMessage(value?: string): void {
    const payload = (value ?? this.question()).trim();
    if (!payload) return;

    this.messages.update((items) => [...items, { role: 'user', text: payload }]);
    this.question.set('');
    this.sending.set(true);

    this.chatbotAdapter.ask(payload).subscribe((reply) => {
      this.messages.update((items) => [
        ...items,
        { role: 'bot', text: reply.answer, sources: reply.sources },
      ]);
      this.suggestions.set(reply.suggestions);
      this.sending.set(false);
    });
  }

  private loadHistory(): void {
    const user = this.sessionStore.user();
    if (!user?.id) return;

    this.chatbotAdapter.getHistory(`user-${user.id}`, 0, 20).subscribe((history) => {
      if (!history.length) return;
      this.messages.set([
        {
          role: 'bot',
          text: 'Historique chargé depuis le backend. Vous pouvez reprendre la conversation.',
          sources: ['chatbot-service'],
        },
        ...history.map((item) => ({ role: item.role, text: item.text })),
      ]);
    });
  }
}
