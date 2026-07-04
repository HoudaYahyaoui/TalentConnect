import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../http/api-http.service';
import {
  ChatResponse,
  ChatHistoryPage,
  ChatMessage,
  ConversationResponse,
} from '../../models/chatbot.models';

// Mapping entre les intents backend (ChatbotEngine / ChatbotService) et l'union frontend
function toFrontendIntent(backendIntent: string): ChatResponse['intent'] {
  switch (backendIntent) {
    case 'job_search':
    case 'job_search_live':
      return 'JOB';
    case 'application':
      return 'STATUS';
    case 'support':
      return 'HELP';
    case 'user_context':
      return 'STATUS'; // ou 'HELP' selon ce que tu préfères pour candidatures/profil
    // 'greeting', 'career', 'benefits', 'company', 'goodbye', 'fallback' n'ont pas d'équivalent -> UNKNOWN
    default:
      return 'UNKNOWN';
  }
}

@Injectable({ providedIn: 'root' })
export class ChatbotAdapter {
  private readonly api = inject(ApiHttpService);
  private readonly chatbotBaseUrl = 'chatbot';

  ask(userId: string, message: string): Observable<ChatResponse> {
    return this.api
      .postTo<{
        userId: string;
        message: string;
        response: string;
        intent: string;
        createdAt: string;
      }>(this.api.chatbotBase, `${this.chatbotBaseUrl}/messages`, { userId, message })
      .pipe(
        map((backendResponse) => ({
          answer: backendResponse.response,
          intent: toFrontendIntent(backendResponse.intent),
          suggestions: [],
          sources: [],
        })),
      );
  }

  getHistory(userId: string, page: number = 0, size: number = 20): Observable<ChatHistoryPage> {
    const params = { page: page.toString(), size: size.toString() };
    return this.api.getFrom<ChatHistoryPage>(
      this.api.chatbotBase,
      `${this.chatbotBaseUrl}/history/${userId}`,
      params,
    );
  }
}
