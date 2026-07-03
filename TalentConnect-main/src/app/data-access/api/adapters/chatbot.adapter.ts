import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChatbotReply } from '../../models/portal.models';

/** Reponse brute du chatbot-service */
interface BackendChatResponse {
  reply?: string;
  message?: string;
  response?: string;
  text?: string;
  answer?: string;
  content?: string;
  suggestions?: string[];
  intent?: string;
  sources?: string[];
}

const CHATBOT_BASE = environment.services.chatbot;

const FALLBACK_REPLY: ChatbotReply = {
  answer: "Je n'ai pas pu contacter l'assistant. Veuillez reessayer.",
  intent: 'HELP',
  suggestions: ['Voir les offres ouvertes', 'Contacter RH'],
  sources: ['Assistant TalentConnect'],
};

function extractAnswer(raw: BackendChatResponse): string {
  return raw.answer ?? raw.reply ?? raw.message ?? raw.response ?? raw.text ?? raw.content ?? '';
}

@Injectable({ providedIn: 'root' })
export class ChatbotAdapter {
  private readonly http = inject(HttpClient);

  ask(question: string): Observable<ChatbotReply> {
    const raw = localStorage.getItem('tc_user');
    const userId: string = raw ? `user-${(JSON.parse(raw) as { id?: string }).id ?? '0'}` : 'user-0';

    return this.http
      .post<BackendChatResponse>(`${CHATBOT_BASE}/chatbot/messages`, { userId, message: question })
      .pipe(
        map((res) => ({
          answer: extractAnswer(res) || "Desole, je n'ai pas de reponse a cette question.",
          intent: (res.intent as ChatbotReply['intent']) ?? 'HELP',
          suggestions: res.suggestions ?? ['Voir les offres', 'Contacter RH'],
          sources: res.sources ?? ['Assistant TalentConnect'],
        })),
        catchError(() => of(FALLBACK_REPLY)),
      );
  }

  getHistory(userId: string, page = 0, size = 20): Observable<{ role: 'bot' | 'user'; text: string; createdAt?: string }[]> {
    // Backend returns a PageResponse: { content: [{sender:'USER'|'BOT', message, createdAt(no Z), ...}] }
    type HistoryItem = { sender?: string; role?: string; message?: string; text?: string; content?: string; createdAt?: string };
    type HistoryResponse = HistoryItem[] | { content: HistoryItem[] };

    return this.http
      .get<HistoryResponse>(
        `${CHATBOT_BASE}/chatbot/history/${userId}`,
        { params: { page: String(page), size: String(size) } },
      )
      .pipe(
        map((res) => {
          const items: HistoryItem[] = Array.isArray(res) ? res : (res as { content: HistoryItem[] }).content ?? [];
          return items.map((m) => ({
            role: (
              (m.sender ?? m.role ?? '').toUpperCase() === 'BOT' ? 'bot' : 'user'
            ) as 'bot' | 'user',
            text: m.message ?? m.text ?? m.content ?? '',
            // Normalize LocalDateTime (no Z) → UTC ISO string
            createdAt: m.createdAt ? (m.createdAt.endsWith('Z') ? m.createdAt : m.createdAt + 'Z') : undefined,
          }));
        }),
        catchError(() => of([])),
      );
  }

  clearHistory(userId: string): Observable<void> {
    return this.http
      .delete<void>(`${CHATBOT_BASE}/chatbot/history/${userId}`)
      .pipe(catchError(() => of(undefined as unknown as void)));
  }
}
